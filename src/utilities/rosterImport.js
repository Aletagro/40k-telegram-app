import {t} from './i18n'
import Constants from '../Constants'
import {roster} from './appState'
import {
    resetRoster, setBattleSize, createUnit, addUnit, getCompositions, getCompositionModels, getUnitTotalPoints,
    getAvailableDatasheetIds, syncForceDisposition, getForceDispositionOptions, getUnitAllegianceSelect, setUnitAllegiance
} from './rosterModel'
import {getWargear, getUnitWargearItems, getSlotTotal, getSlotCounts, setChoiceCount} from './wargearModel'

import map from 'lodash/map'
import find from 'lodash/find'
import some from 'lodash/some'
import filter from 'lodash/filter'
import flatMap from 'lodash/flatMap'
import forEach from 'lodash/forEach'
import includes from 'lodash/includes'
import uniq from 'lodash/uniq'
import {getFactionLabel} from './utils'
import compact from 'lodash/compact'
import size from 'lodash/size'

const dataBase = require('./db')

// Импорт списка из текста в формате официального приложения Warhammer 40,000 (в нём же экспортирует и это приложение).
// Возвращает {ok, error, warnings}; при успехе заполняет общий roster

const SECTIONS = ['CHARACTERS', 'CHARACTER', 'EPIC HEROES', 'BATTLELINE', 'DEDICATED TRANSPORTS', 'OTHER DATASHEETS', 'ALLIED UNITS']
const POINTS_REGEX = /^(.+?)\s*\(?\s*([\d][\d,.]*)\s*(?:points?|pts)\s*\)?$/i
const BULLET_REGEX = /^([•◦▪▫●○·\-*–])\s*/

