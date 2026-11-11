import parse from 'html-react-parser'
import Constants from '../Constants'

import get from 'lodash/get'
import compact from 'lodash/compact'
import castArray from 'lodash/castArray'
import uniq from 'lodash/uniq'
import uniqBy from 'lodash/uniqBy'
import map from 'lodash/map'
import size from 'lodash/size'
import find from 'lodash/find'
import union from 'lodash/union'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'
import replace from 'lodash/replace'
import includes from 'lodash/includes'
import findIndex from 'lodash/findIndex'
import lowerCase from 'lodash/lowerCase'

const dataBase = require('./db')

export const sortByName = (array, param) => param
    ? array.sort((a,b) => (a[param] > b[param]) ? 1 : ((b[param] > a[param]) ? -1 : 0))
    : array.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))

export const unitsSortesByType = (units) => {
    const getUnitsByType = (type) => {
        const _units = filter(units, unit => unit?.unitType === type.name && (type.withoutHero ? !unit.isCharacter : true))
        if (_units.length > 0) {
            sortByName(_units)
            return {units: _units, title: replace(type.name, /,/g, '')}
        } else {
            return null
        }
    }
    return filter(map(Constants.unitsTypes, getUnitsByType), Boolean)
}

export const getAvToDice = (count) => {
    const arr = [...Array(count+1).keys()]
    let sum = 0
    forEach(arr, number => sum = sum + number)
    return sum / count
}

export const getValue = (value) => {
    if (Number(value)) {
        return value
    }
    const splitedValue = lowerCase(value).split('d')
    if (splitedValue.length === 2) {
        let average
        if (Number(splitedValue[1])) {
            average = getAvToDice(Number(splitedValue[1]))
        } else {
            const valueAfterD = filter(splitedValue[1].split(''), item => item.trim())
            if (Number(valueAfterD[0])) {
                average = getAvToDice(Number(valueAfterD[0]))
            } else {
                return undefined
            }
            return average * (Number(splitedValue[0]) || 1) + Number(valueAfterD[1])
        }
        if (splitedValue[0]) {
            return average * Number(splitedValue[0])
        } else {
            return average
        }
    }
}

export const replaceAsterisks = (string) => {
    if (string) {
        let newString = replace(string, /(\*\*\*(.*?)\*\*\*)|(\*\*(.*?)\*\*)|(\*(.*?)\*)/g, (match, p1, p2, p3, p4, p5, p6) => {
            if (p1) {
                return `<b><i>${p2}</i></b>`;
            } else if (p3) {
                return `<b>${p4}</b>`;
            } else if (p5) {
                return `<i>${p6}</i>`;
            }
            return match; // На случай, если ничего не подошло
        });
        if (includes(newString, '<')) {
            return parse(newString)
        } else {
            return string
        }
    }
    return string
}

export const removeAsterisks = (string) => replace(string, /\*/g, '')

export const getCalcUnit = (unit) => {
    if (unit) {
        const weapons = unit.weapons.map(getCalcWeapon)
        return {name: unit.name, weapons}
    }
    const _unit = {
        name: '',
        weapons:  [{critOn: {modificator: 1, title: '6+'}}]
    }
    return _unit
}

export const getCalcWeapon = (weapon) => {
    if (weapon) {
        return {...weapon}
    }
    return {critOn: {modificator: 1, title: '6+'}}
}

export const removeDuplicates = (arr) => {
    const uniqueIds = new Set()
    const result = filter(arr, (item) => {
        if (uniqueIds.has(item.id)) {
        return false // Пропускаем дубликат
      }
      uniqueIds.add(item.id)
      return true // Оставляем уникальный элемент
    })
    return result
}

export const getUnitType = (miniatureId) => {
    const keywordsIds = sortByName(filter(dataBase.data.miniature_keyword, ['miniatureId', miniatureId]), 'displayOrder')
    const keywords = map(keywordsIds, keyword => find(dataBase.data.keyword, ['id', keyword.keywordId]))
    const epicHeroIndex = findIndex(keywords, ['name', 'Epic Hero'])
    if (epicHeroIndex >= 0) {
        return 'Epic Hero'
    }
    const characterIndex = findIndex(keywords, ['name', 'Character'])
    if (characterIndex >= 0) {
        return 'Character'
    }
    const battlelineIndex = findIndex(keywords, ['name', 'Battleline'])
    if (battlelineIndex >= 0) {
        return 'Battleline'
    }
    const transportIndex = findIndex(keywords, ['name', 'Dedicated Transport'])
    if (transportIndex >= 0) {
        return 'Dedicated Transport'
    }
    // Первое ключевое слово может быть не типом юнита (например, Explosives): берём первый известный тип
    const typeNames = map(Constants.unitsTypes, 'name')
    return find(keywords, keyword => includes(typeNames, keyword?.name))?.name || keywords[0]?.name
}

