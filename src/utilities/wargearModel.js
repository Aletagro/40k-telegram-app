import find from 'lodash/find'
import filter from 'lodash/filter'
import map from 'lodash/map'
import sum from 'lodash/sum'
import sumBy from 'lodash/sumBy'
import sortBy from 'lodash/sortBy'
import groupBy from 'lodash/groupBy'
import forEach from 'lodash/forEach'
import keyBy from 'lodash/keyBy'

const dataBase = require('./db')

/*
 * Выбор снаряжения отряда.
 *
 * В базе у каждой миниатюры есть несколько "слотов" (loadout_choice_set). В каждом слоте модель берёт ровно один
 * из вариантов (loadout_choice) - набор оружия. Итоговое снаряжение модели - сумма выбранных вариантов по всем слотам.
 * Слот без миниатюры (miniatureId = null) относится ко всему отряду и разрешает взять `limit` вариантов.
 * Ограничения на спец. оружие лежат в limited_wargear_choice_set + wargear_limit: сколько моделей отряда
 * могут взять такой вариант в зависимости от размера отряда.
 *
 * В ростере хранится только отличие от варианта по умолчанию:
 *   unit.loadouts = {[miniatureId | 'unit']: {[slotId]: {[choiceId]: сколько моделей}}}
 * Вариант по умолчанию (соответствует base_miniature_loadout) получает остаток моделей.
 */

const UNIT_KEY = 'unit'

let index = null

const getIndex = () => {
    if (!index) {
        const data = dataBase.data
        index = {
            sets: groupBy(data.loadout_choice_set, 'datasheetId'),
            choices: groupBy(data.loadout_choice, 'loadoutChoiceSetId'),
            choiceItems: groupBy(data.loadout_choice_wargear_item, 'loadoutChoiceId'),
            base: groupBy(data.base_miniature_loadout, 'datasheetId'),
            baseOptions: groupBy(data.base_miniature_loadout_wargear_option, 'baseMiniatureLoadoutId'),
            options: keyBy(data.wargear_option, 'id'),
            limitSets: groupBy(data.limited_wargear_choice_set, 'datasheetId'),
            limitChoices: groupBy(data.limited_wargear_choice, 'limitedWargearChoiceSetId'),
            limitChoiceItems: groupBy(data.limited_wargear_choice_wargear_item, 'limitedWargearChoiceId'),
            limits: groupBy(data.wargear_limit, 'limitedWargearChoiceSetId'),
            items: keyBy(data.wargear_item, 'id'),
            miniatures: keyBy(data.miniature, 'id')
        }
    }
    return index
}

const cache = {}

const addTo = (counts, id, count) => {
    counts[id] = (counts[id] || 0) + count
}

const getChoiceLabel = (items) => items.length
    ? map(items, ({name, count}) => count > 1 ? `${count}× ${name}` : name).join(' + ')
    : 'None'

const getChoiceKey = (items) => map(items, ({id, count}) => `${id}:${count}`).sort().join('|')

const getMiniatureIds = (datasheetId) => {
    const ids = new Set()
    forEach(filter(dataBase.data.unit_composition, ['datasheetId', datasheetId]), composition => {
        forEach(filter(dataBase.data.unit_composition_miniature, ['unitCompositionId', composition.id]), item => ids.add(item.miniatureId))
    })
    return ids
}

const buildChoices = (setId) => {
    const ix = getIndex()
    const seen = new Set()
    const result = []
    forEach(ix.choices[setId], choice => {
        const counts = {}
        forEach(ix.choiceItems[choice.id], item => addTo(counts, item.wargearItemId, item.count))
        const items = sortBy(map(counts, (count, id) => ({id, count, name: ix.items[id]?.name || ''})), 'name')
        const key = getChoiceKey(items)
        // В базе встречаются одинаковые варианты - оставляем один
        if (seen.has(key)) return
        seen.add(key)
        result.push({id: choice.id, items, label: getChoiceLabel(items), isEmpty: !items.length})
    })
    return result
}