export const normalize = (value) => String(value || '')
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[^a-z0-9']+/g, ' ')
    .trim()

// Названия в базе показываются на выбранном языке, а список может прийти на английском (или наоборот):
// сопоставляем и с названием на языке интерфейса, и с английским
const sameName = (item, key) => normalize(item.name) === key || normalize(item.nameEn) === key

const parsePoints = (value) => parseInt(String(value).replace(/[,.]/g, ''), 10) || 0

const isSectionTitle = (line) => includes(SECTIONS, line.replace(/:$/, '').toUpperCase().trim()) && line === line.toUpperCase()

// Строка вида "Intercessor Squad 80 Points" -> {name, points}
const parseUnitHeader = (line) => {
    if (BULLET_REGEX.test(line)) return null
    const match = line.match(POINTS_REGEX)
    return match ? {name: match[1].trim(), points: parsePoints(match[2])} : null
}

const parseCountPrefix = (text) => {
    const match = text.match(/^(\d+)\s*x\s+(.+)$/i)
    return match ? {count: parseInt(match[1], 10), name: match[2].trim()} : {count: 1, name: text.trim()}
}

// --- Разбор текста на шапку и юниты ---

// Официальное приложение добавляет в экспорт блок ERRORS с пунктами списка: он не относится к юнитам
const skipErrorBlocks = (lines) => {
    const result = []
    let isSkipping = false
    forEach(lines, line => {
        if (/^(errors?|warnings?)$/i.test(line)) {
            isSkipping = true
            return
        }
        if (isSkipping && (isSectionTitle(line) || /^attached unit/i.test(line) || (!BULLET_REGEX.test(line) && parseUnitHeader(line)))) isSkipping = false
        if (!isSkipping) result.push(line)
    })
    return result
}

export const splitRosterText = (text) => {
    // Ссылки Listhammer вида [Название](url)150 Points превращаем в обычный текст; подпись о версии экспорта пропускаем
    let lines = compact(map(String(text || '').split(/\r?\n/), line => line.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1 ').replace(/\s+/g, ' ').trim()))
        .map(line => line.replace(/(\d)[ \u00a0\u202f](?=\d{3}(?!\d))/g, '$1'))
        .filter(line => !/^exported with/i.test(line))
    lines = skipErrorBlocks(lines)
    if (!lines.length) return null
    // Без названия списка экспорт сразу начинается с армии
    const title = parseUnitHeader(lines[0]) || {name: '', points: 0}
    const header = []
    let index = title.points ? 1 : 0
    while (index < lines.length) {
        const line = lines[index]
        const unitHeader = parseUnitHeader(line)
        const isBattleSize = unitHeader && find(dataBase.data.battle_size, item => sameName(item, normalize(unitHeader.name)))
        if (isSectionTitle(line) || /^attached unit/i.test(line) || (unitHeader && !isBattleSize)) break
        header.push(line)
        index++
    }
    const units = []
    let section = ''
    let group = 0
    let current = null
    for (; index < lines.length; index++) {
        const line = lines[index]
        if (isSectionTitle(line)) {
            section = line.replace(/:$/, '').toUpperCase()
            group = 0
            current = null
            continue
        }
        if (/^attached unit/i.test(line)) {
            group++
            current = null
            continue
        }
        const unitHeader = parseUnitHeader(line)
        if (unitHeader) {
            current = {...unitHeader, section, group, lines: []}
            units.push(current)
            continue
        }
        if (!current) continue
        const bullet = line.match(BULLET_REGEX)
        current.lines.push({text: line.replace(BULLET_REGEX, '').trim(), sub: Boolean(bullet && bullet[1] === '◦')})
    }
    return {title, header, units}
}

// --- Шапка: армия, детачменты, доктрина, размер игры ---

// У армии несколько написаний: английское из Constants и название на языке интерфейса
const getAllFactions = () => flatMap(Constants.grandFactions, grand => map(grand.factions, faction => {
    const row = find(dataBase.data.faction_keyword, ['id', faction.id])
    return {...faction, grandFaction: grand.name, labels: compact([faction.name, row?.name, row?.commonName, row?.nameEn, row?.commonNameEn]).map(normalize)}
}))

const parseHeader = (header, warnings) => {
    const result = {}
    const factions = getAllFactions()
    // Армия: последняя строка шапки без скобок, совпавшая с названием армии (первой идёт родительская, например Space Marines)
    const factionLines = filter(header, line => !line.includes('('))
    for (let i = factionLines.length - 1; i >= 0 && !result.faction; i--) {
        result.faction = find(factions, faction => includes(faction.labels, normalize(factionLines[i])))
    }
    if (!result.faction) return result

    const detachments = compact(map(filter(dataBase.data.detachment_faction_keyword, ['factionKeywordId', result.faction.id]),
        item => find(dataBase.data.detachment, ['id', item.detachmentId])))
    const text = ` ${normalize(map(header, line => line.replace(/\(.*?\)/g, ' ')).join(' | '))} `
    // Сначала длинные названия, чтобы "Strike Force" не перебило более точное совпадение
    const sorted = [...detachments].sort((a, b) => b.name.length - a.name.length)
    let rest = text
    result.detachmentIds = []
    forEach(sorted, detachment => {
        const name = find(uniq([detachment.name, detachment.nameEn]), item => item && rest.includes(` ${normalize(item)} `))
        if (name) {
            result.detachmentIds.push(detachment.id)
            rest = rest.replace(` ${normalize(name)} `, ' ')
        }
    })
    if (!result.detachmentIds.length) warnings.push(t('Detachment was not recognized — choose it in the builder'))

    result.forceDisposition = find(dataBase.data.force_disposition, item => some(header, line => sameName(item, normalize(line))))
    result.battleSize = find(dataBase.data.battle_size, item => some(header, line => sameName(item, normalize(line.replace(/\(.*?\)/g, '')))))
    const pointsMatch = find(map(header, line => line.match(/\(\s*([\d,.]+)\s*points?\s*\)/i)), Boolean)
    if (pointsMatch) {
        const points = parsePoints(pointsMatch[1])
        result.battleSize = find(dataBase.data.battle_size, ['pointsLimit', points]) || result.battleSize
    }
    return result
}

// --- Поиск даташита ---

const findDatasheet = (name, availableIds, factionId) => {
    const key = normalize(name)
    const candidates = filter(dataBase.data.datasheet, item => sameName(item, key))
    if (!candidates.length) return null
    return find(candidates, item => availableIds.has(item.id))
        || find(candidates, item => some(dataBase.data.datasheet_faction_keyword, link => link.datasheetId === item.id && link.factionKeywordId === factionId))
        || candidates[0]
}

const getAlliedFactionId = (datasheetId) => {
    const links = filter(dataBase.data.allied_faction_datasheet, ['datasheetId', datasheetId])
    const allowed = map(filter(dataBase.data.faction_keyword_allied_faction, ['factionKeywordId', roster.factionId]), 'alliedFactionId')
    return find(links, link => includes(allowed, link.alliedFactionId))?.alliedFactionId || links[0]?.alliedFactionId || ''
}

// --- Состав и снаряжение ---

const NO_TEXT = ['warlord']

// Строки вида "Mark of Chaos: Khorne": название группы способностей лояльности и выбранная способность
const getAllegianceLine = (text) => {
    const match = text.match(/^([^:]+):\s*(.+)$/)
    if (!match) return null
    const group = find(dataBase.data.allegiance_ability_group, item => sameName(item, normalize(match[1])))
    return group ? {group, value: match[2].trim()} : null
}

const isInfoLine = (text) => /^attached as:/i.test(text) || /^enhancements?:/i.test(text) || includes(NO_TEXT, text.toLowerCase()) || Boolean(getAllegianceLine(text))

// Группирует строки юнита на модели (строки с названием миниатюры) и снаряжение. Количества у снаряжения - итоговые
// Снаряжение сравниваем по английским названиям: название из текста приводим к ним
let wargearKeys = null
const toEnglishKey = (key) => {
    if (!wargearKeys) {
        wargearKeys = {}
        forEach(dataBase.data.wargear_item, item => { if (item.name && item.nameEn) wargearKeys[normalize(item.name)] = normalize(item.nameEn) })
    }
    return wargearKeys[key] || key
}

const parseUnitLines = (datasheetId, lines) => {
    const miniatures = filter(dataBase.data.miniature, ['datasheetId', datasheetId])
    const miniatureByName = {}
    forEach(miniatures, miniature => {
        miniatureByName[normalize(miniature.name)] = miniature
        if (miniature.nameEn) miniatureByName[normalize(miniature.nameEn)] = miniature
    })
    const models = []
    const items = {}
    const addItem = (name, count) => {
        const key = toEnglishKey(normalize(name))
        if (key) items[key] = (items[key] || 0) + count
    }
    forEach(lines, ({text, sub}) => {
        if (isInfoLine(text)) return
        const {count, name} = parseCountPrefix(text)
        const miniature = !sub ? miniatureByName[normalize(name)] : null
        if (miniature) models.push({miniature, count})
        else addItem(name, count)
    })
    return {models, items}
}

const pickComposition = (unit, models, listedPoints) => {
    const compositions = getCompositions(unit.datasheetId)
    if (!compositions.length) return unit
    const counts = {}
    forEach(models, ({miniature, count}) => { counts[miniature.id] = (counts[miniature.id] || 0) + count })
    const hasModels = size(counts) > 0
    const fits = (composition) => {
        const compositionModels = getCompositionModels(composition.id)
        if (!hasModels) return true
        const ids = map(compositionModels, ({miniature}) => miniature.id)
        if (some(Object.keys(counts), id => !includes(ids, id))) return false
        return !some(compositionModels, ({miniature, min, max}) => {
            const count = counts[miniature.id] || 0
            return count < min || count > max
        })
    }
    const build = (composition) => ({
        ...unit,
        compositionId: composition.id,
        modelCounts: Object.fromEntries(compact(map(getCompositionModels(composition.id), ({miniature, min, max}) =>
            min !== max && counts[miniature.id] ? [miniature.id, counts[miniature.id]] : null)))
    })
    const suitable = filter(compositions, fits)
    const options = map(suitable.length ? suitable : compositions, build)
    // Если подходящих несколько, берём тот, у которого сходятся очки
    return find(options, option => getUnitTotalPoints(option) === listedPoints) || options[0]
}

const getItemsByName = (unit) => {
    const byName = {}
    forEach(getUnitWargearItems(unit), (count, itemId) => {
        const item = find(dataBase.data.wargear_item, ['id', itemId])
        const key = normalize(item?.nameEn || item?.name)
        if (key && count) byName[key] = (byName[key] || 0) + count
    })
    return byName
}

const getDistance = (current, target) => {
    const keys = new Set([...Object.keys(current), ...Object.keys(target)])
    let total = 0
    keys.forEach(key => { total += Math.abs((current[key] || 0) - (target[key] || 0)) })
    return total
}

// Подбирает loadouts так, чтобы набор снаряжения юнита был как можно ближе к указанному в тексте
const fitWargear = (unit, target) => {
    let current = {...unit, loadouts: {}}
    let distance = getDistance(getItemsByName(current), target)
    const slots = filter(getWargear(unit.datasheetId).slots, slot => slot.choices.length > 1 && getSlotTotal(unit, slot) > 0)
    for (let guard = 0; guard < 300 && distance > 0; guard++) {
        const base = current
        let best = null
        for (const slot of slots) {
            const counts = getSlotCounts(base, slot)
            for (const choice of slot.choices) {
                if (choice.id === slot.defaultId) continue
                const candidate = {...base, loadouts: setChoiceCount(base, slot, choice.id, (counts[choice.id] || 0) + 1)}
                const next = getDistance(getItemsByName(candidate), target)
                if (next < distance && (!best || next < best.distance)) best = {candidate, distance: next}
            }
        }
        if (!best) break
        current = best.candidate
        distance = best.distance
    }
    return {unit: current, distance}
}

const findEnhancement = (name) => {
    // В названиях улучшений для отрядов есть суффикс "(Upgrade)", поэтому сначала ищем точное совпадение
    const candidates = [normalize(name), normalize(name.replace(/\(.*?\)\s*$/, ''))]
    for (const key of candidates) {
        const all = filter(dataBase.data.enhancement, item => sameName(item, key))
        const found = find(all, item => includes(roster.detachmentIds, item.detachmentId))
        if (found) return found
    }
    return null
}

const getRole = (lines) => {
    const line = find(lines, ({text}) => /^attached as:/i.test(text))
    if (!line) return ''
    const role = line.text.replace(/^attached as:\s*/i, '').toLowerCase()
    if (role.startsWith('bodyguard')) return 'bodyguard'
    if (role.startsWith('support')) return 'support'
    return 'leader'
}

// --- Главная функция ---

export const importRoster = (text) => {
    const warnings = []
    const parsed = splitRosterText(text)
    if (!parsed || !size(parsed.units)) return {ok: false, error: t('No units found. Paste a list in the format of the official Warhammer 40,000 app.'), warnings}
    const header = parseHeader(parsed.header, warnings)
    if (!header.faction) return {ok: false, error: t('Could not recognize the army. The first lines of the list should contain the army name (for example, Space Marines).'), warnings}

    resetRoster()
    roster.name = parsed.title.name || getFactionLabel(header.faction.id, header.faction.name)
    roster.grandFaction = header.faction.grandFaction
    roster.faction = header.faction.name
    roster.factionId = header.faction.id
    if (header.battleSize) setBattleSize(header.battleSize.id)
    else warnings.push(t('Battle size was not recognized, 2000 points is used'))
    roster.detachmentIds = header.detachmentIds || []
    if (header.forceDisposition && some(getForceDispositionOptions(), ['id', header.forceDisposition.id])) roster.forceDispositionId = header.forceDisposition.id
    else syncForceDisposition()

    const available = getAvailableDatasheetIds()
    const created = []
    forEach(parsed.units, entry => {
        const datasheet = findDatasheet(entry.name, available, roster.factionId)
        if (!datasheet) {
            warnings.push(t('Unit not found and skipped: {{name}}', {name: entry.name}))
            return
        }
        const isAllied = entry.section === 'ALLIED UNITS'
        let unit = createUnit(datasheet.id, {alliedFactionId: isAllied ? getAlliedFactionId(datasheet.id) : ''})
        const {models, items} = parseUnitLines(datasheet.id, entry.lines)
        unit = pickComposition(unit, models, entry.points)
        const fit = fitWargear(unit, items)
        unit = fit.unit
        if (fit.distance > 0) warnings.push(t('{{name}}: some wargear was not recognized and the default set is used', {name: datasheet.name}))
        if (some(entry.lines, ({text}) => text.toLowerCase() === 'warlord')) unit.isWarlord = true
        const enhancementLine = find(entry.lines, ({text}) => /^enhancements?:/i.test(text))
        if (enhancementLine) {
            const enhancement = findEnhancement(enhancementLine.text.replace(/^enhancements?:\s*/i, ''))
            if (enhancement) unit.enhancementId = enhancement.id
            else warnings.push(t('{{name}}: enhancement "{{enhancement}}" was not found', {name: datasheet.name, enhancement: enhancementLine.text.replace(/^enhancements?:\s*/i, '')}))
        }
        created.push({unit, entry, role: getRole(entry.lines)})
    })

    // Присоединённые отряды: в группе лидеры и поддержка цепляются к телохранителям
    const groups = {}
    forEach(created, item => { if (item.entry.group) groups[item.entry.group] = [...(groups[item.entry.group] || []), item] })
    forEach(groups, members => {
        const target = find(members, ['role', 'bodyguard']) || find(members, item => !item.role)
        if (!target) return
        forEach(members, item => {
            if (item !== target && item.role) item.unit.attachedToUid = target.unit.uid
        })
    })

    forEach(created, ({unit}) => addUnit(unit))
    // Способности лояльности выбираются, когда все юниты уже в списке (доступные группы зависят от состава)
    forEach(created, ({unit, entry}) => {
        forEach(entry.lines, ({text}) => {
            const line = getAllegianceLine(text)
            if (!line) return
            const current = find(roster.units, ['uid', unit.uid])
            const select = getUnitAllegianceSelect(current)
            const ability = find(select?.abilities, item => sameName(item, normalize(line.value)))
            if (ability) setUnitAllegiance(unit.uid, ability.id)
            else warnings.push(t('{{name}}: "{{group}}: {{value}}" was not recognized', {name: entry.name, group: line.group.name, value: line.value}))
        })
    })
    // Очки из текста и расчёт приложения могут расходиться (например, из-за версии базы)
    forEach(created, ({unit, entry}) => {
        const points = getUnitTotalPoints(unit)
        if (entry.points && points !== entry.points) warnings.push(t('{{name}}: {{listed}} pts in the list, {{calculated}} pts calculated', {name: entry.name, listed: entry.points, calculated: points}))
    })
    return {ok: true, warnings}
}
