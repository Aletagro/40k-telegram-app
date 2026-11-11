import {roster} from './appState'
import {getUnitWargearPoints} from './wargearModel'
import {getUnitType, getDetachmentUnitType, getUnitsSortesByType, getCodexInfo, getParentCodexId} from './utils'

import find from 'lodash/find'
import filter from 'lodash/filter'
import map from 'lodash/map'
import compact from 'lodash/compact'
import sumBy from 'lodash/sumBy'
import sortBy from 'lodash/sortBy'
import forEach from 'lodash/forEach'
import uniq from 'lodash/uniq'
import groupBy from 'lodash/groupBy'
import size from 'lodash/size'
import includes from 'lodash/includes'
import some from 'lodash/some'

const dataBase = require('./db')

/*
 * Модель ростера. Хранятся только id и выбор игрока, сами данные (имя, характеристики, очки)
 * берутся из базы при отображении. Благодаря этому сохранённый список переживает обновление базы.
 *
 * roster = {
 *   id, name, isPublic, note,
 *   grandFaction, faction, factionId,
 *   battleSizeId, pointsLimit,
 *   detachmentIds,       // выбранные детачменты (суммарно не больше лимита DP размера игры)
 *   forceDispositionId,  // доктрина (Force Disposition), доступная выбранным детачментам
 *   allegiances,         // {allegianceAbilityGroupId: allegianceAbilityId} - обязательный выбор способности лояльности
 *   units: [unit]
 * }
 * unit = {
 *   uid,              // уникальный id внутри списка (одинаковые юниты различаем по нему)
 *   datasheetId,
 *   compositionId,    // выбранный состав отряда (unit_composition)
 *   modelCounts,      // {miniatureId: количество} - для составов с диапазоном (5-9 моделей)
 *   loadouts,         // {miniatureId: {loadoutChoiceSetId: {loadoutChoiceId: сколько моделей}}}
 *   enhancementId,
 *   attachedToUid,    // uid отряда, к которому присоединён лидер
 *   isWarlord,
 *   alliedFactionId,  // если юнит взят как союзник
 *   allegianceAbilityId // способность, назначенная этому юниту (группы с выбором юнитов, например Houndpack Lance)
 * }
 */

const DEFAULT_BATTLE_SIZE_ID = () => find(dataBase.data.battle_size, ['pointsLimit', 2000])?.id || ''

export const createUid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export const resetRoster = () => {
    const battleSize = find(dataBase.data.battle_size, ['id', DEFAULT_BATTLE_SIZE_ID()])
    Object.keys(roster).forEach(key => delete roster[key])
    Object.assign(roster, {
        id: undefined,
        name: '',
        isPublic: true,
        note: '',
        grandFaction: '',
        faction: '',
        factionId: '',
        battleSizeId: battleSize?.id || '',
        pointsLimit: battleSize?.pointsLimit || 2000,
        detachmentIds: [],
        forceDispositionId: '',
        allegiances: {},
        units: []
    })
    return roster
}

export const setBattleSize = (battleSizeId) => {
    const battleSize = find(dataBase.data.battle_size, ['id', battleSizeId])
    if (battleSize) {
        roster.battleSizeId = battleSize.id
        roster.pointsLimit = battleSize.pointsLimit
    }
}

export const getBattleSize = () => find(dataBase.data.battle_size, ['id', roster.battleSizeId])

// Составы, доступные только с определённым детачментом (например, C'tan в Pantheon of Woe)
export const isCompositionAvailable = (compositionId) => {
    const required = filter(dataBase.data.unit_composition_required_detachment, ['unitCompositionId', compositionId])
    return !required.length || some(required, item => includes(roster.detachmentIds, item.detachmentId))
}

// Составы даташита, доступные в этом ростере. Если недоступны все - возвращаем все, проблему покажет валидация
const getAllowedCompositions = (compositions) => {
    const allowed = filter(compositions, item => isCompositionAvailable(item.id))
    return allowed.length ? allowed : compositions
}

// Состав отряда по умолчанию: isDefault, иначе первый
export const getDefaultComposition = (datasheetId) => {
    const compositions = getAllowedCompositions(filter(dataBase.data.unit_composition, ['datasheetId', datasheetId]))
    return find(compositions, 'isDefault') || compositions[0]
}

export const createUnit = (datasheetId, extra = {}) => ({
    uid: createUid(),
    datasheetId,
    compositionId: getDefaultComposition(datasheetId)?.id,
    modelCounts: {},
    loadouts: {},
    enhancementId: '',
    attachedToUid: '',
    isWarlord: false,
    alliedFactionId: '',
    allegianceAbilityId: '',
    ...extra
})