export const getCompositions = (miniatures) => {
    const compositionsSize = map(miniatures, _miniature => filter(dataBase.data.unit_composition_miniature, composition => composition.miniatureId === _miniature.id))
    const compositionsPoints = sortByName(filter(dataBase.data.unit_composition, composition => composition.datasheetId === miniatures[0].datasheetId), 'displayOrder')
    const compositions = map(compositionsPoints, compositionPoints => {
        let title
        const models = map(miniatures, _miniature => {
            const miniatureSizes = find(compositionsSize, compositionSizes => compositionSizes[0].miniatureId === _miniature.id)
            const counts = find(miniatureSizes, ['unitCompositionId', compositionPoints.id])
            const factionKeyword = find(dataBase.data.unit_composition_required_faction_keyword, ['unitCompositionId', counts.unitCompositionId])
            const armyFaction = factionKeyword ? find(dataBase.data.faction_keyword, ['id', factionKeyword.factionKeywordId]) : null
            if (armyFaction) {
                title = `Army Faction: ${armyFaction.name}`
            } else {
                const requiredDetachmentId = find(dataBase.data.unit_composition_required_detachment, ['unitCompositionId', counts.unitCompositionId])?.detachmentId
                const requiredDetachment = requiredDetachmentId ? find(dataBase.data.detachment, ['id', requiredDetachmentId]) : null
                if (requiredDetachment) {
                    title = `${requiredDetachment.name} Detachment`
                }
            }
            return {
                name: _miniature.name,
                id: _miniature.id,
                count: counts.max === counts.min ? counts.min : `${counts.min}-${counts.max}`,
                min: counts.min,
                max: counts.max
            }
        })
        const groupingKeyword = compositionPoints.referenceGroupingKeywordId ? find(dataBase.data.keyword, ['id', compositionPoints.referenceGroupingKeywordId]) : ''
        if (groupingKeyword) {
            title = `Every model has the ${groupingKeyword.name} Keyword`
        }
        return {models, points: compositionPoints.points, title}
    })
    return compositions
}

// Фазы, в которые можно использовать стратагему: 'commandPhase' -> 'Command'
export const getStratagemPhases = (stratagemId) => filter(dataBase.data.stratagem_phase, ['stratagemId', stratagemId])
    .map(({phase}) => replace(phase, /Phase$/, '').replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase()).trim())

// Основная книга армии: не боевой патруль, не Imperial Armour и не Legends
// Тип юнита, который задаёт сам детачмент (например, Warbikers становятся Battleline в Kult of Speed)
// detachmentIds - выбранные детачменты ростера (массив) или один id
export const getDetachmentUnitType = (datasheetId, detachmentIds) => {
    const ids = compact(castArray(detachmentIds))
    if (!ids.length) return undefined
    const typeNames = map(Constants.unitsTypes, 'name')
    const condition = find(dataBase.data.conditional_keyword, item => item.datasheetId === datasheetId
        && includes(ids, item.requiredDetachmentId)
        && !item.requiredWarlordMiniatureId
        && includes(typeNames, find(dataBase.data.keyword, ['id', item.keywordId])?.name))
    return condition ? find(dataBase.data.keyword, ['id', condition.keywordId]).name : undefined
}

export const getCodexInfo = (factionId) => {
    const publications = filter(dataBase.data.publication, publication =>
        publication.factionKeywordId === factionId && !publication.isCombatPatrol && !publication.isLegends && !includes(publication.name, 'Imperial Armour: Tyranids')
    )
    // У армии может быть несколько книг (например, Imperial Armour): основной считается кодекс или книга, не относящаяся к Imperial Armour
    return find(publications, publication => !includes(publication.name, 'Imperial Armour')) || publications[0]
}

// Книга родительской армии (например, Space Marines для орденов)
export const getParentCodexId = (faction) => {
    const parentFactionId = find(dataBase.data.faction_keyword, ['id', faction?.id])?.parentFactionKeywordId
    return parentFactionId ? getCodexInfo(parentFactionId)?.id : undefined
}