// "Парные" варианты (alternate) заменяют обычный слот: добавляем их в слот с похожим оружием
const mergeAlternates = (sets) => {
    const regular = filter(sets, set => !set.alternate)
    const standalone = []
    forEach(filter(sets, 'alternate'), alt => {
        const altNames = map(alt.choices.flatMap(choice => choice.items), item => item.name.toLowerCase())
        const target = find(regular, set => set.miniatureId === alt.miniatureId
            && set.choices.some(choice => choice.items.some(item => altNames.some(name => name.includes(item.name.toLowerCase())))))
        if (target) {
            target.choices = [...target.choices, ...alt.choices]
        } else {
            standalone.push({...alt, choices: [{id: `${alt.id}:none`, items: [], label: 'None', isEmpty: true}, ...alt.choices]})
        }
    })
    return [...regular, ...standalone]
}

// Сумма предметов, которая остаётся из базового набора после выбора вариантов по умолчанию
const takeFromBase = (remaining, choice) => {
    forEach(choice.items, ({id, count}) => { remaining[id] -= count })
}

const fitsBase = (remaining, choice) => !choice.items.some(({id, count}) => (remaining[id] || 0) < count)

const pickDefault = (slot, remaining) => {
    if (slot.isUnitLevel || !remaining) {
        return find(slot.choices, 'isEmpty') || slot.choices[0]
    }
    let best = null
    forEach(slot.choices, choice => {
        if (fitsBase(remaining, choice) && (!best || sumBy(choice.items, 'count') > sumBy(best.items, 'count'))) best = choice
    })
    return best || find(slot.choices, 'isEmpty') || slot.choices[0]
}

const buildDatasheet = (datasheetId) => {
    const ix = getIndex()
    const miniatureIds = getMiniatureIds(datasheetId)
    const rawSets = []
    forEach(ix.sets[datasheetId], set => {
        if (set.miniatureId && !miniatureIds.has(set.miniatureId)) return
        const choices = buildChoices(set.id)
        if (choices.length) rawSets.push({id: set.id, miniatureId: set.miniatureId, limit: set.limit || 1, alternate: set.alternate, choices})
    })

    // Базовое снаряжение миниатюр
    const bases = {}
    forEach(ix.base[datasheetId], base => {
        const counts = {}
        forEach(ix.baseOptions[base.id], item => {
            const option = ix.options[item.wargearOptionId]
            if (option) addTo(counts, option.wargearItemId, item.count)
        })
        bases[base.miniatureId] = counts
    })

    const slots = []
    forEach(mergeAlternates(rawSets), set => {
        if (!set.miniatureId) {
            slots.push({id: set.id, miniatureId: null, key: UNIT_KEY, isUnitLevel: true, limit: set.limit, choices: set.choices})
            return
        }
        // Модель берёт по одному варианту `limit` раз (например две ракеты Seeker на технику)
        for (let i = 0; i < set.limit; i++) {
            slots.push({id: set.limit > 1 ? `${set.id}:${i}` : set.id, miniatureId: set.miniatureId, key: set.miniatureId, isUnitLevel: false, choices: set.choices})
        }
    })

    const remainingByMiniature = {}
    forEach(slots, slot => {
        let remaining = null
        if (!slot.isUnitLevel && bases[slot.miniatureId]) {
            remaining = remainingByMiniature[slot.miniatureId] || (remainingByMiniature[slot.miniatureId] = {...bases[slot.miniatureId]})
        }
        slot.defaultId = pickDefault(slot, remaining)?.id
        if (remaining) takeFromBase(remaining, find(slot.choices, ['id', slot.defaultId]))
    })

    // Предметы базового набора, не попавшие ни в один слот (оружие без вариантов)
    const staticItems = {}
    forEach(bases, (remaining, miniatureId) => {
        const left = remainingByMiniature[miniatureId] || remaining
        staticItems[miniatureId] = filter(map(left, (count, id) => ({id, count})), ({count}) => count > 0)
    })

    // Ограничения на количество моделей с особым оружием
    const limits = []
    forEach(ix.limitSets[datasheetId], limitSet => {
        const tiers = sortBy(ix.limits[limitSet.id] || [], 'modelCount')
        if (!tiers.length) return
        const patterns = map(ix.limitChoices[limitSet.id], choice => {
            const counts = {}
            forEach(ix.limitChoiceItems[choice.id], item => addTo(counts, item.wargearItemId, item.count))
            return counts
        })
        const matched = []
        forEach(slots, slot => {
            if (limitSet.miniatureId && slot.miniatureId !== limitSet.miniatureId) return
            forEach(slot.choices, choice => {
                const counts = {}
                forEach(choice.items, ({id, count}) => addTo(counts, id, count))
                const isMatch = patterns.some(pattern => Object.keys(pattern).length
                    && !Object.keys(pattern).some(id => (counts[id] || 0) < pattern[id]))
                if (isMatch) matched.push({slotId: slot.id, choiceId: choice.id})
            })
        })
        if (!matched.length) return
        limits.push({
            id: limitSet.id,
            matched,
            patterns,
            // Есть варианты из нескольких предметов (например "хевик + спец-оружие" на двух моделях): тогда это набор разрешённых сочетаний на весь отряд
            isCombo: patterns.some(pattern => Object.keys(pattern).length > 1 || Object.values(pattern).some(count => count > 1)),
            // Названия вариантов, к которым относится ограничение (для подсказки игроку)
            names: map(ix.limitChoices[limitSet.id], choice => getChoiceLabel(sortBy(map(ix.limitChoiceItems[choice.id], item => ({
                name: ix.items[item.wargearItemId]?.name || '',
                count: item.count
            })), 'name'))),
            tiers,
            duplicateLimit: tiers.find(tier => tier.duplicateLimit)?.duplicateLimit || null
        })
    })

    return {slots, limits, staticItems}
}