export const addUnit = (unit) => {
    roster.units = [...roster.units, unit]
}

export const removeUnit = (uid) => {
    roster.units = compact(map(roster.units, unit => {
        if (unit.uid === uid) return null
        // Лидер остаётся без отряда, если удалили тот, к которому он был присоединён
        return unit.attachedToUid === uid ? {...unit, attachedToUid: ''} : unit
    }))
}

export const updateUnit = (uid, patch) => {
    roster.units = map(roster.units, unit => unit.uid === uid ? {...unit, ...patch} : unit)
}

// Очки отряда: стоимость выбранного состава + доплата за "ступень" (datasheet_points_step).
// ВАЖНО: предположение - с stepAt-й копии этого датащита в списке добавляется stepPoints
export const getUnitPoints = (unit, copyIndex = 1) => {
    const composition = find(dataBase.data.unit_composition, ['id', unit.compositionId])
    let points = composition?.points || 0
    const steps = filter(dataBase.data.datasheet_points_step, ['datasheetId', unit.datasheetId])
    forEach(steps, step => {
        if (copyIndex >= step.stepAt) points += step.stepPoints
    })
    return points
}

export const getEnhancementPoints = (unit) => {
    if (!unit.enhancementId) return 0
    return find(dataBase.data.enhancement, ['id', unit.enhancementId])?.basePointsCost || 0
}

// Номер копии юнита в списке (1, 2, 3...), нужен для ступенчатой стоимости
const getCopyIndex = (unit) => {
    const sameUnits = filter(roster.units, ['datasheetId', unit.datasheetId])
    return sameUnits.findIndex(item => item.uid === unit.uid) + 1
}

export const getUnitTotalPoints = (unit) => getUnitPoints(unit, getCopyIndex(unit)) + getEnhancementPoints(unit) + getUnitWargearPoints(unit)

export const getRosterPoints = () => sumBy(roster.units, getUnitTotalPoints)

// --- Сохранение / загрузка (формат повторяет AoS: плоские поля + JSON-строки) ---

const UNIT_KEYS = ['uid', 'datasheetId', 'compositionId', 'modelCounts', 'loadouts', 'enhancementId', 'attachedToUid', 'isWarlord', 'alliedFactionId', 'allegianceAbilityId']

export const serializeRoster = ({userId, name = roster.name, isPublic = roster.isPublic} = {}) => ({
    name,
    faction: roster.faction,
    faction_id: roster.factionId,
    grand_faction: roster.grandFaction,
    battle_size_id: roster.battleSizeId,
    points_limit: roster.pointsLimit,
    detachment_ids: JSON.stringify(roster.detachmentIds || []),
    force_disposition_id: roster.forceDispositionId || '',
    units: JSON.stringify(map(roster.units, unit => {
        const short = {}
        forEach(UNIT_KEYS, key => { short[key] = unit[key] })
        return short
    })),
    points: JSON.stringify({all: getRosterPoints()}),
    is_public: isPublic,
    note: roster.note || '',
    user_id: userId
})

// Старые списки хранили один detachment_id, новые - JSON-массив detachment_ids
const parseDetachmentIds = (row) => {
    let ids = []
    try {
        ids = row.detachment_ids ? JSON.parse(row.detachment_ids) : []
    } catch (error) {
        console.error(error)
    }
    if (!Array.isArray(ids) || !ids.length) ids = row.detachment_id ? [row.detachment_id] : []
    return uniq(filter(ids, id => find(dataBase.data.detachment, ['id', id])))
}

// Загрузка сохранённого списка. Юниты, которых больше нет в базе, пропускаются
export const hydrateRoster = (row) => {
    resetRoster()
    let units = []
    try {
        units = JSON.parse(row.units) || []
    } catch (error) {
        console.error(error)
    }
    Object.assign(roster, {
        id: row.id,
        name: row.name || '',
        isPublic: row.is_public !== false,
        note: row.note || '',
        grandFaction: row.grand_faction || '',
        faction: row.faction || '',
        factionId: row.faction_id || '',
        battleSizeId: row.battle_size_id || roster.battleSizeId,
        pointsLimit: row.points_limit || roster.pointsLimit,
        detachmentIds: parseDetachmentIds(row),
        forceDispositionId: find(dataBase.data.force_disposition, ['id', row.force_disposition_id])?.id || '',
        units: compact(map(units, unit => find(dataBase.data.datasheet, ['id', unit.datasheetId])
            ? {...createUnit(unit.datasheetId), ...unit}
            : null))
    })
    return roster
}

// --- Справочные функции для экранов билдера ---

