import Constants from '../Constants'
import {roster} from './appState'
import {
    resetRoster, setBattleSize, createUnit, addUnit, getCompositions, getCompositionModels, getUnitTotalPoints,
    getAvailableDatasheetIds, syncForceDisposition, getForceDispositionOptions
} from './rosterModel'
import {getWargear, getUnitWargearItems, getSlotTotal, getSlotCounts, setChoiceCount} from './wargearModel'

import map from 'lodash/map'
import find from 'lodash/find'
import some from 'lodash/some'
import filter from 'lodash/filter'
import flatMap from 'lodash/flatMap'
import forEach from 'lodash/forEach'
import includes from 'lodash/includes'
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

export const splitRosterText = (text) => {
    // Ссылки Listhammer вида [Название](url)150 Points превращаем в обычный текст; подпись о версии экспорта пропускаем
    const lines = compact(map(String(text || '').split(/\r?\n/), line => line.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1 ').replace(/\s+/g, ' ').trim()))
        .filter(line => !/^exported with/i.test(line))
    if (!lines.length) return null
    const title = parseUnitHeader(lines[0]) || {name: lines[0], points: 0}
    const header = []
    let index = 1
    while (index < lines.length) {
        const line = lines[index]
        const unitHeader = parseUnitHeader(line)
        const isBattleSize = unitHeader && find(dataBase.data.battle_size, item => normalize(item.name) === normalize(unitHeader.name))
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

const getAllFactions = () => flatMap(Constants.grandFactions, grand => map(grand.factions, faction => ({...faction, grandFaction: grand.name})))

const parseHeader = (header, warnings) => {
    const result = {}
    const factions = getAllFactions()
    // Армия: последняя строка шапки без скобок, совпавшая с названием армии (первой идёт родительская, например Space Marines)
    const factionLines = filter(header, line => !line.includes('('))
    for (let i = factionLines.length - 1; i >= 0 && !result.faction; i--) {
        result.faction = find(factions, faction => normalize(faction.name) === normalize(factionLines[i]))
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
        const name = ` ${normalize(detachment.name)} `
        if (rest.includes(name)) {
            result.detachmentIds.push(detachment.id)
            rest = rest.replace(name, ' ')
        }
    })
    if (!result.detachmentIds.length) warnings.push('Detachment was not recognized — choose it in the builder')

    result.forceDisposition = find(dataBase.data.force_disposition, item => some(header, line => normalize(line) === normalize(item.name)))
    result.battleSize = find(dataBase.data.battle_size, item => some(header, line => normalize(line.replace(/\(.*?\)/g, '')) === normalize(item.name)))
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
    const candidates = filter(dataBase.data.datasheet, item => normalize(item.name) === key)
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

const isInfoLine = (text) => /^attached as:/i.test(text) || /^enhancements?:/i.test(text) || includes(NO_TEXT, text.toLowerCase())

// Группирует строки юнита на модели (строки с названием миниатюры) и снаряжение. Количества у снаряжения - итоговые
const parseUnitLines = (datasheetId, lines) => {
    const miniatures = filter(dataBase.data.miniature, ['datasheetId', datasheetId])
    const miniatureByName = {}
    forEach(miniatures, miniature => { miniatureByName[normalize(miniature.name)] = miniature })
    const models = []
    const items = {}
    const addItem = (name, count) => {
        const key = normalize(name)
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
        const key = normalize(find(dataBase.data.wargear_item, ['id', itemId])?.name)
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
    const key = normalize(name.replace(/\(.*?\)\s*$/, ''))
    const all = filter(dataBase.data.enhancement, item => normalize(item.name) === key)
    return find(all, item => includes(roster.detachmentIds, item.detachmentId)) || null
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
    if (!parsed || !size(parsed.units)) return {ok: false, error: 'No units found. Paste a list in the format of the official Warhammer 40,000 app.', warnings}
    const header = parseHeader(parsed.header, warnings)
    if (!header.faction) return {ok: false, error: 'Could not recognize the army. The first lines of the list should contain the army name (for example, Space Marines).', warnings}

    resetRoster()
    roster.name = parsed.title.name
    roster.grandFaction = header.faction.grandFaction
    roster.faction = header.faction.name
    roster.factionId = header.faction.id
    if (header.battleSize) setBattleSize(header.battleSize.id)
    else warnings.push('Battle size was not recognized, 2000 points is used')
    roster.detachmentIds = header.detachmentIds || []
    if (header.forceDisposition && some(getForceDispositionOptions(), ['id', header.forceDisposition.id])) roster.forceDispositionId = header.forceDisposition.id
    else syncForceDisposition()

    const available = getAvailableDatasheetIds()
    const created = []
    forEach(parsed.units, entry => {
        const datasheet = findDatasheet(entry.name, available, roster.factionId)
        if (!datasheet) {
            warnings.push(`Unit not found and skipped: ${entry.name}`)
            return
        }
        const isAllied = entry.section === 'ALLIED UNITS'
        let unit = createUnit(datasheet.id, {alliedFactionId: isAllied ? getAlliedFactionId(datasheet.id) : ''})
        const {models, items} = parseUnitLines(datasheet.id, entry.lines)
        unit = pickComposition(unit, models, entry.points)
        const fit = fitWargear(unit, items)
        unit = fit.unit
        if (fit.distance > 0) warnings.push(`${datasheet.name}: some wargear was not recognized and the default set is used`)
        if (some(entry.lines, ({text}) => text.toLowerCase() === 'warlord')) unit.isWarlord = true
        const enhancementLine = find(entry.lines, ({text}) => /^enhancements?:/i.test(text))
        if (enhancementLine) {
            const enhancement = findEnhancement(enhancementLine.text.replace(/^enhancements?:\s*/i, ''))
            if (enhancement) unit.enhancementId = enhancement.id
            else warnings.push(`${datasheet.name}: enhancement "${enhancementLine.text.replace(/^enhancements?:\s*/i, '')}" was not found`)
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
    // Очки из текста и расчёт приложения могут расходиться (например, из-за версии базы)
    forEach(created, ({unit, entry}) => {
        const points = getUnitTotalPoints(unit)
        if (entry.points && points !== entry.points) warnings.push(`${entry.name}: ${entry.points} pts in the list, ${points} pts calculated`)
    })
    return {ok: true, warnings}
}