export const getWargear = (datasheetId) => {
    if (!cache[datasheetId]) cache[datasheetId] = buildDatasheet(datasheetId)
    return cache[datasheetId]
}

// --- Расчёты по юниту ростера ---

// Сколько моделей каждой миниатюры в выбранном составе
export const getMiniatureCounts = (unit) => {
    const result = {}
    forEach(filter(dataBase.data.unit_composition_miniature, ['unitCompositionId', unit.compositionId]), item => {
        if (item.max > 0) result[item.miniatureId] = unit.modelCounts?.[item.miniatureId] || item.min
    })
    return result
}

const getTotalModels = (unit) => sum(Object.values(getMiniatureCounts(unit)))

// Сколько вариантов нужно выбрать в слоте: по числу моделей миниатюры или `limit` для слота всего отряда
export const getSlotTotal = (unit, slot) => slot.isUnitLevel ? slot.limit : (getMiniatureCounts(unit)[slot.miniatureId] || 0)

const getStored = (unit, slot, choiceId) => unit.loadouts?.[slot.key]?.[slot.id]?.[choiceId] || 0

// {choiceId: сколько моделей}, вариант по умолчанию получает остаток
export const getSlotCounts = (unit, slot) => {
    let remaining = getSlotTotal(unit, slot)
    const counts = {}
    forEach(slot.choices, choice => {
        if (choice.id === slot.defaultId) return
        const value = Math.min(getStored(unit, slot, choice.id), remaining)
        counts[choice.id] = value
        remaining -= value
    })
    counts[slot.defaultId] = remaining
    return counts
}

// Слоты, в которых игроку есть что выбирать
export const getUnitSlots = (unit) => filter(getWargear(unit.datasheetId).slots, slot => slot.choices.length > 1 && getSlotTotal(unit, slot) > 0)

export const hasWargearOptions = (datasheetId) => getWargear(datasheetId).slots.some(slot => slot.choices.length > 1)

const getLimitValue = (limit, totalModels) => {
    let value = 0
    forEach(limit.tiers, tier => {
        if (totalModels >= tier.modelCount) value = tier.choiceLimit
    })
    return value
}

// Минимальное число разрешённых сочетаний (patterns), которыми покрывается набор оружия usage; Infinity, если больше max
const coverCount = (usage, patterns, max) => {
    let best = Infinity
    const walk = (left, used) => {
        if (used > max || used >= best) return
        const next = Object.keys(left).find(id => left[id] > 0)
        if (!next) {
            best = used
            return
        }
        forEach(patterns, pattern => {
            if (!pattern[next]) return
            const rest = {...left}
            forEach(Object.keys(pattern), id => { if (rest[id]) rest[id] = Math.max(0, rest[id] - pattern[id]) })
            walk(rest, used + 1)
        })
    }
    walk(usage, 0)
    return best
}