const dataBaseUnitType = {}

// Тип юнита для группировки (Epic Hero, Character, Battleline ...) по первой миниатюре даташита
// Учитывает детачмент ростера: в некоторых детачментах юнит меняет тип
export const getDatasheetType = (datasheetId, detachmentIds = roster.detachmentIds) => {
    if (!dataBaseUnitType[datasheetId]) {
        const miniatures = sortBy(filter(dataBase.data.miniature, ['datasheetId', datasheetId]), 'displayOrder')
        const types = map(miniatures, miniature => getUnitType(miniature.id))
        // Если среди моделей есть Epic Hero или Character (например, Grimaldus со слугами), юнит относится к ним
        dataBaseUnitType[datasheetId] = find(types, type => type === 'Epic Hero') || find(types, type => type === 'Character') || types[0] || ''
    }
    return getDetachmentUnitType(datasheetId, detachmentIds) || dataBaseUnitType[datasheetId]
}

export const isCharacterType = (type) => type === 'Character' || type === 'Epic Hero'

// Юнит считается персонажем и по ключевому слову Character, полученному по условию (Houndpack Lance и т.п.)
export const isCharacterDatasheet = (datasheetId, unit) => {
    if (isCharacterType(getDatasheetType(datasheetId))) return true
    const characterIds = map(filter(dataBase.data.keyword, ['name', 'Character']), 'id')
    return some(getConditionalKeywordIds(datasheetId, unit), id => includes(characterIds, id))
}

// Сколько копий одного юнита можно взять: лимит размера игры, у Battleline и Dedicated Transport вдвое больше,
// Epic Hero и Warlord Titan - только один
export const getUnitLimit = (datasheetId) => {
    const type = getDatasheetType(datasheetId)
    const miniature = find(dataBase.data.miniature, ['datasheetId', datasheetId])
    const isWarlordTitan = Boolean(miniature && find(dataBase.data.miniature_keyword, item => item.miniatureId === miniature.id
        && find(dataBase.data.keyword, ['id', item.keywordId])?.name === 'Warlord Titan'))
    if (isWarlordTitan || type === 'Epic Hero') return 1
    const base = getBattleSize()?.duplicateUnitLimit || 3
    return type === 'Battleline' || type === 'Dedicated Transport' ? base * 2 : base
}

export const getUnitCount = (datasheetId) => filter(roster.units, ['datasheetId', datasheetId]).length

// Состав отряда: [{miniature, min, max}] в порядке отображения
export const getCompositionModels = (compositionId) => {
    const models = filter(dataBase.data.unit_composition_miniature, ['unitCompositionId', compositionId])
    return compact(map(models, item => {
        const miniature = find(dataBase.data.miniature, ['id', item.miniatureId])
        return miniature && item.max > 0 ? {miniature, min: item.min, max: item.max} : null
    }))
}

// Короткая подпись состава: "1 Sergeant + 4 Intercessor"
export const getCompositionLabel = (compositionId) => map(getCompositionModels(compositionId),
    ({miniature, min, max}) => `${min === max ? min : `${min}-${max}`} ${miniature.name}`).join(' + ')

export const getCompositions = (datasheetId) => sortBy(getAllowedCompositions(filter(dataBase.data.unit_composition, ['datasheetId', datasheetId])), 'displayOrder')

// Количество моделей отряда: у диапазонов берём выбранное значение (или минимум)
export const getModelCount = (unit) => sumBy(getCompositionModels(unit.compositionId), ({miniature, min}) => unit.modelCounts?.[miniature.id] || min)

// Энхансменты текущего детачмента, доступные юниту. Пока проверяются только ключевые слова и даташит
// (исключения, оружие и группы телохранителей добавятся вместе с валидацией)
export const getAvailableEnhancements = (unit) => {
    if (!size(roster.detachmentIds)) return []
    const enhancements = sortBy(filter(dataBase.data.enhancement, item => includes(roster.detachmentIds, item.detachmentId)), 'displayOrder')
    const miniature = sortBy(filter(dataBase.data.miniature, ['datasheetId', unit.datasheetId]), 'displayOrder')[0]
    const keywords = [...map(filter(dataBase.data.miniature_keyword, ['miniatureId', miniature?.id]), 'keywordId'), ...getConditionalKeywordIds(unit.datasheetId, unit)]
    return filter(enhancements, enhancement => {
        const groups = filter(dataBase.data.enhancement_required_keyword_group, ['enhancementId', enhancement.id])
        if (!groups.length) return true
        return Boolean(find(groups, group => {
            if (group.datasheetId) return group.datasheetId === unit.datasheetId
            const required = map(filter(dataBase.data.enhancement_required_keyword_group_keyword, ['enhancementRequiredKeywordGroupId', group.id]), 'keywordId')
            return !find(required, keywordId => !keywords.includes(keywordId))
        }))
    })
}

