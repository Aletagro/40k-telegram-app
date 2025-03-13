import React, {useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import {replaceAsterisks} from '../utilities/utils'
import Plus from '../icons/plus.svg'
import Minus from '../icons/minus.svg'

import Styles from './styles/ChooseWeapon.module.css'

const dataBase = require('../dataBase.json')

const ChooseWeapon = () => {
    const {selectedWeaponOptions, weaponOptions, unitIndex, regimentIndex, isAuxiliary, isReinforced} = useLocation().state
    const navigate = useNavigate()
    const [selectedWeapons, setSelectedWeapons] = useState(selectedWeaponOptions || {})

    const handleApply = () => {
        if (isAuxiliary) {
            const newUnit = {...roster.auxiliaryUnits[unitIndex], weaponOptions: selectedWeapons}
            roster.auxiliaryUnits[unitIndex] = newUnit
        } else {
            const newUnit = {...roster.regiments[regimentIndex].units[unitIndex], weaponOptions: selectedWeapons}
            roster.regiments[regimentIndex].units[unitIndex] = newUnit
        }
        navigate(-1)
    }

    const handleClickMinus = (weaponOptionId, weapon) => () => {
        const weaponOption = selectedWeapons[weaponOptionId] || {}
        const weaponCount = (weaponOption[weapon.name] || 0) - 1
        setSelectedWeapons({
            ...selectedWeapons,
            [weaponOptionId]: {...weaponOption, [weapon.name]: weaponCount}
        })
    }

    const handleClickPlus = (weaponOptionId, weapon) => () => {
        const weaponOption = selectedWeapons[weaponOptionId] || {}
        const weaponCount = (weaponOption[weapon.name] || 0) + 1
        setSelectedWeapons({
            ...selectedWeapons,
            [weaponOptionId]: {...weaponOption, [weapon.name]: weaponCount}
        })
    }

    const renderWeapon = (weaponOptionId, limit) => (optionWeapon) => {
        const weapon = dataBase.data.warscroll_weapon.find(warscrollWeapon => warscrollWeapon.id === optionWeapon.weaponId)
        const weaponOption = selectedWeapons[weaponOptionId] || {}
        let weaponOptionCount = 0
        Object.entries(weaponOption).forEach(([key, value]) => {
            weaponOptionCount = weaponOptionCount + value
        })
        const weaponCount = weaponOption[weapon.name] || 0
        const disabledMinus = weaponCount === 0
        const disabledPlus = weaponOptionCount === limit
        return <div id={Styles.row}>
            <p id={Styles.text}>{weapon.name}</p>
            <div id={Styles.countContainer}>
                <button id={disabledMinus ? Styles.disabledButton : Styles.button} disabled={disabledMinus} onClick={handleClickMinus(weaponOptionId, weapon)}><img src={Minus} alt="" /></button>
                <p id={Styles.count}>{weaponCount}</p>
                <button id={disabledPlus ? Styles.disabledButton : Styles.button} disabled={disabledPlus} onClick={handleClickPlus(weaponOptionId, weapon)}><img src={Plus} alt="" /></button>
            </div>
        </div>
    }

    const renderWeaponOption = (weaponOption) => {
        const options = dataBase.data.option.filter(option => option.optionGroupId === weaponOption.id)
        const optionWeapons = options.map(optionWeapon => dataBase.data.option_weapon.find(weapon => weapon.optionId === optionWeapon.id))
        return <div>
            <p id={Styles.note}>{replaceAsterisks(weaponOption.name)}</p>
            {optionWeapons.map(renderWeapon(weaponOption.id, isReinforced ? weaponOption.reinforcedLimit : weaponOption.limit))}
        </div>
    }

    return  <div id='column' className='Chapter'>
        {weaponOptions.map(renderWeaponOption)}
        <button id={Styles.applyButton} onClick={handleApply}>Apply</button>
    </div>
}

export default ChooseWeapon