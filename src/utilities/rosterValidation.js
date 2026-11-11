import {roster} from './appState'
import {
    getRosterPoints, getUnitTotalPoints, getAvailableDatasheetIds, getDatasheetType, isCharacterDatasheet, getUnitLimit, getUnitCount, getBattleSize, getAvailableEnhancements, getUsedDetachmentPoints, getDetachmentPointsLimit, getForceDispositionOptions, getConditionalKeywordIds, isCompositionAvailable, getAllegianceGroups, getAllegianceAbilities, getAllegianceUnits, getDetachmentKeywordConflict
} from './rosterModel'
import {getUnitWargearItems} from './wargearModel'

import find from 'lodash/find'
import filter from 'lodash/filter'
import map from 'lodash/map'
import some from 'lodash/some'
import compact from 'lodash/compact'
import size from 'lodash/size'
import uniq from 'lodash/uniq'
import sumBy from 'lodash/sumBy'
import split from 'lodash/split'
import uniqBy from 'lodash/uniqBy'
import groupBy from 'lodash/groupBy'
import forEach from 'lodash/forEach'

const dataBase = require('./db')

/*
 * Проверка ростера. Возвращает проблемы вида {uid, message}; uid - юнит, к которому относится проблема
 * (пусто, если проблема относится ко всему списку).
 */

const detachmentIds = () => roster.detachmentIds || []

const getName = (datasheetId) => find(dataBase.data.datasheet, ['id', datasheetId])?.name || ''

const getMiniatures = (datasheetId) => filter(dataBase.data.miniature, ['datasheetId', datasheetId])

const keywordCache = {}

// Ключевые слова миниатюры
const getMiniatureKeywords = (miniatureId, datasheetId) => {
    if (!keywordCache[miniatureId]) {
        keywordCache[miniatureId] = new Set(map(filter(dataBase.data.miniature_keyword, ['miniatureId', miniatureId]), 'keywordId'))
    }
    // Условные ключевые слова зависят от ростера, поэтому в кэш не попадают
    return datasheetId ? new Set([...keywordCache[miniatureId], ...getConditionalKeywordIds(datasheetId)]) : keywordCache[miniatureId]
}

// Ключевые слова всех миниатюр даташита
const getDatasheetKeywords = (datasheetId) => {
    const result = new Set()
    forEach(getMiniatures(datasheetId), miniature => getMiniatureKeywords(miniature.id, datasheetId).forEach(id => result.add(id)))
    return result
}

// --- Warlord ---

const getMandatoryWarlordMiniatureIds = () => {
    const faction = find(dataBase.data.faction_keyword, ['id', roster.factionId])
    const fromDetachment = map(filter(dataBase.data.detachment_mandatory_warlord_miniature, item => detachmentIds().includes(item.detachmentId)), 'miniatureId')
    return uniq([...(faction?.mandatoryWarlordId ? [faction.mandatoryWarlordId] : []), ...fromDetachment])
}

// Может ли юнит быть Warlord: Character (или особая миниатюра), у которой нет запрета
export const canBeWarlord = (unit) => {
    const datasheetId = unit.datasheetId
    const miniatures = getMiniatures(datasheetId)
    const granted = map(filter(dataBase.data.detachment_granted_warlord_miniature, item => detachmentIds().includes(item.detachmentId)), 'miniatureId')
    const isCharacter = isCharacterDatasheet(datasheetId, unit)
    return some(miniatures, miniature => !miniature.cannotBeWarlord
        && (isCharacter || miniature.canBeNonCharacterWarlord || granted.includes(miniature.id)))
}

const getWarlordIssues = () => {
    const issues = []
    const warlord = find(roster.units, 'isWarlord')
    if (!warlord) {
        if (roster.units.length) issues.push({message: 'Warlord is not chosen', fix: 'warlord'})
        return issues
    }
    const name = getName(warlord.datasheetId)
    if (!canBeWarlord(warlord)) {
        issues.push({uid: warlord.uid, message: `${name} cannot be the Warlord`})
    }
    const mandatory = getMandatoryWarlordMiniatureIds()
    if (mandatory.length && !some(getMiniatures(warlord.datasheetId), miniature => mandatory.includes(miniature.id))) {
        const names = uniq(map(mandatory, id => getName(find(dataBase.data.miniature, ['id', id])?.datasheetId)))
        issues.push({uid: warlord.uid, message: `Warlord must be: ${names.join(' or ')}`})
    }
    return issues
}

