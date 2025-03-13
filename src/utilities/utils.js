import parse from 'html-react-parser';
import Constants from '../Constants'

import map from 'lodash/map'
import get from 'lodash/get'
import size from 'lodash/size'
import find from 'lodash/find'
import filter from 'lodash/filter'
import indexOf from 'lodash/indexOf'
import forEach from 'lodash/forEach'
import replace from 'lodash/replace'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

const dataBase = require('../dataBase.json')

export const sortByName = (array, param) => param
    ? array.sort((a,b) => (a[param] > b[param]) ? 1 : ((b[param] > a[param]) ? -1 : 0))
    : array.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))

export const unitsSortesByType = (units) => {
    const getUnitsByType = (type) => {
        const _units = filter(units, unit => includes(unit?.referenceKeywords, type.name) && (type.withoutHero ? !includes(unit.referenceKeywords, 'Hero') : true))
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
    if (!roster.battleFormation  && !roster.withoutBattleFormation) {
        errors.push('Choose Battle Formation')
    }
    if (roster.generalRegimentIndex === null) {
        errors.push('Choose General')
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
        if (index === roster.generalRegimentIndex && regiment.units.length > 5) {
            errors.push("In General's Regiment you have more than 4 units")
        } else if (index !== roster.generalRegimentIndex && regiment.units.length > 4){
            errors.push(`In Regiment ${index + 1} you have more than 3 units`)
        }
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
            if (roster.requiredGeneral && unit.id === roster.requiredGeneral.id) {
                hasRequiredGeneral = true
                if (index === roster.generalRegimentIndex) {
                    isRequiredGeneralIsGeneral = true
                }
            }
        })
        if (roster.allegiance === 'Big Waaagh!') {
            if (get(regiment, 'units[0].name', '') === 'Kragnos, the End of Empire') {
            } else if (includes(get(regiment, 'units[0].referenceKeywords', ''), 'Ironjawz')) {
                jawsCount = jawsCount + 1
            } else if (includes(get(regiment, 'units[0].referenceKeywords', ''), 'Kruleboyz')) {
                krulsCount = krulsCount + 1
            }
        }
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
    if (hasWarmasterInRegiments.length && !includes(hasWarmasterInRegiments, roster.generalRegimentIndex) && !roster.requiredGeneral) {
        errors.push("You have a Warmaster hero, but he isn't your general")
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
    if (roster.allegiance === 'Ogor Mawtribes' && !roster.factionTerrain) {
        warnings.push('Choose Faction Terrain')
    }
    if (roster.allegiance === 'Disciples of Tzeentch' && !roster.spellsLore) {
        warnings.push('Choose Spells Lore')
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
    if (roster.auxiliaryUnits.length > 0) {
        forEach(roster.auxiliaryUnits, unit => {
            woundsCount = woundsCount + (unit.modelCount * (unit.isReinforced ? 2 : 1) * unit.health)
        })
    }
    if (roster.regimentOfRenown) {
        forEach(roster.regimentsOfRenownUnits, unit => {
            woundsCount = woundsCount + (unit.modelCount * (unit.isReinforced ? 2 : 1) * unit.health)
        })
    }
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

export const getInfo = (screen, allegiance) => {
    let abilitiesGroup = dataBase.data[screen.groupName].filter((item) => 
        item.factionId === allegiance.id &&
        item.abilityGroupType === screen.abilityGroupType &&
        (screen.includesTexts
            ? Boolean(screen.includesTexts.find(text => item.name.includes(text)))
            : true
        )
    )
    if (screen.abilityGroupType === 'battleTraits') {
        abilitiesGroup = [abilitiesGroup.find(({name})=> replaceQuotation(name).includes(replaceQuotation(allegiance.name)))]
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
    let alliganceId = find(dataBase.data.publication, ['id', publicationId])?.factionKeywordId
    if (includes(unit.referenceKeywords, 'Ironjawz')) {
        alliganceId = '298391fb-3d74-4a26-b9cc-5f3ad5fe4852'
    } else if (includes(unit.referenceKeywords, 'Kruleboyz')) {
        alliganceId = '21ed7371-d9e3-4a05-8b2c-db46cee7d29d'
    }
    const warscrollIds = dataBase.data.warscroll_faction_keyword.filter((item) => item.factionKeywordId === alliganceId).map(item => item.warscrollId)
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
                        screen: 'warscroll',
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
                    screen: 'warscroll',
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
