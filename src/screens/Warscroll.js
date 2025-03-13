import React, {useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import Constants from '../Constants'
import {calc} from '../utilities/appState'
import {getValue, replaceAsterisks, getRegimentOption} from '../utilities/utils'
import Ability from '../components/Ability'
import HeaderImage from '../components/HeaderImage'
import Modal from '../components/Modal'
import Calculator from '../icons/calculator.svg'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'
import includes from 'lodash/includes'

import Styles from './styles/Warscroll.module.css'

const dataBase = require('../dataBase.json')

const Warscroll = () => {
    window.scrollTo(0, 0)
    const [modalData, setModalData] = useState({visible: false, title: '', text: ''})
    const navigate = useNavigate()
    const unit = useLocation().state.unit
    const weapons = filter(dataBase.data.warscroll_weapon, weapon => weapon.warscrollId === unit.id)
    const meleeWeapons = filter(weapons, weapon => weapon.type === 'melee')
    const rangeWeapons = filter(weapons, weapon => weapon.type === 'ranged')
    let abilities = filter(dataBase.data.warscroll_ability, ability => ability.warscrollId === unit.id)
    const regimentOptions = filter(dataBase.data.warscroll_regiment_option, option => option.warscrollId === unit.id)
    const isManifestation = includes(unit.referenceKeywords, 'Manifestation')
    const manifestationInfo = isManifestation ? find(dataBase.data.lore_ability, ability => ability.linkedWarscrollId === unit.id) : undefined
    const characteristics = [
        {value: unit.move, title: 'Move'},
        {value: unit.health, title: 'Health'},
        {value: unit.control, title: isManifestation ? 'Banish' : 'Control'},
        {value: unit.save, title: 'Save'}
    ]
    if (manifestationInfo) {
        abilities = [...abilities, manifestationInfo]
        characteristics.splice(3, 0, {value: `${manifestationInfo.castingValue}+`, title: 'Cast'})
    }

    const getWeaponAbilities = (weaponId) => {
        const abilitiesIds = map(filter(dataBase.data.warscroll_weapon_weapon_ability, ability => ability.warscrollWeaponId === weaponId), ability => ability.weaponAbilityId)
        const abilities = map(abilitiesIds, abilityId => find(dataBase.data.weapon_ability, wpAbility => wpAbility.id === abilityId))
        return abilities
    }

    const getWeaponAbilityForCalculator = (abilities, name) => Boolean(abilities.find(ability => ability.name === name))

    const handleCloseModal = () => {
        setModalData({visible: false, title: '', text: ''})
    }

    const handleOpenModal = (title, text) => () => {
        setModalData({visible: true, title, text})
    }

    const handleNavigateToCalculator = () => {
        const weaponsAbilities = map(weapons, weapon => getWeaponAbilities(weapon.id))
        const weaponsForCalculator = map(weapons, (weapon, index) => ({
            name: weapon.name,
            attacks: getValue(weapon.attacks),
            damage: getValue(weapon.damage),
            toHit: Number(weapon.hit[0]),
            toWound: Number(weapon.wound[0]),
            models: Number(unit.modelCount),
            rend: Number(weapon.rend) || 0,
            champion: includes(unit.referenceKeywords, 'Champion') && !getWeaponAbilityForCalculator(weaponsAbilities[index], 'Companion'),
            mortal: getWeaponAbilityForCalculator(weaponsAbilities[index], 'Crit (Mortal)'),
            autoWound: getWeaponAbilityForCalculator(weaponsAbilities[index], 'Crit (Auto-wound)'),
            doubleHit: getWeaponAbilityForCalculator(weaponsAbilities[index], 'Crit (2 Hits)'),
            critOn: Constants.critOn[2]
        }))
        calc.units = [{name: unit.name, weapons: weaponsForCalculator}]
        navigate('/calculator', {state: {weapons: weaponsForCalculator, title: 'Damage Calculator'}})
    }

    const handleClickRegimentOption = (option) => () => {
        const {screen, title, data} = getRegimentOption(option, unit)
        if (screen) {
            navigate(`/${screen}`, {state: {title, ...data}})
        }
    }

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
        const titles = ['Rng', 'Atk', 'Hit', 'Wnd', 'Rnd', 'Dmg']
        const values = [weapon.range, weapon.attacks, weapon.hit, weapon.wound, weapon.rend, weapon.damage]
        return <div key={weapon.id} id={Styles.weaponContainer}>
            <div id={Styles.weaponNameContainer}>
                <p id={Styles.weaponName}>{weapon.name}</p>
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
        const titles = ['Atk', 'Hit', 'Wnd', 'Rnd', 'Dmg']
        const values = [weapon.attacks, weapon.hit, weapon.wound, weapon.rend, weapon.damage]
        return <div key={weapon.id} id={Styles.weaponContainer}>
            <div id={Styles.weaponNameContainer}>
                <p id={Styles.weaponName}>{weapon.name}</p>
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

    const renderAbility = (ability) => <Ability key={ability.id} ability={ability} />

    const renderRegimentOption = (option) => <p
        onClick={handleClickRegimentOption(option)}
        id={Styles.regimentOption}
        key={option.id}
    >
        {replaceAsterisks(option.optionText)}
    </p>

    const renderCharacteristic = (characteristic) => <div key={characteristic.value} id={Styles.characteristicSubContainer} style={{width: '20%'}}>
        <div id={Styles.characteristicValueContainer}>
            <p id={characteristic.value.length > 3 ? Styles.characteristicLongValue : Styles.characteristicValue}>
                {characteristic.value}
            </p>
        </div>
        <p id={Styles.characteristicTitle}>{characteristic.title}</p>
    </div>

    return <>
        <HeaderImage src={unit.bannerImage} alt={unit.name} />
        <div id={Styles.container}>
            <div id={Styles.characteristicsContainer} className={Styles.flexContainer}>
                {map(characteristics, renderCharacteristic)}
            </div>
            {rangeWeapons.length > 0
                ? <>
                    <div id={Styles.weaponTitleContainer}>
                        <h3 id={Styles.warscrollChapterTitle}>Range Weapons</h3>
                        <button id={Styles.calculator} onClick={handleNavigateToCalculator}><img src={Calculator} alt="" /></button>
                    </div>
                    {map(rangeWeapons, renderRangeWeapon)}
                </>
                : null
            }
            {meleeWeapons.length > 0
                ? <>
                    <div id={Styles.weaponTitleContainer}>
                        <h3 id={Styles.warscrollChapterTitle}>Melee Weapons</h3>
                        <button id={Styles.calculator} onClick={handleNavigateToCalculator}><img src={Calculator} alt="" /></button>
                    </div>
                    {map(meleeWeapons, renderMeleeWeapon)}
                </>
                : null
            }
            {abilities.length > 0
                ? <>
                    <h3 id={Styles.warscrollChapterTitle}>Abilities</h3>
                    {map(abilities, renderAbility)}
                </>
                : null
            }
            <div id={Styles.unitDetailsContainer}>
                <p id={Styles.unitDetailsTitle}>Unit Details</p>
                <div id={Styles.unitDetailsSubContainer}>
                    <p id={Styles.unitDetailsText}>{unit.modelCount} model</p>
                    {unit.wargearOptionsText ? <p id={Styles.wargearOptions}>{replaceAsterisks(unit.wargearOptionsText)}</p> : null}
                    {unit.points ? <p id={Styles.unitDetailsText}>{unit.points} points</p> : null}
                    {unit.baseSize ? <p id={Styles.unitDetailsText}><b>Base size:</b> {unit.baseSize}</p> : null}
                    {regimentOptions.length > 0
                        ? <>
                            <b>Regiment Options</b>
                            <div id={Styles.regimentOptionContainer}>
                                {map(regimentOptions, renderRegimentOption)}
                            </div>
                        </>
                        : null
                    }
                    {unit.notes ? <p id={Styles.unitDetailsText}>Notes: {replaceAsterisks(unit.notes)}</p> : null}
                    {unit.isLegends ? <b id={Styles.unitDetailsText}> This unit is in Legend</b> : null}
                </div>
            </div>
            {unit.referenceKeywords
                ? <>
                    <p id={Styles.keywords}>Keywords: <b>{unit.referenceKeywords}</b></p>
                </>
                : null
            }
        </div>
        <Modal {...modalData} onClose={handleCloseModal} />
    </>
}

export default Warscroll