// --- Присоединение лидеров ---

const getGroupDatasheetIds = (groupId) => map(filter(dataBase.data.datasheet_bodyguard_group_datasheet, ['datasheetBodyguardGroupId', groupId]), 'datasheetId')

// Группы лидера, действующие в текущем ростере (детачмент, обязательные и запрещённые юниты)
export const getLeaderGroups = (datasheetId) => filter(dataBase.data.datasheet_bodyguard_group, group => {
    if (group.datasheetId !== datasheetId) return false
    if (group.requiredDetachmentId && !detachmentIds().includes(group.requiredDetachmentId)) return false
    if (group.excludedDetachmentId && detachmentIds().includes(group.excludedDetachmentId)) return false
    const required = map(filter(dataBase.data.datasheet_bodyguard_group_required_roster_datasheet, ['datasheetBodyguardGroupId', group.id]), 'datasheetId')
    if (required.length && !some(required, id => getUnitCount(id) > 0)) return false
    const excluded = map(filter(dataBase.data.datasheet_bodyguard_group_excluded_roster_datasheet, ['datasheetBodyguardGroupId', group.id]), 'datasheetId')
    if (excluded.length && some(excluded, id => getUnitCount(id) > 0)) return false
    return true
})

// К каким даташитам и в каком качестве может присоединиться лидер: [{datasheetId, type}]
const matchGroup = (group, target) => {
    if (!getGroupDatasheetIds(group.id).includes(target.datasheetId)) return false
    // Все модели отряда должны иметь ключевое слово
    if (group.requiresAllUnitsHaveKeywordId
        && some(getMiniatures(target.datasheetId), miniature => !getMiniatureKeywords(miniature.id, target.datasheetId).has(group.requiresAllUnitsHaveKeywordId))) return false
    return true
}

// Группа, по которой лидер может присоединиться к отряду (или undefined)
export const findAttachGroup = (leader, target) => find(getLeaderGroups(leader.datasheetId), group => matchGroup(group, target))

// К отряду нельзя присоединить второго лидера (или поддержку) того же вида
const hasSameTypeLeader = (leader, target, type) => some(roster.units, unit => unit.uid !== leader.uid && unit.attachedToUid === target.uid
    && (findAttachGroup(unit, target)?.bodyguardType || 'leader') === type)

// Отряды списка, к которым можно присоединить лидера (без отрядов, где такой лидер уже есть)
export const getAttachTargets = (leader) => filter(roster.units, target => {
    if (target.uid === leader.uid) return false
    const group = findAttachGroup(leader, target)
    return Boolean(group) && !hasSameTypeLeader(leader, target, group.bodyguardType || 'leader')
})

// Даташиты, которых пока нет в ростере, но к которым лидер мог бы присоединиться (и которые можно добавить)
export const getPossibleAttachDatasheets = (leader) => {
    const available = getAvailableDatasheetIds()
    const result = []
    forEach(getLeaderGroups(leader.datasheetId), group => {
        forEach(getGroupDatasheetIds(group.id), datasheetId => {
            if (!available.has(datasheetId) || result.includes(datasheetId)) return
            if (getUnitCount(datasheetId) >= getUnitLimit(datasheetId)) return
            if (!matchGroup(group, {datasheetId})) return
            result.push(datasheetId)
        })
    })
    return result
}

export const canLead = (datasheetId) => getLeaderGroups(datasheetId).length > 0

// Показывать ли кнопку присоединения: лидер уже присоединён, есть подходящие отряды в списке или их можно добавить
export const canShowAttach = (unit) => canLead(unit.datasheetId)
    && Boolean(unit.attachedToUid || getAttachTargets(unit).length || getPossibleAttachDatasheets(unit).length)

