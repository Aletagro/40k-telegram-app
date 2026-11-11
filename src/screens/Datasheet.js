import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import {useLocation} from 'react-router-dom'
// import Constants from '../Constants'
// import {calc} from '../utilities/appState'
import {replaceAsterisks, sortByName, removeDuplicates, getCompositions} from '../utilities/utils'
import Ability from '../components/Ability'
import HeaderImage from '../components/HeaderImage'
import Modal from '../components/Modal'
import {SectionTitle} from '../components/ListCard'
import WeaponChoice from '../icons/weaponChoice.svg'
// import Calculator from '../icons/calculator.svg'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'
import upperCase from 'lodash/upperCase'

import Styles from './styles/Datasheet.module.css'

const dataBase = require('../utilities/db')

const ShieldIcon = () => <svg className={Styles.shield} viewBox='0 0 24 24' aria-hidden='true'>
    <path d='M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z' />
</svg>

const Datasheet = () => {
    window.scrollTo(0, 0)
    const [modalData, setModalData] = useState({visible: false, title: '', text: ''})
    // const navigate = useNavigate()
    const unit = useLocation().state.unit
    const miniatures = sortByName(filter(dataBase.data.miniature, ['datasheetId', unit.id]), 'displayOrder')
    const invulSaves = filter(dataBase.data.invulnerable_save, ['datasheetId', unit.id])
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
    const compositions = unit.compositions || getCompositions(miniatures)
    const miniatureKeywords = sortByName(filter(dataBase.data.miniature_keyword, ['miniatureId', miniatures[0].id]), 'displayOrder')
    const keywords = map(miniatureKeywords, keyword => find(dataBase.data.keyword, ['id', keyword.keywordId]))
    const factionKeywordId = find(dataBase.data.datasheet_faction_keyword, ['datasheetId', unit.id])?.factionKeywordId
    const factionKeyword = find(dataBase.data.faction_keyword, ['id', factionKeywordId])?.name

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

    const renderCellTitle = (cell, index) => <span key={index} className={Styles.cellTitle}>{cell}</span>

    const renderCellValue = (cell, index) => <span key={index} className={Styles.cellValue}>{cell}</span>

    const renderWeaponAbility = (ability) => <button
        type='button'
        onClick={handleOpenModal(ability.name, replaceAsterisks(ability.rules))}
        key={ability.name}
        className={Styles.chip}
    >
        {ability.name}
    </button>

    const renderWeapon = (titles, getValues) => (weapon) => {
        const weaponAbilities = getWeaponAbilities(weapon.id)
        const isProfile = weapon.weaponName !== weapon.name
        return <div key={weapon.id} className={Styles.weapon}>
            <div className={Styles.weaponName}>
                <span>{isProfile ? `${weapon.weaponName} - ${weapon.name}` : weapon.name}</span>
                {isProfile
                    ? <img
                        className={Styles.weaponChoiceIcon}
                        onClick={handleOpenModal(weapon.weaponName, 'Before selecting targets for this weapon, select one of its profiles to make attacks with.')}
                        src={WeaponChoice}
                        alt=''
                    />
                    : null
                }
            </div>
            <div className={Styles.weaponTable} style={{gridTemplateColumns: `repeat(${size(titles)}, 1fr)`}}>
                {map(titles, renderCellTitle)}
                {map(getValues(weapon), renderCellValue)}
            </div>
            {size(weaponAbilities) ? <div className={Styles.chips}>{map(weaponAbilities, renderWeaponAbility)}</div> : null}
        </div>
    }

    const renderRangeWeapon = renderWeapon(
        ['Rng', 'Atk', 'BS', 'Str', 'AP', 'Dmg'],
        weapon => [weapon.range, weapon.attacks, weapon.ballisticSkill, weapon.strength, weapon.armourPenetration, weapon.damage]
    )

    const renderMeleeWeapon = renderWeapon(
        ['Atk', 'WS', 'Str', 'AP', 'Dmg'],
        weapon => [weapon.attacks, weapon.weaponSkill, weapon.strength, weapon.armourPenetration, weapon.damage]
    )

    const renderSubAbility = (ability) => <Ability
        key={ability.id}
        ability={ability}
        keyword={find(datasheetAbilities, ['id', ability.datasheetAbilityId])?.name}
    />

    const renderAbility = (ability, index) => <React.Fragment key={ability.id}>
        <Ability ability={ability} />
        {map(datasheetSubAbilities[index], renderSubAbility)}
    </React.Fragment>

    const renderCoreAbility = (ability) => <button
        type='button'
        onClick={handleOpenModal(ability.name, replaceAsterisks(ability.rules))}
        key={ability.name}
        className={Styles.coreChip}
    >
        {ability.name}
    </button>

    const renderAdditionalAbility = (ability) => <Ability key={ability.id} ability={ability} kind='rule' />

    const renderCharacteristic = (characteristic) => <div key={characteristic.title} className={Styles.stat}>
        <span className={Styles.statTitle}>{characteristic.title}</span>
        <span className={Styles.statValue}>{characteristic.value}</span>
    </div>

    // Неуязвимое спасение: компактная строка внутри плашки характеристик
    const renderInvul = (invul) => <div key={invul.id} className={Styles.invul}>
        <ShieldIcon />
        <span className={Styles.invulValue}>{invul.save || invul.rangedSave || invul.meleeSave}</span>
        <span className={Styles.invulLabel}>{t('Invulnerable Save')}</span>
        {invul.rangedSave && invul.meleeSave && !invul.save
            ? <span className={Styles.invulNote}>ranged {invul.rangedSave}, melee {invul.meleeSave}</span>
            : null
        }
        {invul.rules ? <span className={Styles.invulNote}>{replaceAsterisks(invul.rules)}</span> : null}
    </div>

    const renderWargearRule = (wargearRule) =>
        <p key={wargearRule.id} className={Styles.text}>{replaceAsterisks(wargearRule.rulesText)}</p>

    const renderTableRow = (composition, unitIndex) => <React.Fragment key={unitIndex}>
        {composition.title
            ? <tr><td colSpan={3} className={Styles.compositionTitle}>{composition.title}</td></tr>
            : null
        }
        {composition.models.map((model, modelIndex) => <tr key={`${unitIndex}-${modelIndex}`}>
            <td>{model.name}</td>
            <td className={Styles.tableCount}>{model.count}</td>
            {modelIndex === 0
                ? <td className={Styles.tableCount} rowSpan={composition.models.length}>{composition.points}</td>
                : null
            }
        </tr>)}
    </React.Fragment>

    const renderCompositionsTable = () => <table className={Styles.table}>
        <thead>
            <tr>
                <th>{t('Model Name')}</th>
                <th>{t('Count')}</th>
                <th>{t('Points')}</th>
            </tr>
        </thead>
        <tbody>
            {map(compositions, renderTableRow)}
        </tbody>
    </table>

    const renderKeyword = (keyword, index) => <b key={keyword.id}>{upperCase(keyword.name)}{index + 1 === size(keywords) ? '' : ', '}</b>

    // Общее неуязвимое спасение показываем в плашке первой видимой модели
    const datasheetInvulSaves = filter(invulSaves, save => !save.miniatureId)
    const firstVisibleMiniatureId = find(miniatures, miniature => !miniature.statlineHidden)?.id

    const renderMiniature = (miniature) => {
        if (miniature.statlineHidden) {
            return null
        }
        const characteristics = [
            {value: miniature.movement, title: 'M'},
            {value: miniature.toughness, title: 'T'},
            {value: miniature.save, title: 'SV'},
            {value: miniature.wounds, title: 'W'},
            {value: miniature.leadership, title: 'LD'},
            {value: miniature.objectiveControl, title: 'OC'}
        ]
        return <div key={miniature.id} className={`${Styles.statCard} ${miniature.id === firstVisibleMiniatureId ? Styles.overlap : ''}`}>
            {size(miniatures) > 1 ? <p className={Styles.miniatureName}>{miniature.name}</p> : null}
            <div className={Styles.stats}>
                {map(characteristics, renderCharacteristic)}
            </div>
            {map(filter(invulSaves, ['miniatureId', miniature.id]), renderInvul)}
            {miniature.id === firstVisibleMiniatureId ? map(datasheetInvulSaves, renderInvul) : null}
        </div>
    }

    return <>
        <HeaderImage src={unit.bannerImage} alt={unit.name} />
        <div className={Styles.container}>
            {map(miniatures, renderMiniature)}
            {firstVisibleMiniatureId ? null : <div className={Styles.statCard}>{map(datasheetInvulSaves, renderInvul)}</div>}
            {size(rangeWeapons)
                ? <>
                    <SectionTitle>{t('Ranged Weapons')}</SectionTitle>
                    {map(rangeWeapons, renderRangeWeapon)}
                </>
                : null
            }
            {size(meleeWeapons)
                ? <>
                    <SectionTitle>{t('Melee Weapons')}</SectionTitle>
                    {map(meleeWeapons, renderMeleeWeapon)}
                </>
                : null
            }
            {size(datasheetAbilities)
                ? <>
                    <SectionTitle>{t('Abilities')}</SectionTitle>
                    {map(datasheetAbilities, renderAbility)}
                </>
                : null
            }
            {size(coreAbilities)
                ? <>
                    <SectionTitle>{t('Core Abilities')}</SectionTitle>
                    <div className={Styles.coreChips}>{map(coreAbilities, renderCoreAbility)}</div>
                </>
                : null
            }
            {size(additionalAbilities)
                ? <>
                    <SectionTitle>{t('Additional Abilities')}</SectionTitle>
                    {map(additionalAbilities, renderAdditionalAbility)}
                </>
                : null
            }
            {damagedInfo ? <Ability ability={damagedInfo} kind='damaged' /> : null}
            <SectionTitle>{t('Unit Composition')}</SectionTitle>
            <div className={Styles.card}>
                {unit.unitComposition ? <p className={Styles.text}>{replaceAsterisks(unit.unitComposition)}</p> : null}
                {size(wargearRules) ? map(wargearRules, renderWargearRule) : null}
                {unit.baseSize ? <p className={Styles.muted}>Base size: {unit.baseSize}</p> : null}
            </div>
            {size(compositions) ? renderCompositionsTable() : null}
            {size(keywords) || factionKeyword
                ? <div className={Styles.card}>
                    {size(keywords) ? <p className={Styles.keywords}>Keywords: {map(keywords, renderKeyword)}</p> : null}
                    {factionKeyword ? <p className={Styles.keywords}>{t('Faction Keyword:')} <b>{upperCase(factionKeyword)}</b></p> : null}
                </div>
                : null
            }
        </div>
        <Modal {...modalData} onClose={handleCloseModal} />
    </>
}

export default Datasheet
