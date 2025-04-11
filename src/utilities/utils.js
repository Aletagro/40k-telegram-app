import parse from 'html-react-parser'
import Constants from '../Constants'
import {roster} from '../utilities/appState'

import map from 'lodash/map'
import min from 'lodash/min'
import max from 'lodash/max'
import size from 'lodash/size'
import find from 'lodash/find'
import filter from 'lodash/filter'
import indexOf from 'lodash/indexOf'
import forEach from 'lodash/forEach'
import replace from 'lodash/replace'
import includes from 'lodash/includes'
import findIndex from 'lodash/findIndex'
import lowerCase from 'lodash/lowerCase'

const dataBase = require('../dataBase.json')

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

export const regimentSortesByGrandAlliances = (regiments) => {
    const getRegimentByGrandAlliances = (grandAlliance) => {
        const _regiments = filter(regiments, regiment => includes(regiment.keywords, grandAlliance.name))
        if (_regiments.length > 0) {
            sortByName(_regiments)
            return {regiments: _regiments, title: grandAlliance.name}
        } else {
            return null
        }
    }
    return filter(map(Constants.grandAlliances, getRegimentByGrandAlliances), Boolean)
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
    if (roster.warlordId === null) {
        errors.push('Choose Warlord')
    }
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
    if (hasWarmasterInRegiments.length && !includes(hasWarmasterInRegiments, roster.warlordId) && !roster.requiredGeneral) {
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

export const capitalizeFirstLetter = (text) => {
    return String(text).charAt(0).toUpperCase() + String(text).slice(1);
}

export const camelCaseToWords = (text) => {
    if (text) {
        const result = text.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }
    return text
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

export const replaceQuotation = (string) => replace(string, '’', "'")

export const randomFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

export const getScoreParams = (battleplan) => {
    const data = find(Constants.battleplans, _battleplan => _battleplan.id === battleplan.id)
    if (data.maxForObjectives) {
        return {score: [...data.scoreParams], maxForObjectives: data.maxForObjectives}
    } else {
        return {score: data.scoreParams}
    }
}

export const getNewRound = (battleplan) => {
    const newRound = {
        firstPlayer: {
            tactics: {name: '', id: ''},
            vp: 0,
            objectiveVp: 0,
            ...getScoreParams(battleplan)
        },
        secondPlayer: {
            tactics: {name: '', id: ''},
            vp: 0,
            objectiveVp: 0,
            ...getScoreParams(battleplan)
        }
    }
    return newRound
}

export const setTacticColor = (tactic) => {
    const match = tactic.match(/Keywords:\s*(\S+)/)
    if (match) {
        const keyword = match[1].replaceAll('*', '')
        return Constants.tacticsTypes[keyword] || Constants.tacticsTypes.UNIVERSAL
    }
    return Constants.tacticsTypes.UNIVERSAL
}

export const getInfo = (screen, faction) => {
    let abilitiesGroup = dataBase.data[screen.groupName].filter((item) => 
        item.factionId === faction.id &&
        item.abilityGroupType === screen.abilityGroupType &&
        (screen.includesTexts
            ? Boolean(screen.includesTexts.find(text => item.name.includes(text)))
            : true
        )
    )
    if (screen.abilityGroupType === 'battleTraits') {
        abilitiesGroup = [abilitiesGroup.find(({name})=> replaceQuotation(name).includes(replaceQuotation(faction.name)))]
    }
    const abilitiesRules = abilitiesGroup.map(formation => dataBase.data[screen.ruleName].filter((item) => item[screen.ruleIdName] === formation?.id))
    const abilities = abilitiesGroup.map((formation, index) => {
        return {name: formation?.name, id: formation?.id, abilities: abilitiesRules[index]}
    })
    if (abilities.length > 0) {
        return {title: screen.title, abilities}
    } else {
        return null
    }
}

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

const hasKeyword = (unitKeywords, requiredKeywords , excludedKeywords) => {
    let isHas = false
    // Проверка, что все кейворды обязательные имеются
    const filtredKeywords = unitKeywords.filter(Keyword => requiredKeywords.find(requiredKeyword => requiredKeyword.id === Keyword.keywordId))
    if (requiredKeywords?.length === filtredKeywords?.length) {
        // Проверка, что нет исключающих кейвордов
        if (!unitKeywords.find(unitKeyword => {
            return find(excludedKeywords, ['id', unitKeyword.keywordId])
        })) {
            isHas = true
        }
    }
    return isHas
}

export const getRegimentOption = (option, unit) => {
    const publicationId = find(dataBase.data.warscroll_publication, ['warscrollId', unit.id])?.publicationId
    let factionId = find(dataBase.data.publication, ['id', publicationId])?.factionKeywordId
    const warscrollIds = dataBase.data.warscroll_faction_keyword.filter((item) => item.factionKeywordId === factionId).map(item => item.warscrollId)
    // определяем всех юнитов фракции
    const allUnits = warscrollIds.map(warscrollId => dataBase.data.warscroll.find(scroll => scroll.id === warscrollId)).filter(unit => !unit.isSpearhead && !unit.isLegends && unit.points !== null)
    // определяем кейворды всех юнитов фракции
    const allUnitsKeywordsIds = allUnits.map(unit => dataBase.data.warscroll_keyword.filter(keyword => keyword.warscrollId === unit.id))
    let units = []
    if (option.childQuantity === 'any') {
        if (option.requiredWarscrollId) {
                const requiredUnit = allUnits.find(warscroll => warscroll.id === option.requiredWarscrollId)
                if (requiredUnit) {
                    return {
                        screen: 'datasheet',
                        title: requiredUnit.name,
                        data: {unit: requiredUnit}
                    }
                }
        } else {
            // находим кейворды обязательных опций
            const optionRequiredKeywords = dataBase.data.warscroll_regiment_option_required_keyword.filter(({warscrollRegimentOptionId}) => warscrollRegimentOptionId === option.id)
            const requiredKeywords = optionRequiredKeywords.map(keyword => dataBase.data.keyword.find(({id}) => id === keyword?.keywordId))
            // // находим кейворды исключающих опций
            const optionExcludedKeywords = dataBase.data.warscroll_regiment_option_excluded_keyword.filter(({warscrollRegimentOptionId}) => warscrollRegimentOptionId === option.id)
            const excludedKeywords = optionExcludedKeywords.map(keyword => dataBase.data.keyword.find(({id}) => id === keyword?.keywordId))
            // // ищем нужных нам юнитов
            const legalUnits = allUnitsKeywordsIds.filter(unitKeywordsIds => hasKeyword(unitKeywordsIds, requiredKeywords, excludedKeywords))
            const legalUnitsIds = legalUnits.map(unit => unit[0].warscrollId)
            units = legalUnitsIds.map(legalUnitsId => allUnits.find(unit => unit.id === legalUnitsId))
        }
    }  else if (option.childQuantity === 'zeroToOne' || option.childQuantity === 'one') {
        if (option.requiredWarscrollId) {
            const requiredUnit = allUnits.find(warscroll => warscroll.id === option.requiredWarscrollId)
            if (requiredUnit) {
                return {
                    screen: 'datasheet',
                    title: requiredUnit.name,
                    data: {unit: requiredUnit}
                }
            }
        } else {
            // находим кейворды обязательных опций
            const requiredKeywordId = dataBase.data.warscroll_regiment_option_required_keyword.find(keyword => keyword.warscrollRegimentOptionId === option.id)?.keywordId
            const warscrollIds =  dataBase.data.warscroll_keyword.filter(warscrollKeyword => warscrollKeyword.keywordId === requiredKeywordId)
            // находим кейворды исключающих опций
            const excludedKeywordId = dataBase.data.warscroll_regiment_option_excluded_keyword.find(keyword => keyword.warscrollRegimentOptionId === option.id)?.keywordId
            const excludedKeyword =  dataBase.data.keyword.find(keyword => keyword.id === excludedKeywordId)?.name
            const warscrolls = warscrollIds.map(({warscrollId}) => {
                const _warscroll = allUnits.find(warscroll => warscroll.id === warscrollId && !warscroll.referenceKeywords.includes(excludedKeyword))
                if (_warscroll) {
                    return {..._warscroll, onlyOne: option.id}
                }
                return null
            }).filter(Boolean)
            if (warscrolls.length) {
                units = [...units, ...warscrolls]
            }
        }
    }
    if (size(units)) {
        return {
            screen: 'units',
            title: 'Units',
            data: {units}
        }
    }
    return {}
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

const getUnitType = (miniatureId) => {
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
                count: counts.max === counts.min ? counts.min : `${counts.min}-${counts.max}`
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

export const getUnitsSortesByType = (faction, codexInfo, condition) => {
    let units = []
    if (codexInfo) {
        units = filter(dataBase.data.datasheet, datasheet => datasheet.publicationId === codexInfo?.id)
    } else {
        const unitsIds = map(filter(dataBase.data.datasheet_faction_keyword, (item) => item.factionKeywordId === faction.id), item => item.datasheetId)
        units = map(unitsIds, unitId => find(dataBase.data.datasheet, datasheet => datasheet.id === unitId))
    }
    const imperialArmourId = find(dataBase.data.publication, publication => publication.factionKeywordId === faction.id && includes(publication.name, 'Imperial Armour:'))?.id
    const imperialArmourUnits = filter(dataBase.data.datasheet, ['publicationId', imperialArmourId])
    if (size(imperialArmourUnits)) {
        units = [...units, ...imperialArmourUnits]
    }
    const miniaturesData = map(units, unit => filter(dataBase.data.miniature, ['datasheetId', unit.id]))
    const unitsInfo = map(miniaturesData, miniatures => {
        const unitType = getUnitType(miniatures[0].id)
        const compositions = getCompositions(miniatures)
        return {unitType, compositions, points: compositions[0].points}
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
    const wargears = map(wargearOptions, wargears => map(wargears, wargear => find(dataBase.data.wargear_item_profile, ['wargearItemId', wargear.wargearItemId])))
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
        newWargears[miniature.name][wargearOptionGroups[index].id] = {}
        forEach(wargearOptions[index], (item, i) => {
            const value = item.inputType === 'checkbox'
                ? true
                : models.min
            newWargears[miniature.name][wargearOptionGroups[index].id] = {
                ...newWargears[miniature.name][wargearOptionGroups[index].id],
                [wargears[index][i].name]: value
            }
        })
        roster.units[unitType][unitIndex].models[miniature.name] = models
    })
    roster.units[unitType][unitIndex].wargears = newWargears
}