// Для набора сочетаний: сколько сочетаний нужно, чтобы покрыть выбранное оружие отряда (больше допустимого - значит нарушение)
const getComboUsage = (unit, limit, totalModels) => {
    const {slots} = getWargear(unit.datasheetId)
    const relevant = new Set(limit.patterns.flatMap(pattern => Object.keys(pattern)))
    const usage = {}
    forEach(limit.matched, ({slotId, choiceId}) => {
        const slot = find(slots, ['id', slotId])
        const models = slot ? getSlotCounts(unit, slot)[choiceId] || 0 : 0
        if (!models) return
        // Считаем только то, что сверх набора по умолчанию: оружие, которое и так есть у каждой модели (Busta Rokkit Launcha у Tankbustas), лимит не тратит
        const base = find(slot.choices, ['id', slot.defaultId])?.items || []
        forEach(find(slot.choices, ['id', choiceId])?.items, ({id, count}) => {
            const extra = count - (find(base, ['id', id])?.count || 0)
            if (relevant.has(id) && extra > 0) addTo(usage, id, extra * models)
        })
    })
    const allowed = getLimitValue(limit, totalModels)
    const used = coverCount(usage, limit.patterns, allowed)
    return used === Infinity ? allowed + 1 : used
}

const getLimitUsage = (unit, limit) => {
    if (limit.isCombo) return getComboUsage(unit, limit, getTotalModels(unit))
    const {slots} = getWargear(unit.datasheetId)
    return sumBy(limit.matched, ({slotId, choiceId}) => {
        const slot = find(slots, ['id', slotId])
        return slot ? getSlotCounts(unit, slot)[choiceId] || 0 : 0
    })
}

// Максимум моделей, которые могут взять этот вариант (с учётом остальных слотов и ограничений на оружие)
export const getChoiceMax = (unit, slot, choiceId) => {
    const counts = getSlotCounts(unit, slot)
    const current = counts[choiceId] || 0
    if (choiceId === slot.defaultId) return current
    let max = current + (counts[slot.defaultId] || 0)
    const totalModels = getTotalModels(unit)
    forEach(getWargear(unit.datasheetId).limits, limit => {
        if (!limit.matched.some(item => item.slotId === slot.id && item.choiceId === choiceId)) return
        if (limit.isCombo) {
            // Сочетания нелинейны: проверяем по одной модели, пока набор остаётся допустимым
            const allowed = getLimitValue(limit, totalModels)
            let count = current
            while (count < max && getComboUsage({...unit, loadouts: setStoredRaw(unit.loadouts, slot, choiceId, count + 1)}, limit, totalModels) <= allowed) count++
            max = Math.min(max, count)
        } else {
            const free = getLimitValue(limit, totalModels) - getLimitUsage(unit, limit)
            max = Math.min(max, current + Math.max(0, free))
        }
        if (limit.duplicateLimit) max = Math.min(max, limit.duplicateLimit)
    })
    return Math.max(0, max)
}

// Можно ли выбрать вариант в слоте одиночной модели (проверяются только ограничения на оружие, а не остаток моделей)
export const canSelectSingleChoice = (unit, slot, choiceId) => {
    const next = {...unit, loadouts: selectSingleChoice(unit, slot, choiceId)}
    const totalModels = getTotalModels(unit)
    return !find(getWargear(unit.datasheetId).limits, limit => limit.matched.some(item => item.slotId === slot.id && item.choiceId === choiceId)
        && getLimitUsage(next, limit) > getLimitValue(limit, totalModels))
}

// Ограничения, которые относятся к слоту: [{names, used, allowed, rules, duplicateLimit}]
export const getSlotLimitInfo = (unit, slot) => {
    const totalModels = getTotalModels(unit)
    return map(filter(getWargear(unit.datasheetId).limits, limit => limit.matched.some(item => item.slotId === slot.id)), limit => ({
        names: limit.names,
        used: getLimitUsage(unit, limit),
        allowed: getLimitValue(limit, totalModels),
        totalModels,
        tiers: map(limit.tiers, ({modelCount, choiceLimit}) => ({modelCount, choiceLimit})),
        duplicateLimit: limit.duplicateLimit
    }))
}

