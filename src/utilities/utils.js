import parse from 'html-react-parser'
import Constants from '../Constants'
import {roster} from '../utilities/appState'

import get from 'lodash/get'
import map from 'lodash/map'
import min from 'lodash/min'
import max from 'lodash/max'
import size from 'lodash/size'
import find from 'lodash/find'
import union from 'lodash/union'
import filter from 'lodash/filter'
import indexOf from 'lodash/indexOf'
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

export const getErrors = (roster) => {
    const errors = []
    if (!roster) {
        return errors
    }
    if (roster.points > roster.pointsLimit) {
        errors.push(`You use more than ${roster.pointsLimit} points`)
    }
    if (!roster.detachment) {
        errors.push('Choose Detachment')
    }
    // if (roster.units === null) {
    //     errors.push('Choose Warlord')
    // }
    const uniqueUnits = []
    let heroicTraitsCount = 0
    let atrefactsCount = 0
    let ensorcelledBannersCount = 0
    let hasWarmasterInRegiments = []
    let hasRequiredGeneral = false
    let isRequiredGeneralIsGeneral = false
    let jawsCount = 0
            let krulsCount = 0
    forEach(roster.regiments, (regiment, index) => {
        regiment.units.forEach(unit => {
            if (includes(unit.referenceKeywords, 'Unique')) {
                uniqueUnits.push(unit.name)
            }
            if (unit.heroicTrait) {
                heroicTraitsCount += 1
            }
            if (unit.artefact) {
                atrefactsCount += 1
            }
            if (unit['Ensorcelled Banners']) {
                ensorcelledBannersCount += 1
            }
            if (unit.points * 2 > roster.pointsLimit) {
                errors.push(`${unit.name} cost more than half the army`)
            }
            if (includes(unit.referenceKeywords, 'Warmaster')) {
                hasWarmasterInRegiments.push(index)
            }
        })
    })
    // RoR с дп может брать артефакты и трейты
    if (roster.regimentOfRenown?.id === '11cc4585-4cf5-43eb-af29-e2cbcdb6f5dd') {
        roster.regimentsOfRenownUnits.forEach((unit) => {
            if (unit.heroicTrait) {
                heroicTraitsCount += 1
            }
            if (unit.artefact) {
                atrefactsCount += 1
            }
        })
    }
    if (heroicTraitsCount > 1) {
        errors.push(`You have ${heroicTraitsCount} Heroic Traits`)
    }
    if (atrefactsCount > 1) {
        errors.push(`You have ${atrefactsCount} Atrefacts`)
    }
    if (ensorcelledBannersCount > 1) {
        errors.push(`You have ${ensorcelledBannersCount} Ensorcelled Banners`)
    }
    if (hasWarmasterInRegiments.length) {
        errors.push("You have a Warlord hero, but he isn't your general")
    }
    if (roster.requiredGeneral) {
        if (!hasRequiredGeneral) {
            errors.push(`You must be included ${roster.requiredGeneral.name} in your roster`)
        }
        if (!isRequiredGeneralIsGeneral) {
            errors.push(`${roster.requiredGeneral.name} must be your general`)
        }
    }
    forEach(roster.auxiliaryUnits, unit => {
        if (includes(unit.referenceKeywords, 'Unique')) {
            uniqueUnits.push(unit.name)
        }
    })
    const duplicateUniqueUnits = filter(uniqueUnits, (unit, index, units) => {
        return indexOf(units, unit) !== index;
    })
    forEach(duplicateUniqueUnits, unit => {
        errors.push(`You have more then one ${unit}`)
    })
    if (jawsCount !== krulsCount) {
        errors.push('For every regiment led by a Kruleboyz Hero you must also include regiment led by a Ironjawz Hero')
    }
    return errors
}