// Даташиты, которые можно взять в ростер с текущим детачментом
export const getAvailableDatasheetIds = () => {
    const faction = {id: roster.factionId}
    const groups = getUnitsSortesByType(faction, getCodexInfo(faction.id), roster.detachmentIds, getParentCodexId(faction))
    const available = new Set()
    forEach(groups, group => forEach(group.units, unit => available.add(unit.id)))
    return available
}

// --- Способности лояльности (allegiance ability) ---
// Группа с isMandatory - обязательный выбор одной способности для всего списка (бог Хаоса у демонов, Mark of Chaos).
// Остальные группы - игрок отмечает конкретные юниты (например, 3 WAR DOG в Houndpack Lance)

export const getAllegianceAbilities = (groupId) => sortBy(filter(dataBase.data.allegiance_ability, ['allegianceAbilityGroupId', groupId]), 'displayOrder')

let conditionalIndex = null
const getConditionalRows = (datasheetId) => {
    if (!conditionalIndex) conditionalIndex = groupBy(dataBase.data.conditional_keyword, 'datasheetId')
    return conditionalIndex[datasheetId] || []
}

// Юниты ростера, на которых завязана способность группы
export const getAllegianceUnits = (group) => {
    const ids = map(getAllegianceAbilities(group.id), 'id')
    return filter(roster.units, unit => some(getConditionalRows(unit.datasheetId), item => includes(ids, item.requiredAllegianceAbilityId)))
}

// Группы, которые действуют в текущем ростере: у детачмента - если он выбран, без детачмента - если в ростере есть затронутые юниты
export const getAllegianceGroups = () => filter(dataBase.data.allegiance_ability_group, group => group.detachmentId
    ? includes(roster.detachmentIds, group.detachmentId)
    : size(getAllegianceUnits(group)) > 0)

// Выбор для конкретного юнита: {group, abilities, isChoice} или undefined.
// isChoice - обязательно выбрать одну из способностей (демонический алледжианс); иначе юнит просто отмечается (abilities[0])
export const getUnitAllegianceSelect = (unit) => {
    for (const group of getAllegianceGroups()) {
        const abilities = filter(getAllegianceAbilities(group.id), ability => some(getConditionalRows(unit.datasheetId), ['requiredAllegianceAbilityId', ability.id]))
        if (abilities.length) return {group, abilities, isChoice: Boolean(group.isMandatory)}
    }
    return undefined
}

// Способности, действующие для даташита: общий выбор списка и выбор юнитов этого даташита
// Если указан конкретный юнит - только его выбор, иначе выбор любого юнита этого даташита
const getActiveAllegianceAbilityIds = (datasheetId, unit) => [...Object.values(roster.allegiances || {}), ...compact(map(unit ? [unit] : filter(roster.units, ['datasheetId', datasheetId]), 'allegianceAbilityId'))]

// Меняет способность юнита. Если он перестал быть персонажем, с него снимаются Warlord и энхансмент
export const setUnitAllegiance = (uid, allegianceAbilityId) => {
    updateUnit(uid, {allegianceAbilityId})
    const unit = find(roster.units, ['uid', uid])
    if (unit && !isCharacterDatasheet(unit.datasheetId, unit)) {
        const patch = {}
        if (unit.isWarlord) patch.isWarlord = false
        if (unit.enhancementId) patch.enhancementId = ''
        if (size(patch)) updateUnit(uid, patch)
    }
}

// Убирает выборы для групп, которые больше не действуют
export const syncAllegiances = () => {
    const groups = getAllegianceGroups()
    const groupIds = map(groups, 'id')
    const abilityIds = map(groups, group => map(getAllegianceAbilities(group.id), 'id')).flat()
    const allegiances = {}
    forEach(roster.allegiances, (abilityId, groupId) => {
        if (includes(groupIds, groupId)) allegiances[groupId] = abilityId
    })
    roster.allegiances = allegiances
    forEach(roster.units, unit => {
        if (unit.allegianceAbilityId && !includes(abilityIds, unit.allegianceAbilityId)) setUnitAllegiance(unit.uid, '')
    })
}