// Правила по каждому варианту слота (для окна с пояснением):
// [{choice, isDefault, limits: [{allowed, used, tiers, duplicateLimit, sharedWith}]}]
// Вариант без ограничений доступен любому числу моделей, вариант по умолчанию получает остаток
export const getSlotRules = (unit, slot) => {
    const totalModels = getTotalModels(unit)
    const {limits} = getWargear(unit.datasheetId)
    return map(slot.choices, choice => ({
        choice,
        isDefault: choice.id === slot.defaultId,
        limits: map(filter(limits, limit => limit.matched.some(item => item.slotId === slot.id && item.choiceId === choice.id)), limit => ({
            allowed: getLimitValue(limit, totalModels),
            used: getLimitUsage(unit, limit),
            tiers: map(limit.tiers, ({modelCount, choiceLimit}) => ({modelCount, choiceLimit})),
            duplicateLimit: limit.duplicateLimit,
            // Остальные варианты, делящие этот же лимит
            sharedWith: filter(limit.names, name => !choice.label.toLowerCase().includes(name.toLowerCase()))
        }))
    }))
}

// Возвращает новый loadouts с изменённым количеством моделей у варианта
export const setChoiceCount = (unit, slot, choiceId, value) => {
    const next = Math.max(0, Math.min(value, getChoiceMax(unit, slot, choiceId)))
    const loadouts = {...unit.loadouts}
    const bySlot = {...loadouts[slot.key]}
    const byChoice = {...bySlot[slot.id]}
    if (next > 0) byChoice[choiceId] = next
    else delete byChoice[choiceId]
    bySlot[slot.id] = byChoice
    loadouts[slot.key] = bySlot
    return loadouts
}

// Выбор одного варианта для всех моделей слота (для одиночных моделей)
export const selectSingleChoice = (unit, slot, choiceId) => {
    const loadouts = {...unit.loadouts}
    const bySlot = {...loadouts[slot.key]}
    bySlot[slot.id] = choiceId === slot.defaultId ? {} : {[choiceId]: getSlotTotal(unit, slot)}
    loadouts[slot.key] = bySlot
    return loadouts
}

// Приводит loadouts в порядок после смены размера отряда: лишние выборы снимаются, ограничения соблюдаются
export const sanitizeLoadouts = (unit) => {
    const {slots, limits} = getWargear(unit.datasheetId)
    let current = {...unit, loadouts: {}}
    forEach(slots, slot => {
        const counts = getSlotCounts(unit, slot)
        forEach(counts, (value, choiceId) => {
            if (choiceId !== slot.defaultId && value > 0) current = {...current, loadouts: setStoredRaw(current.loadouts, slot, choiceId, value)}
        })
    })
    const totalModels = getTotalModels(unit)
    const findLast = (state, limit) => [...limit.matched].reverse().find(({slotId, choiceId}) => {
        const slot = find(slots, ['id', slotId])
        return slot && choiceId !== slot.defaultId && getStored(state, slot, choiceId) > 0
    })
    forEach(limits, limit => {
        let guard = 100
        while (getLimitUsage(current, limit) > getLimitValue(limit, totalModels) && guard-- > 0) {
            const last = findLast(current, limit)
            if (!last) break
            const slot = find(slots, ['id', last.slotId])
            current = {...current, loadouts: setStoredRaw(current.loadouts, slot, last.choiceId, getStored(current, slot, last.choiceId) - 1)}
        }
    })
    return current.loadouts
}

const setStoredRaw = (loadouts, slot, choiceId, value) => {
    const next = {...loadouts}
    const bySlot = {...next[slot.key]}
    const byChoice = {...bySlot[slot.id]}
    if (value > 0) byChoice[choiceId] = value
    else delete byChoice[choiceId]
    bySlot[slot.id] = byChoice
    next[slot.key] = bySlot
    return next
}