export const getWarnings = (roster) => {
    const warnings = []
    if (!roster) {
        return warnings
    }
    if (!roster.manifestationLore) {
        let hasWizard = false
        forEach(roster.regiments, (regiment, index) => {
            forEach(regiment.units, unit => {
                if (includes(unit.referenceKeywords, 'Wizard')) {
                    hasWizard = true
                }
            })
        })
        forEach(roster.auxiliaryUnits, unit => {
            if (includes(unit.referenceKeywords, 'Wizard')) {
                hasWizard = true
            }
        })
        if(find(Constants.regimentOfRenownsWithWizard, regimentOfRenown => regimentOfRenown?.id === roster.regimentOfRenown?.id)) {
            hasWizard = true
        }
        if (hasWizard) {
            warnings.push('Choose Manifestations Lore')
        }
    }
    let hasLegends = false
    forEach(roster.regiments, (regiment) => {
        forEach(regiment.units, unit => {
            if (unit.isLegends) {
                hasLegends = true
            }
        })
    })
    if (hasLegends) {
        warnings.push('You have Legends Unit in your Army')
    }
    return warnings
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

export const getWoundsCount = (roster) => {
    let woundsCount = 0
    forEach(roster.regiments, regiment => {
        forEach(regiment.units, unit => {
            woundsCount = woundsCount + (unit.modelCount * (unit.isReinforced ? 2 : 1) * unit.health)
        })
    })
    return woundsCount
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
    return keywords[0]?.name
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

export const getUnitsSortesByType = (faction, codexInfo, condition, parentCodexId) => {
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
        if (parentCodexId === Constants.vanilSpaceMarinesCodexId) {
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
    const detachmentAlliedId = find(dataBase.data.allied_faction_required_detachment, ['detachmentId', roster.detachmentId])?.alliedFactionId
    if (detachmentAlliedId) {
        const detachmentAlliedUnitsIds = filter(dataBase.data.allied_faction_datasheet, ['alliedFactionId', detachmentAlliedId])
        const detachmentAlliedUnits = map(detachmentAlliedUnitsIds, unit => find(dataBase.data.datasheet, datasheet => datasheet.id === unit.datasheetId))
        units = [...units, ...detachmentAlliedUnits]
    }
    const miniaturesData = map(units, unit => filter(dataBase.data.miniature, ['datasheetId', unit.id]))
    const unitsInfo = map(miniaturesData, miniatures => {
        const unitType = getUnitType(miniatures[0].id)
        const compositions = getCompositions(miniatures)
        return {unitType, compositions, points: get(compositions, '[0].points', 0)}
    })
    units = map(units, (unit, index) => ({...unit, ...unitsInfo[index]}))
    if (condition) {
        const keyword = find(dataBase.data.keyword, ['id', condition.keywordId])
        const unitIndex = findIndex(units, ['id', condition.datasheetId])
        if (unitIndex) {
            units[unitIndex].unitType = keyword.name
        }
    }
    return unitsSortesByType(units)
}

export const setDefaultWargears = (unit, unitType) => {
    const unitIndex = size(roster.units[unitType]) - 1
    const miniatures = sortByName(filter(dataBase.data.miniature, ['datasheetId', unit.id]), 'displayOrder')
    const wargearOptionGroups = map(miniatures, miniature => find(dataBase.data.wargear_option_group, wargearOptionGroup => wargearOptionGroup.miniatureId === miniature.id && wargearOptionGroup.instructionText === 'Default Wargear'))
    const wargearOptions = map(wargearOptionGroups, wargearOptionGroup => filter(dataBase.data.wargear_option, ['wargearOptionGroupId', wargearOptionGroup.id]))
    // const wargears = map(wargearOptions, wargears => map(wargears, wargear => find(dataBase.data.wargear_item_profile, ['wargearItemId', wargear.wargearItemId])))
    const wargears = map(wargearOptions, wargears => map(wargears, wargear => find(dataBase.data.wargear_item, ['id', wargear.wargearItemId])))
    const newWargears = {}
    roster.units[unitType][unitIndex].models = {}
    forEach(miniatures, (miniature, index) => {
        const compositions = filter(dataBase.data.unit_composition_miniature, ['miniatureId', miniature.id])
        const models = {
            min: min(map(compositions, composition => composition.min)),
            select: min(map(compositions, composition => composition.min)),
            max: max(map(compositions, composition => composition.max))
        }
        newWargears[miniature.name] = {}
        newWargears[miniature.name].default = {}
        forEach(wargearOptions[index], (item, i) => {
            const value = item.inputType === 'checkbox'
                ? true
                : models.min
            newWargears[miniature.name].default = {
                ...newWargears[miniature.name].default,
                [wargears[index][i].name]: value
            }
        })
        roster.units[unitType][unitIndex].models[miniature.name] = models
    })
    roster.units[unitType][unitIndex].wargears = newWargears
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

export const checkUnitPoints = (unitData) => {
    const unit = roster.units[unitData.unitType][unitData.unitIndex]
    const selectedModelsCount = map(unit.models, model => model.select)
    const points = find(unit.compositions, composition => {
        let isThisComposition = true
        forEach(composition.models, (model, index) => {
            if (model.min > selectedModelsCount[index] || selectedModelsCount[index] > model.max) {
                isThisComposition = false
            }
        })
        return isThisComposition
    })?.points
    if (points !== unit.points) {
        const pointsDifference = points - unit.points
        roster.units[unitData.unitType][unitData.unitIndex].points = points
        roster.points[unitData.unitType] += pointsDifference
        roster.points.all += pointsDifference
    }
}