// detachmentIds: детачменты ростера (в них часть юнитов меняет тип, например становится Battleline); без них - каталог
export const getUnitsSortesByType = (faction, codexInfo, detachmentIds, parentCodexId) => {
    const detachmentIdList = compact(castArray(detachmentIds))
    let units = []
    if (codexInfo && codexInfo.id !== Constants.EmperorsChildrenCodexId && codexInfo.id !== Constants.AeldariCodexId) {
        units = filter(dataBase.data.datasheet, datasheet => datasheet.publicationId === codexInfo?.id)
    } else {
        const unitsIds = map(filter(dataBase.data.datasheet_faction_keyword, (item) => item.factionKeywordId === faction.id), item => item.datasheetId)
        units = map(unitsIds, unitId => find(dataBase.data.datasheet, datasheet => datasheet.id === unitId))
    }
    if (parentCodexId) {
        let parentFactionUnits = filter(dataBase.data.datasheet, datasheet => datasheet.publicationId === parentCodexId)
        // если родительская армия это спейсмары, то нужно добавить только ванильных маров
        if (find(dataBase.data.publication, ['id', parentCodexId])?.factionKeywordId === Constants.vanilSpaceMarinesId) {
            const notVanilSpaceMarinesArmies = filter(dataBase.data.faction_keyword, ['parentFactionKeywordId', Constants.vanilSpaceMarinesId])
            const notVanilSpaceMarinesUnitsIds = union(...map(notVanilSpaceMarinesArmies, army => map(filter(dataBase.data.datasheet_faction_keyword, (item) => item.factionKeywordId === army.id ), item => item.datasheetId)))
            parentFactionUnits = filter(parentFactionUnits, unit => !includes(notVanilSpaceMarinesUnitsIds, unit.id))
        }
        if (size(parentFactionUnits)) {
            units = [...units, ...parentFactionUnits]
        }
    }
    // Удаление лишних юнитов для ванильных спейсмаров
    if (faction.id === Constants.vanilSpaceMarinesId) {
        const notVanilSpaceMarinesArmies = filter(dataBase.data.faction_keyword, ['parentFactionKeywordId', Constants.vanilSpaceMarinesId])
        const notVanilSpaceMarinesUnitsIds = union(...map(notVanilSpaceMarinesArmies, army => map(filter(dataBase.data.datasheet_faction_keyword, (item) => item.factionKeywordId === army.id ), item => item.datasheetId)))
        units = filter(units, unit => !includes(notVanilSpaceMarinesUnitsIds, unit.id))
    }
    const imperialArmourId = find(dataBase.data.publication, publication => publication.factionKeywordId === faction.id && includes(publication.name, 'Imperial Armour:'))?.id
    const imperialArmourUnits = filter(dataBase.data.datasheet, ['publicationId', imperialArmourId])
    if (size(imperialArmourUnits)) {
        units = [...units, ...imperialArmourUnits]
    }
    // убрать юниты, которые не доступны в определенной фракции
    units = filter(units, unit => !find(dataBase.data.faction_keyword_excluded_datasheet, datasheet => {
            return datasheet.datasheetId === unit.id && datasheet.factionKeywordId === faction.id
        })
    )
    // добавить юниты для доступные для определенного детачмента
    const detachmentAlliedIds = uniq(map(filter(dataBase.data.allied_faction_required_detachment, item => includes(detachmentIdList, item.detachmentId)), 'alliedFactionId'))
    // Часть юнитов лежит в книге армии, но берётся только с определённым детачментом (например, демоны Нургла у Death Guard
    // с Tallyband Summoners). Без этого детачмента такие юниты убираем, а с ним они добавятся ниже без дублей
    const gatedAlliedIds = uniq(map(filter(dataBase.data.allied_faction_required_detachment, item =>
        !includes(detachmentAlliedIds, item.alliedFactionId)
        && find(dataBase.data.faction_keyword_allied_faction, {factionKeywordId: faction.id, alliedFactionId: item.alliedFactionId})), 'alliedFactionId'))
    const gatedDatasheetIds = map(filter(dataBase.data.allied_faction_datasheet, item => includes(gatedAlliedIds, item.alliedFactionId)), 'datasheetId')
    if (size(gatedDatasheetIds)) units = filter(units, unit => !includes(gatedDatasheetIds, unit.id))
    forEach(detachmentAlliedIds, detachmentAlliedId => {
        const detachmentAlliedUnitsIds = filter(dataBase.data.allied_faction_datasheet, ['alliedFactionId', detachmentAlliedId])
        const detachmentAlliedUnits = map(detachmentAlliedUnitsIds, unit => find(dataBase.data.datasheet, datasheet => datasheet.id === unit.datasheetId))
        units = [...units, ...compact(detachmentAlliedUnits)]
    })
    units = uniqBy(units, 'id')
    const miniaturesData = map(units, unit => filter(dataBase.data.miniature, ['datasheetId', unit.id]))
    const unitsInfo = map(miniaturesData, miniatures => {
        const unitType = getUnitType(miniatures[0].id)
        const compositions = getCompositions(miniatures)
        return {unitType, compositions, points: get(compositions, '[0].points', 0)}
    })
    units = map(units, (unit, index) => ({...unit, ...unitsInfo[index]}))
    if (detachmentIdList.length) {
        // Юниты, недоступные хотя бы в одном из выбранных детачментов
        const excluded = map(filter(dataBase.data.detachment_excluded_datasheet, item => includes(detachmentIdList, item.detachmentId)), 'datasheetId')
        units = filter(units, unit => !includes(excluded, unit.id))
        units = map(units, unit => {
            const detachmentType = getDetachmentUnitType(unit.id, detachmentIdList)
            return detachmentType ? {...unit, unitType: detachmentType} : unit
        })
    }
    return unitsSortesByType(units)
}

export const getUnitPounts = (unit) => {
    let ponts = unit.points || unit.regimentOfRenownPointsCost
    if (ponts) {
        return ponts
    }
    const miniatures = filter(dataBase.data.miniature, ['datasheetId', unit.id])
    const compositions = getCompositions(miniatures)
    return get(compositions, '[0].points', 0)
}