const getAttachIssues = (unit) => {
    if (!unit.attachedToUid) return []
    const name = getName(unit.datasheetId)
    const target = find(roster.units, ['uid', unit.attachedToUid])
    if (!target) return [{uid: unit.uid, message: `${name}: the unit it was attached to is not in the list`}]
    if (!findAttachGroup(unit, target)) {
        return [{uid: unit.uid, message: `${name} cannot be attached to ${getName(target.datasheetId)}`}]
    }
    return []
}

// У одного отряда может быть не больше одного лидера и одной поддержки каждого вида
const getBodyguardIssues = () => {
    const issues = []
    const byTarget = groupBy(filter(roster.units, 'attachedToUid'), 'attachedToUid')
    forEach(byTarget, (leaders, targetUid) => {
        const target = find(roster.units, ['uid', targetUid])
        if (!target) return
        const byType = groupBy(leaders, leader => findAttachGroup(leader, target)?.bodyguardType || 'leader')
        forEach(byType, (list, type) => {
            if (list.length > 1) {
                issues.push({uid: target.uid, message: `${getName(target.datasheetId)} has more than one ${type} attached`})
            }
        })
    })
    return issues
}

// --- Энхансменты ---

const getEnhancementIssues = (unit) => {
    if (!unit.enhancementId) return []
    const enhancement = find(dataBase.data.enhancement, ['id', unit.enhancementId])
    if (!enhancement) return []
    const name = getName(unit.datasheetId)
    const prefix = `${enhancement.name} (${name})`
    const issues = []
    const add = (message) => issues.push({uid: unit.uid, message: `${prefix}: ${message}`})
    const type = getDatasheetType(unit.datasheetId)
    const miniatures = getMiniatures(unit.datasheetId)

    if (!detachmentIds().includes(enhancement.detachmentId)) add('does not belong to the chosen detachment')
    if (type === 'Epic Hero' && !enhancement.isEquipableByEpicHero) add('cannot be taken by an Epic Hero')
    if (!isCharacterDatasheet(unit.datasheetId, unit) && !enhancement.isEquipableByNonCharacterUnit) add('can only be taken by a Character')
    if (unit.isWarlord && enhancement.cannotBeWarlord) add('cannot be taken by the Warlord')
    if (some(miniatures, 'excludedFromEnhancements')) add('this unit cannot take enhancements')
    const excluded = map(filter(dataBase.data.enhancement_excluded_keyword, ['enhancementId', enhancement.id]), 'keywordId')
    if (excluded.length) {
        const keywords = getDatasheetKeywords(unit.datasheetId)
        const bad = find(excluded, id => keywords.has(id))
        if (bad) add(`cannot be taken by units with ${find(dataBase.data.keyword, ['id', bad])?.name}`)
    }
    if (!find(getAvailableEnhancements(unit), ['id', enhancement.id])) add('is not available for this unit')

    const wargear = map(filter(dataBase.data.enhancement_required_wargear_item, ['enhancementId', enhancement.id]), 'wargearItemId')
    if (wargear.length) {
        const items = getUnitWargearItems(unit)
        const missing = find(wargear, id => !items[id])
        if (missing) add(`requires ${find(dataBase.data.wargear_item, ['id', missing])?.name}`)
    }

    const groups = filter(dataBase.data.enhancement_bodyguard_group, ['enhancementId', enhancement.id])
    if (groups.length) {
        const target = find(roster.units, ['uid', unit.attachedToUid])
        const allowed = uniq(groups.flatMap(group => map(filter(dataBase.data.enhancement_bodyguard_group_datasheet, ['enhancementBodyguardGroupId', group.id]), 'datasheetId')))
        if (!target || !allowed.includes(target.datasheetId)) {
            add(`requires leading ${map(allowed, getName).join(' or ') || 'a specific unit'}`)
        }
    }
    return issues
}

const getEnhancementRosterIssues = () => {
    const issues = []
    const withEnhancement = filter(roster.units, 'enhancementId')
    const counted = filter(withEnhancement, unit => find(dataBase.data.enhancement, ['id', unit.enhancementId])?.isIncludedInEnhancementLimit)
    const limit = getBattleSize()?.enhancementLimit
    if (limit && counted.length > limit) issues.push({uids: map(counted, 'uid'), message: `Too many enhancements: ${counted.length} of ${limit}`})
    forEach(groupBy(withEnhancement, 'enhancementId'), (units, id) => {
        const enhancement = find(dataBase.data.enhancement, ['id', id])
        if (enhancement && units.length > (enhancement.limit || 1)) {
            issues.push({uids: map(units, 'uid'), message: `${enhancement.name} can be taken only ${enhancement.limit || 1} time(s)`})
        }
    })
    return issues
}