// Что изменено относительно набора по умолчанию: [{miniature, count, label}]
export const getLoadoutChanges = (unit) => {
    const ix = getIndex()
    const changes = []
    forEach(getWargear(unit.datasheetId).slots, slot => {
        if (slot.choices.length < 2) return
        const counts = getSlotCounts(unit, slot)
        forEach(slot.choices, choice => {
            if (choice.id === slot.defaultId || !counts[choice.id]) return
            changes.push({
                miniature: slot.isUnitLevel ? '' : ix.miniatures[slot.miniatureId]?.name || '',
                count: counts[choice.id],
                label: choice.label
            })
        })
    })
    return changes
}

// Всё снаряжение отряда: {wargearItemId: сколько штук}. Нужно проверкам (например энхансменты, требующие оружие)
export const getUnitWargearItems = (unit) => {
    const result = {}
    const {slots, staticItems} = getWargear(unit.datasheetId)
    const miniatureCounts = getMiniatureCounts(unit)
    forEach(slots, slot => {
        const counts = getSlotCounts(unit, slot)
        forEach(slot.choices, choice => forEach(choice.items, ({id, count}) => addTo(result, id, count * (counts[choice.id] || 0))))
    })
    forEach(staticItems, (items, miniatureId) => {
        forEach(items, ({id, count}) => addTo(result, id, count * (miniatureCounts[miniatureId] || 0)))
    })
    return result
}

let costIndex = null
// Стоимость снаряжения: {datasheetId: {wargearItemId: points}} (wargear_option.points - доплата за каждую штуку)
const getCostIndex = () => {
    if (!costIndex) {
        const groups = keyBy(dataBase.data.wargear_option_group, 'id')
        costIndex = {}
        forEach(dataBase.data.wargear_option, option => {
            if (!option.points) return
            const datasheetId = groups[option.wargearOptionGroupId]?.datasheetId
            if (!datasheetId) return
            costIndex[datasheetId] = costIndex[datasheetId] || {}
            costIndex[datasheetId][option.wargearItemId] = Math.max(costIndex[datasheetId][option.wargearItemId] || 0, option.points)
        })
    }
    return costIndex
}

// Доплата за снаряжение сверх набора по умолчанию (например +10 за каждую Cyclone Missile Launcher)
export const getUnitWargearPoints = (unit) => {
    const costs = getCostIndex()[unit.datasheetId]
    if (!costs) return 0
    const items = getUnitWargearItems(unit)
    const base = getUnitWargearItems({...unit, loadouts: {}})
    return sumBy(Object.keys(costs), itemId => Math.max(0, (items[itemId] || 0) - (base[itemId] || 0)) * costs[itemId])
}

// Снаряжение отряда по моделям для экспорта: [{miniatureId, name, count, items: [{name, count}]}].
// Снаряжение на весь отряд (miniatureId пустой) идёт отдельной записью с count = 0
export const getUnitWargearByModel = (unit) => {
    const ix = getIndex()
    const {slots, staticItems} = getWargear(unit.datasheetId)
    const miniatureCounts = getMiniatureCounts(unit)
    const byModel = {}
    const add = (key, itemId, count) => {
        byModel[key] = byModel[key] || {}
        addTo(byModel[key], itemId, count)
    }
    forEach(slots, slot => {
        const counts = getSlotCounts(unit, slot)
        forEach(slot.choices, choice => forEach(choice.items, ({id, count}) => add(slot.miniatureId || 'unit', id, count * (counts[choice.id] || 0))))
    })
    forEach(staticItems, (items, miniatureId) => {
        forEach(items, ({id, count}) => add(miniatureId, id, count * (miniatureCounts[miniatureId] || 0)))
    })
    const itemName = (id) => find(dataBase.data.wargear_item, ['id', id])?.name || ''
    const toItems = (counts) => sortBy(filter(map(counts, (count, id) => ({name: itemName(id), count})), item => item.count > 0 && item.name), 'name')
    const result = []
    forEach(miniatureCounts, (count, miniatureId) => {
        if (count > 0) result.push({miniatureId, name: ix.miniatures[miniatureId]?.name || '', count, items: toItems(byModel[miniatureId] || {})})
    })
    if (byModel.unit) result.push({miniatureId: '', name: '', count: 0, items: toItems(byModel.unit)})
    return result
}