// Ключевые слова, которые даташит получает при условиях: детачмент, фракция ростера, Warlord, способность лояльности
export const getConditionalKeywordIds = (datasheetId, unit) => {
    const activeAbilities = getActiveAllegianceAbilityIds(datasheetId, unit)
    const warlord = find(roster.units, 'isWarlord')
    const warlordMiniatures = warlord ? map(filter(dataBase.data.miniature, ['datasheetId', warlord.datasheetId]), 'id') : []
    return map(filter(getConditionalRows(datasheetId), item => {
        if (item.datasheetId !== datasheetId) return false
        if (item.requiredAllegianceAbilityId && !includes(activeAbilities, item.requiredAllegianceAbilityId)) return false
        if (item.requiredDetachmentId && !includes(roster.detachmentIds, item.requiredDetachmentId)) return false
        if (item.requiredRosterFactionKeywordId && item.requiredRosterFactionKeywordId !== roster.factionId) return false
        if (item.requiredWarlordMiniatureId && !includes(warlordMiniatures, item.requiredWarlordMiniatureId)) return false
        return true
    }), 'keywordId')
}

// --- Детачменты и Force Disposition ---

export const getDetachmentPoints = (detachmentId) => find(dataBase.data.detachment, ['id', detachmentId])?.detachmentPointsCost || 0

// Лимит DP зависит от размера игры
export const getDetachmentPointsLimit = () => getBattleSize()?.detachmentPointsLimit || 0

// Детачменты с одним и тем же уникальным ключевым словом (например, Battlesuit) нельзя брать вместе.
// Возвращает {keyword, detachment} - ключевое слово и уже выбранный детачмент, который конфликтует с указанным
export const getDetachmentKeywordConflict = (detachmentId, ids = roster.detachmentIds) => {
    const keywordIds = map(filter(dataBase.data.detachment_unique_keyword, ['detachmentId', detachmentId]), 'keywordId')
    for (const otherId of ids) {
        if (otherId === detachmentId) continue
        const shared = find(dataBase.data.detachment_unique_keyword, item => item.detachmentId === otherId && includes(keywordIds, item.keywordId))
        if (shared) return {keyword: find(dataBase.data.keyword, ['id', shared.keywordId])?.name, detachment: find(dataBase.data.detachment, ['id', otherId])}
    }
    return null
}

export const getUsedDetachmentPoints = (ids = roster.detachmentIds) => sumBy(ids, getDetachmentPoints)

// Доктрины, которые дают выбранные детачменты (объединение)
export const getForceDispositionOptions = (ids = roster.detachmentIds) => {
    const optionIds = uniq(map(filter(dataBase.data.detachment_force_disposition, item => includes(ids, item.detachmentId)), 'forceDispositionId'))
    return compact(map(optionIds, id => find(dataBase.data.force_disposition, ['id', id])))
}

// Сбрасывает доктрину, которой больше нет среди доступных; единственную доступную выбирает сам
export const syncForceDisposition = () => {
    const options = getForceDispositionOptions()
    if (!find(options, ['id', roster.forceDispositionId])) roster.forceDispositionId = options.length === 1 ? options[0].id : ''
}

// Снимает энхансменты, которых нет у выбранных детачментов
export const clearForeignEnhancements = () => {
    forEach(roster.units, unit => {
        if (!unit.enhancementId) return
        const enhancement = find(dataBase.data.enhancement, ['id', unit.enhancementId])
        if (!enhancement || !includes(roster.detachmentIds, enhancement.detachmentId)) updateUnit(unit.uid, {enhancementId: ''})
    })
}

// Приводит ростер в порядок после смены детачмента. Тип юнита (группа) определяется детачментом автоматически,
// поэтому юниты сами переходят в нужную группу. Удаляются те, кого в новом детачменте брать нельзя
// (недоступны или не помещаются в лимит копий). Возвращает названия удалённых юнитов
export const syncRosterWithDetachment = () => {
    const removed = []
    clearForeignEnhancements()
    forEach([...roster.units], unit => {
        if (!isCompositionAvailable(unit.compositionId)) updateUnit(unit.uid, {compositionId: getDefaultComposition(unit.datasheetId)?.id})
    })
    syncForceDisposition()
    const available = getAvailableDatasheetIds()
    const remove = (unit) => {
        removed.push(find(dataBase.data.datasheet, ['id', unit.datasheetId])?.name)
        removeUnit(unit.uid)
    }
    // Союзные юниты не входят в основной список доступных
    forEach([...roster.units], unit => {
        if (!unit.alliedFactionId && !available.has(unit.datasheetId)) remove(unit)
    })
    // Лишние копии: с конца списка
    forEach([...roster.units].reverse(), unit => {
        if (getUnitCount(unit.datasheetId) > getUnitLimit(unit.datasheetId)) remove(unit)
    })
    syncAllegiances()
    return removed
}