// --- Копии юнитов ---

const getDuplicateIssues = () => {
    const issues = []
    forEach(uniq(map(roster.units, 'datasheetId')), datasheetId => {
        const count = getUnitCount(datasheetId)
        const limit = getUnitLimit(datasheetId)
        if (count > limit) issues.push({uids: map(filter(roster.units, ['datasheetId', datasheetId]), 'uid'), message: `${getName(datasheetId)}: ${count} of maximum ${limit}`})
    })
    return issues
}

// --- Союзники ---

// Союзная фракция юнита: выбранная при добавлении или та, что привязана к детачменту ростера
export const getUnitAlliedFactionId = (unit) => {
    if (unit.alliedFactionId) return unit.alliedFactionId
    const alliedIds = map(filter(dataBase.data.allied_faction_required_detachment, item => detachmentIds().includes(item.detachmentId)), 'alliedFactionId')
    return find(alliedIds, alliedId => find(dataBase.data.allied_faction_datasheet, {alliedFactionId: alliedId, datasheetId: unit.datasheetId})) || ''
}

// Название союзной фракции: родительская фракция, а если их несколько - название книги
export const getAlliedFactionName = (alliedFactionId) => {
    const parents = filter(dataBase.data.allied_faction_parent_faction_keyword, ['alliedFactionId', alliedFactionId])
    if (parents.length === 1) return find(dataBase.data.faction_keyword, ['id', parents[0].factionKeywordId])?.name || ''
    const link = find(dataBase.data.allied_faction_datasheet, ['alliedFactionId', alliedFactionId])
    const datasheet = find(dataBase.data.datasheet, ['id', link?.datasheetId])
    const publication = find(dataBase.data.publication, ['id', datasheet?.publicationId])
    return split(publication?.name, ':')[1]?.trim() || publication?.name || 'Allies'
}

const getWarlordMiniatureIds = () => map(getMiniatures(find(roster.units, 'isWarlord')?.datasheetId), 'id')

// Лимит очков союзной фракции для текущего размера битвы (или null, если лимита нет)
const getAlliedPointsLimit = (alliedFactionId) => find(dataBase.data.allied_faction_points_limit, {alliedFactionId, battleSizeId: roster.battleSizeId})?.pointsLimit ?? null

// Сколько очков потрачено на каждую союзную фракцию: [{id, name, points, limit}]
export const getAlliedUsage = () => {
    const allied = groupBy(filter(roster.units, unit => getUnitAlliedFactionId(unit)), getUnitAlliedFactionId)
    return map(allied, (units, id) => ({id, name: getAlliedFactionName(id), points: sumBy(units, getUnitTotalPoints), limit: getAlliedPointsLimit(id)}))
}

// Сколько юнитов занимает "слот" ключевого слова. Юниты-получатели из группы slotless не занимают слот,
// если в списке есть столько же юнитов-доноров (например, Inquisitor и его Inquisitorial Agents)
const getKeywordSlotCount = (units, limit) => {
    const keywordId = limit.keywordId
    const withKeyword = filter(units, unit => getDatasheetKeywords(unit.datasheetId).has(keywordId))
    let free = 0
    forEach(filter(dataBase.data.allied_faction_keyword_slotless_keyword_group, ['alliedFactionKeywordId', limit.id]), group => {
        const donors = map(filter(dataBase.data.allied_faction_keyword_slotless_keyword_group_donor_keyword, ['alliedFactionKeywordSlotlessKeywordGroupId', group.id]), 'keywordId')
        const receivers = map(filter(dataBase.data.allied_faction_keyword_slotless_keyword_group_receiver_keyword, ['alliedFactionKeywordSlotlessKeywordGroupId', group.id]), 'keywordId')
        const receiverUnits = filter(withKeyword, unit => some(receivers, id => getDatasheetKeywords(unit.datasheetId).has(id)))
        const donorUnits = filter(units, unit => unit.alliedFactionId && some(donors, id => getDatasheetKeywords(unit.datasheetId).has(id)))
        free += Math.min(receiverUnits.length, donorUnits.length)
    })
    return Math.max(0, withKeyword.length - free)
}

