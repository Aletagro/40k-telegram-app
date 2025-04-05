import React, {useState} from 'react'
import {useLocation} from 'react-router-dom'
// import Constants from '../Constants'
// import {calc} from '../utilities/appState'
import {replaceAsterisks, sortByName, removeDuplicates} from '../utilities/utils'
import Ability from '../components/Ability'
import HeaderImage from '../components/HeaderImage'
import Modal from '../components/Modal'
import WeaponChoice from '../icons/weaponChoice.svg'
// import Calculator from '../icons/calculator.svg'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'
import upperCase from 'lodash/upperCase'

import Styles from './styles/Datasheet.module.css'

const dataBase = require('../dataBase.json')

const Datasheet = () => {
    window.scrollTo(0, 0)
    const [modalData, setModalData] = useState({visible: false, title: '', text: ''})
    // const navigate = useNavigate()
    const unit = useLocation().state.unit
    const miniatures = filter(dataBase.data.miniature, ['datasheetId', unit.id])
    const miniature = miniatures[0]
    const invul = find(dataBase.data.invulnerable_save, ['datasheetId', unit.id])
    const wargearOptionGroups = filter(dataBase.data.wargear_option_group, wargearOptionGroup => wargearOptionGroup.datasheetId === unit.id)
    const wargearOptions = map(wargearOptionGroups, wargearOptionGroup => filter(dataBase.data.wargear_option, wargearOption => wargearOption.wargearOptionGroupId === wargearOptionGroup.id))
    const wargearItems = map(wargearOptions, wargearOption => map(wargearOption, option => find(dataBase.data.wargear_item, wargearItem => wargearItem.id === option.wargearItemId)))
    const weapons = map(wargearItems, wargearItem => map(wargearItem, item => filter(dataBase.data.wargear_item_profile, weapon => weapon.wargearItemId === item.id)))
    let meleeWeapons = []
    let rangeWeapons = []
    forEach(weapons, (weapon, i) => {
        forEach(weapon, (profiles, index) => {
            if(size(profiles)) {
                if (profiles[0].type === 'melee') {
                    forEach(profiles, profile => meleeWeapons.push({weaponName: wargearItems[i][index]?.name, ...profile}))
                } else if (profiles[0].type === 'ranged') {
                    forEach(profiles, profile => rangeWeapons.push({weaponName: wargearItems[i][index]?.name, ...profile}))
                }
            }
        })
    })
    meleeWeapons = sortByName(removeDuplicates(meleeWeapons), 'weaponName')
    rangeWeapons = sortByName(removeDuplicates(rangeWeapons), 'weaponName')
    const abilitiesData = filter(dataBase.data.datasheet_datasheet_ability, ability => ability.datasheetId === unit.id)
    const abilities = map(abilitiesData, data => find(dataBase.data.datasheet_ability, ability => ability.id === data.datasheetAbilityId))
    const coreAbilities = filter(abilities, ability => ability.abilityType === 'core')
    const datasheetAbilities = filter(abilities, ability => ability.abilityType === 'datasheet')
    const datasheetSubAbilities = map(datasheetAbilities, ability => filter(dataBase.data.datasheet_sub_ability, subAbility => subAbility.datasheetAbilityId === ability.id))
    const additionalAbilities = filter(dataBase.data.datasheet_rule , rule => rule.datasheetId === unit.id)
    const damagedInfo = find(dataBase.data.datasheet_damage , damage => damage.datasheetId === unit.id)
    const wargearRules = filter(dataBase.data.wargear_rule, ['datasheetId', unit.id])
    const compositionsSize = map(miniatures, _miniature => filter(dataBase.data.unit_composition_miniature, composition => composition.miniatureId === _miniature.id))
    const compositionsPoints = filter(dataBase.data.unit_composition, composition => composition.datasheetId === unit.id)
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
    const miniatureKeywords = sortByName(filter(dataBase.data.miniature_keyword, ['miniatureId', miniature.id]), 'displayOrder')
    const keywords = map(miniatureKeywords, keyword => find(dataBase.data.keyword, ['id', keyword.keywordId]))
    const factionKeywordId = find(dataBase.data.datasheet_faction_keyword, ['datasheetId', unit.id])?.factionKeywordId
    const factionKeyword = find(dataBase.data.faction_keyword, ['id', factionKeywordId])?.name

    const characteristics = [
        {value: miniature.movement, title: 'M'},
        {value: miniature.toughness, title: 'T'},
        {value: miniature.save, title: 'SV'},
        {value: miniature.wounds, title: 'W'},
        {value: miniature.leadership, title: 'LD'},
        {value: miniature.objectiveControl, title: 'OC'}
    ]

    const getWeaponAbilities = (weaponId) => {
        const abilitiesIds = map(filter(dataBase.data.wargear_item_profile_wargear_ability, ability => ability.wargearItemProfileId === weaponId), ability => ability.wargearAbilityId)
        const abilities = map(abilitiesIds, abilityId => find(dataBase.data.wargear_ability, wpAbility => wpAbility.id === abilityId))
        return abilities
    }

    // const getWeaponAbilityForCalculator = (abilities, name) => Boolean(abilities.find(ability => ability.name === name))

    const handleCloseModal = () => {
        setModalData({visible: false, title: '', text: ''})
    }

    const handleOpenModal = (title, text) => () => {
        setModalData({visible: true, title, text})
    }

    // const handleNavigateToCalculator = () => {
    //     const weaponsAbilities = map(weapons, weapon => getWeaponAbilities(weapon.id))
    //     const weaponsForCalculator = map(weapons, (weapon, index) => ({
    //         name: weapon.name,
    //         attacks: getValue(weapon.attacks),
    //         damage: getValue(weapon.damage),
    //         toHit: Number(weapon.hit[0]),
    //         toWound: Number(weapon.wound[0]),
    //         models: Number(unit.modelCount),
    //         rend: Number(weapon.rend) || 0,
    //         champion: includes(unit.referenceKeywords, 'Champion') && !getWeaponAbilityForCalculator(weaponsAbilities[index], 'Companion'),
    //         mortal: getWeaponAbilityForCalculator(weaponsAbilities[index], 'Crit (Mortal)'),
    //         autoWound: getWeaponAbilityForCalculator(weaponsAbilities[index], 'Crit (Auto-wound)'),
    //         doubleHit: getWeaponAbilityForCalculator(weaponsAbilities[index], 'Crit (2 Hits)'),
    //         critOn: Constants.critOn[2]
    //     }))
    //     calc.units = [{name: unit.name, weapons: weaponsForCalculator}]
    //     navigate('/calculator', {state: {weapons: weaponsForCalculator, title: 'Damage Calculator'}})
    // }

    const renderCellTitle = (cell, index) => <p key={index} id={Styles.cellTitle}>{cell}</p>

    const renderCellValue = (cell, index) => <p key={index} id={Styles.cellValue}>{cell}</p>

    const renderWeaponAbility = (ability) => <button
        onClick={handleOpenModal(ability.name, replaceAsterisks(ability.rules))}
        key={ability.name}
        id={Styles.weaponAbilities}
    >
        {ability.name}
    </button>

    const renderRangeWeapon = (weapon) => {
        const weaponAbilities = getWeaponAbilities(weapon.id)
        const titles = ['Rng', 'Atk', 'BS', 'Str', 'AP', 'Dmg']
        const values = [weapon.range, weapon.attacks, weapon.ballisticSkill, weapon.strength, weapon.armourPenetration, weapon.damage]
        return <div key={weapon.id} id={Styles.weaponContainer}>
            <div id={Styles.weaponNameContainer}>
                {weapon.weaponName === weapon.name
                    ? null
                    : <img id={Styles.weaponChoiceIcon} onClick={handleOpenModal(weapon.weaponName, 'Before selecting targets for this weapon, select one of its profiles to make attacks with.')} src={WeaponChoice} alt="" />
                }
                <p id={Styles.weaponName}>{weapon.weaponName === weapon.name ? weapon.name : `${weapon.weaponName} - ${weapon.name}`}</p>
            </div>
            <div id={Styles.weaponCharacteristicsContainer}>
                {map(titles, renderCellTitle)}
            </div>
            <div id={Styles.weaponCharacteristicsContainer}>
                {map(values, renderCellValue)}
            </div>
            <div id={Styles.weaponAbilityContainer}>
                {map(weaponAbilities, renderWeaponAbility)}
            </div>
        </div>
    }

    const renderMeleeWeapon = (weapon) => {
        const weaponAbilities = getWeaponAbilities(weapon.id)
        const titles = ['Atk', 'WS', 'Str', 'AP', 'Dmg']
        const values = [weapon.attacks, weapon.weaponSkill, weapon.strength, weapon.armourPenetration, weapon.damage]
        return <div key={weapon.id} id={Styles.weaponContainer}>
            <div id={Styles.weaponNameContainer}>
                <p id={Styles.weaponName}>{weapon.weaponName === weapon.name ? weapon.name : `${weapon.weaponName} - ${weapon.name}`}</p>
            </div>
            <div id={Styles.weaponCharacteristicsContainer}>
                {map(titles, renderCellTitle)}
            </div>
            <div id={Styles.weaponCharacteristicsContainer}>
                {map(values, renderCellValue)}
            </div>
            <div id={Styles.weaponAbilityContainer}>
                {map(weaponAbilities, renderWeaponAbility)}
            </div>
        </div>
    }

    const renderSubAbility = (ability) => <Ability
        key={ability.id}
        ability={ability}
        keyword={find(datasheetAbilities, ['id', ability.datasheetAbilityId])?.name}
    />

    const renderAbility = (ability, index) => <>
        <Ability key={ability.id} ability={ability} />
        {size(datasheetSubAbilities[index])
            ? map(datasheetSubAbilities[index], renderSubAbility)
            : null
        }
    </>

    const renderAdditionalAbility = (ability, index) => <Ability key={ability.id} ability={ability} />

    const renderCharacteristic = (characteristic, index) => <div key={index} id={Styles.characteristicSubContainer} style={{width: '20%'}}>
        <p id={Styles.characteristicTitle}>{characteristic.title}</p>
        <div id={Styles.characteristicValueContainer}>
            <p id={characteristic.value?.length > 3 ? Styles.characteristicLongValue : Styles.characteristicValue}>
                {characteristic.value}
            </p>
        </div>
    </div>

    const renderWargearRule = (wargearRule) =>
        <p id={Styles.unitDetailsText}>{replaceAsterisks(wargearRule.rulesText)}</p>

    const renderTableRow = (composition, unitIndex) => <React.Fragment key={unitIndex}>
        {composition.models.map((model, modelIndex) => <>
            {composition.title ? <b id={Styles.compositionTitle}>{composition.title}</b> : null}
            <tr key={`${unitIndex}-${modelIndex}`} style={{'background': `${unitIndex % 2 === 1 ? '#ECECEC' : ''}`}}>
                <td>{model.name}</td>
                <td id={Styles.tableCount}>{model.count}</td>
                {modelIndex === 0 && (
                <td id={Styles.tableCount} rowSpan={composition.models.length}>
                    {composition.points}
                </td>
                )}
            </tr>
        </>)}
    </React.Fragment>

    const renderCompositionsTable = () => <div id={Styles.tableContainer}>
        <table className={Styles.table}>
        <thead>
            <tr>
            <th>Model Name</th>
            <th>Count</th>
            <th>Points</th>
            </tr>
        </thead>
        <tbody>
            {map(compositions, renderTableRow)}
        </tbody>
        </table>
    </div>

    const renderKeyword = (keyword, index) => <b key={keyword.id}>{upperCase(keyword.name)}{index + 1 === size(keywords) ? '' : ', '}</b>

    return <>
        <HeaderImage src={unit.bannerImage} alt={unit.name} />
        <div id={Styles.container}>
            <div id={Styles.characteristicsContainer} className={Styles.flexContainer}>
                {map(characteristics, renderCharacteristic)}
            </div>
            {invul
                ? <Ability ability={{
                    name: 'Invulnerable Save',
                    invul: invul.save,
                    rules: invul.rules
                }} />
                : null
            }
            {size(rangeWeapons)
                ? <>
                    <div id={Styles.weaponTitleContainer}>
                        <h3 id={Styles.warscrollChapterTitle}>Range Weapons</h3>
                        {/* <button id={Styles.calculator} onClick={handleNavigateToCalculator}><img src={Calculator} alt="" /></button> */}
                    </div>
                    {map(rangeWeapons, renderRangeWeapon)}
                </>
                : null
            }
            {size(meleeWeapons)
                ? <>
                    <div id={Styles.weaponTitleContainer}>
                        <h3 id={Styles.warscrollChapterTitle}>Melee Weapons</h3>
                        {/* <button id={Styles.calculator} onClick={handleNavigateToCalculator}><img src={Calculator} alt="" /></button> */}
                    </div>
                    {map(meleeWeapons, renderMeleeWeapon)}
                </>
                : null
            }
            {size(datasheetAbilities)
                ? <>
                    <h3 id={Styles.warscrollChapterTitle}>Abilities</h3>
                    {map(datasheetAbilities, renderAbility)}
                </>
                : null
            }
            {size(coreAbilities)
                ? <div id={Styles.coreAbilitiesContainer}>
                    <h3 id={Styles.warscrollChapterTitle}>Core Abilities</h3>
                    {map(coreAbilities, renderWeaponAbility)}
                </div>
                : null
            }
            {size(additionalAbilities)
                ? <>
                    <h3 id={Styles.warscrollChapterTitle}>Additional Abilities</h3>
                    {map(additionalAbilities, renderAdditionalAbility)}
                </>
                : null
            }
            {damagedInfo
                ? <Ability ability={damagedInfo} />
                : null
            }
            <div id={Styles.unitDetailsContainer}>
                <p id={Styles.unitDetailsTitle}>Unit Composition</p>
                <div id={Styles.unitDetailsSubContainer}>
                    {unit.unitComposition ? <p id={Styles.unitDetailsText}>{replaceAsterisks(unit.unitComposition)}</p> : null}
                    {size(wargearRules) ? map(wargearRules, renderWargearRule) : null}
                </div>
            </div>
            {size(compositions) ? renderCompositionsTable() : null}
            {size(keywords)
                ? <>
                    <p id={Styles.keywords}>Keywords: {map(keywords, renderKeyword)}</p>
                </>
                : null
            }
            {factionKeyword ? <p id={Styles.keywords}>Faction Keyword: <b>{upperCase(factionKeyword)}</b></p> : null}
        </div>
        <Modal {...modalData} onClose={handleCloseModal} />
    </>
}

export default Datasheet