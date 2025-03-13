import React, {useState, useEffect} from 'react'
import Delete from '../icons/delete.svg'
import WhiteCopy from '../icons/whiteCopy.svg'
import Accordion from '@mui/joy/Accordion'
import AccordionDetails from '@mui/joy/AccordionDetails'
import AccordionSummary from '@mui/joy/AccordionSummary'
import Constants from '../Constants'
import {calc} from '../utilities/appState'
import {getCalcWeapon, getCalcUnit} from '../utilities/utils'
import Weapon from './Weapon'
import FloatingLabelInput from '../components/FloatingLabelInput'

import Styles from './styles/CalcUnit.module.css'

const inputStyle = {
    '--Input-minHeight': '48px',
    'borderRadius': '4px',
    'margin': '16px',
    'border-color': '#B4B4B4',
    'box-shadow': 'none',
    'font-family': 'Minion Pro Regular'
}

const CalcUnit = ({index, unit, onDelete, onUpdate}) => {
    const [name, setName] = useState(unit.name || '')

    useEffect(() => {
        setName(unit.name)
    }, [unit.name])

    const handleDelete = () => {
        if (onDelete) {
            onDelete(index)
        }
    }

    const handleCopy = () => {
        calc.units[calc.units.length] = getCalcUnit(unit)
        onUpdate()
    }

    const handleChangeName = (e) => {
        setName(e.target.value)
    }

    const handleBlurName = (e) => {
        calc.units[index].name = e.target.value
        onUpdate()
    }

    const handleChangeCharacteristics = (characteristic, value, weaponIndex) => {
        calc.units[index].weapons[weaponIndex][characteristic] = value
        onUpdate()
    }

    const handleChangeAbilitiy = (type, weaponIndex) => {
        calc.units[index].weapons[weaponIndex][type] = !calc.units[index].weapons[weaponIndex][type]
        onUpdate()
    }

    const handleDeleteWeapon = (weaponIndex) => {
        const newUnitWeapons = [...calc.units[index].weapons]
        newUnitWeapons.splice(weaponIndex, 1)
        calc.units[index].weapons = newUnitWeapons
        onUpdate()
    }

    const handleAddWeapon = () => {
        const newUnitWeapons = [...calc.units[index].weapons]
        let weapon = null
        if (newUnitWeapons.length) {
            weapon = {
                models: newUnitWeapons[newUnitWeapons.length - 1]?.models,
                critOn: {modificator: 1, title: '6+'}
            }
        }
        newUnitWeapons.push(getCalcWeapon(weapon))
        calc.units[index].weapons = newUnitWeapons
        onUpdate()
    }

    const renderWeapon = (weapon, _index) => <Weapon
        key={_index}
        index={_index}
        weapon={weapon}
        onChange={handleChangeCharacteristics}
        onChangeAbilitiy={handleChangeAbilitiy}
        onDelete={handleDeleteWeapon}
        onUpdate={onUpdate}
    />

    return  <div id={Styles.container}>
        <button id={Styles.headerCopyIcon} onClick={handleCopy}><img src={WhiteCopy} alt="" /></button>
        <button id={Styles.headerDeleteIcon} onClick={handleDelete}><img src={Delete} alt="" /></button>
        <Accordion defaultExpanded={true}>
            <AccordionSummary id={Styles.headerContainer} sx={(theme) => (Constants.accordionStyle)}>
                <b id={Styles.header}>{unit.name || `Unit ${index + 1}`}</b>
            </AccordionSummary>
            <AccordionDetails>
                <FloatingLabelInput
                    style={inputStyle}
                    onBlur={handleBlurName}
                    onChange={handleChangeName}
                    label='Unit Name'
                    value={name}
                />
                {unit.weapons.map(renderWeapon)}
                <div id={Styles.separator} />
                <button id={Styles.addWeaponButton} onClick={handleAddWeapon}>Add Weapon</button>
            </AccordionDetails>
        </Accordion>
    </div>
}

export default CalcUnit