const getAlliedIssues = () => {
    const issues = []
    const allied = groupBy(filter(roster.units, unit => getUnitAlliedFactionId(unit)), getUnitAlliedFactionId)
    const warlordMiniatureIds = getWarlordMiniatureIds()
    forEach(allied, (units, id) => {
        const faction = find(dataBase.data.allied_faction, ['id', id])
        const name = getAlliedFactionName(id)
        if (!faction) return

        if (faction.requiredWarlordMiniatureId && !warlordMiniatureIds.includes(faction.requiredWarlordMiniatureId)) {
            const warlordName = getName(find(dataBase.data.miniature, ['id', faction.requiredWarlordMiniatureId])?.datasheetId)
            issues.push({fix: 'warlord', message: `${name}: allies require ${warlordName} as the Warlord`})
        }

        const limit = getAlliedPointsLimit(id)
        const points = sumBy(units, getUnitTotalPoints)
        if (limit !== null && points > limit) issues.push({uids: map(units, 'uid'), message: `${name}: ${points} of ${limit} pts allowed for allies`})

        forEach(units, unit => {
            if (unit.isWarlord) issues.push({uid: unit.uid, message: `${getName(unit.datasheetId)}: an allied unit cannot be the Warlord`})
            if (unit.enhancementId && !faction.canTakeEnhancements) {
                issues.push({uid: unit.uid, message: `${getName(unit.datasheetId)}: ${name} allies cannot take enhancements`})
            }
        })

        // Лимиты по ключевым словам для текущего размера битвы
        const limits = uniqBy(filter(dataBase.data.allied_faction_keyword, {alliedFactionId: id, battleSizeId: roster.battleSizeId}), 'keywordId')
        const used = []
        forEach(limits, keywordLimit => {
            const allowed = keywordLimit.requiredWarlordMiniatureId && !warlordMiniatureIds.includes(keywordLimit.requiredWarlordMiniatureId)
                ? 0
                : keywordLimit.limitCount
            const count = getKeywordSlotCount(units, keywordLimit)
            const keywordName = find(dataBase.data.keyword, ['id', keywordLimit.keywordId])?.name
            if (count > 0) used.push(keywordName)
            if (count > allowed) issues.push({uids: map(units, 'uid'), message: `${name}: ${keywordName} ${count} of ${allowed} allowed`})
        })
        if (faction.isMutuallyExclusiveKeywordLimit && used.length > 1) {
            issues.push({uids: map(units, 'uid'), message: `${name}: only one of ${used.join(', ')} can be taken`})
        }
    })
    return issues
}

// --- Ограничения по ключевым словам (keyword_restriction_group) ---

// Лимит юнитов с набором ключевых слов (например, 1 Epic Hero "Sicarius"); детачмент может изменить максимум и задать минимум
const getRestrictionIssues = () => {
    const issues = []
    const warlord = find(roster.units, 'isWarlord')
    forEach(dataBase.data.keyword_restriction_group, group => {
        if (group.factionKeywordId && group.factionKeywordId !== roster.factionId) return
        if (group.excludedFactionKeywordId && group.excludedFactionKeywordId === roster.factionId) return
        if (group.requiresWarlordMiniatureId
            && !(warlord && some(getMiniatures(warlord.datasheetId), ['id', group.requiresWarlordMiniatureId]))) return
        const keywordIds = map(filter(dataBase.data.keyword_restriction_group_keyword, ['keywordRestrictionGroupId', group.id]), 'keywordId')
        if (!keywordIds.length) return
        const units = filter(roster.units, unit => {
            const keywords = getDatasheetKeywords(unit.datasheetId)
            return !some(keywordIds, id => !keywords.has(id))
        })
        const limits = filter(dataBase.data.restriction_group_detachment_limit, item => item.restrictionGroupId === group.id && detachmentIds().includes(item.detachmentId))
        const maxes = [group.limit, ...map(limits, 'maxRosterLimit')].filter(value => value !== null && value !== undefined)
        // Детачмент с собственным максимумом заменяет базовый лимит
        const detachmentMaxes = map(limits, 'maxRosterLimit').filter(value => value !== null && value !== undefined)
        const max = detachmentMaxes.length ? Math.max(...detachmentMaxes) : (maxes.length ? Math.min(...maxes) : null)
        const min = Math.max(0, ...map(limits, item => item.minRosterLimit || 0))
        const name = map(keywordIds, id => find(dataBase.data.keyword, ['id', id])?.name).join(' ')
        if (max !== null && units.length > max) {
            const message = `${name}: no more than ${max} per list`
            issues.push(...(max === 0 ? map(units, unit => ({uid: unit.uid, message: `${name}: cannot be taken in this list`})) : [{uids: map(units, 'uid'), message}]))
        }
        if (min && units.length < min) issues.push({message: `${name}: at least ${min} required`})
    })
    return issues
}

// Способности лояльности: обязательный выбор и количество отмеченных юнитов
const getAllegianceIssues = () => {
    const issues = []
    forEach(getAllegianceGroups(), group => {
        const abilityIds = map(getAllegianceAbilities(group.id), 'id')
        if (group.isMandatory) {
            forEach(getAllegianceUnits(group), unit => {
                if (!abilityIds.includes(unit.allegianceAbilityId)) issues.push({uid: unit.uid, message: `${group.name}: choose an ability`})
            })
            return
        }
        const count = filter(roster.units, unit => abilityIds.includes(unit.allegianceAbilityId)).length
        if (group.maxRosterLimit && count > group.maxRosterLimit) issues.push({uids: map(filter(roster.units, unit => abilityIds.includes(unit.allegianceAbilityId)), 'uid'), message: `${group.name}: no more than ${group.maxRosterLimit} units can be selected`})
        if (group.minRosterLimit && count < group.minRosterLimit) issues.push({uids: map(getAllegianceUnits(group), 'uid'), message: `${group.name}: select ${group.minRosterLimit} units (${count} selected)`})
    })
    return issues
}

// Составы, требующие детачмента (например, C'tan только в Pantheon of Woe)
const getCompositionIssues = () => compact(map(roster.units, unit => isCompositionAvailable(unit.compositionId)
    ? null
    : {uid: unit.uid, message: `${getName(unit.datasheetId)}: requires a specific detachment`}))

// Все проблемы ростера
export const getRosterIssues = () => {
    const issues = []
    if (getRosterPoints() > roster.pointsLimit) issues.push({fix: 'size', message: `More than ${roster.pointsLimit} points`})
    if (!detachmentIds().length) issues.push({message: 'Detachment is not chosen', fix: 'detachments'})
    if (getUsedDetachmentPoints() > getDetachmentPointsLimit()) issues.push({message: `Detachment points: ${getUsedDetachmentPoints()} / ${getDetachmentPointsLimit()} DP`, fix: 'detachments'})
    forEach(detachmentIds(), id => {
        const conflict = getDetachmentKeywordConflict(id)
        const detachment = find(dataBase.data.detachment, ['id', id])
        if (conflict && detachment.id < conflict.detachment.id) issues.push({message: `${detachment.name} and ${conflict.detachment.name} cannot be taken together (${conflict.keyword})`, fix: 'detachments'})
    })
    if (detachmentIds().length && !roster.forceDispositionId && size(getForceDispositionOptions())) issues.push({message: 'Force Disposition is not chosen', fix: 'forceDisposition'})
    issues.push(...getWarlordIssues(), ...getDuplicateIssues(), ...getEnhancementRosterIssues(), ...getBodyguardIssues(), ...getAlliedIssues(), ...getRestrictionIssues(), ...getAllegianceIssues(), ...getCompositionIssues())
    forEach(roster.units, unit => issues.push(...getAttachIssues(unit), ...getEnhancementIssues(unit)))
    return issues
}

export const getRosterErrors = () => map(getRosterIssues(), 'message')

// Проблемы одного юнита, для показа в его карточке
export const getUnitIssues = (uid, issues = getRosterIssues()) => map(filter(issues, ['uid', uid]), 'message')
