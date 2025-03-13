import React, {useState, useEffect} from 'react';
import WhiteClose from '../icons/whiteClose.svg'
import {getValue} from '../utilities/utils'
import Constants from '../Constants'
import FloatingLabelInput from '../components/FloatingLabelInput'

import Styles from './styles/Weapon.module.css'

const inputStyles = {
    name: {
        '--Input-minHeight': '48px',
        borderRadius: '4px',
        'margin-bottom': '16px',
        'border-color': '#B4B4B4',
        color: '#000000',
        'box-shadow': 'none',
        'font-family': 'Minion Pro Bold'
    },
    characteristic: {
        '--Input-minHeight': '48px',
        borderRadius: '4px',
        'margin-right': '16px',
        flex: 1,
        'border-color': '#B4B4B4',
        color: '#000000',
        'box-shadow': 'none',
        'font-family': 'Minion Pro Bold'
    },
    custom: {
        '--Input-minHeight': '48px',
        borderRadius: '4px',
        flex: 2,
        'border-color': '#B4B4B4',
        color: '#000000',
        'box-shadow': 'none',
        'font-family': 'Minion Pro Bold'
    }
}

const Weapon = ({index, weapon, onChange, onChangeAbilitiy, onDelete, updateCount}) => {
    const [errors, setErrors] = useState({})
    const [weaponName, setWeaponName] = useState(weapon.name || '')

    const getInputsValues = () => {
        const values = {}
        if (weapon) {
            Constants.calculatorInputs.forEach(item => values[item.type] = weapon[item.type] || '')
            Constants.calculatorCharacteristics.forEach(item => {
                if (item.hasCustom) {
                    values[item.type] = weapon[item.type] || ''
                }
            })
        }
        return values
    }

    const [inputsValues, setInputsValues] = useState(getInputsValues)

    useEffect(() => {
        setWeaponName(weapon.name)
        setInputsValues(getInputsValues)
    /* eslint-disable react-hooks/exhaustive-deps */
    }, [weapon.name])

    const handleDelete = () => {
        if (onDelete) {
            onDelete(index)
        }
    }

    const handleChangeName = (e) => {
        setWeaponName(e.target.value)
    }

    const handleBlurName = (e) => {
        onChange('name', e.target.value, index)
    }

    const handleChangeCharacteristic = (type) => (e) => {
        setInputsValues({...inputsValues, [type]: e.target.value})
    }

    const handleBlurCharacteristic = (type) => (e) => {
        const value = getValue(e.target.value)
        if (value === undefined || value < 0) {
            setErrors({...errors, [type]: 'Invalide value'})
        } else {
            setErrors({...errors, [type]: ''})
            onChange(type, value, index)
        }
    }

    const handleClickAbility = (type) => () => {
        onChangeAbilitiy(type, index)
    }

    const handleClickCritOn = (value) => () => {
        onChange('critOn', value, index)
    }

    const handleClickCharacteristic = (type, value) => () => {
        onChange(type, value, index)
    }

    const renderInput = (data) => <FloatingLabelInput
        style={inputStyles.characteristic}
        onBlur={handleBlurCharacteristic(data.type)}
        onChange={handleChangeCharacteristic(data.type)}
        label={data.name}
        value={inputsValues[data.type]}
    />

    const renderWeaponAbility = (ability) => <button
        key={ability.type}
        onClick={handleClickAbility(ability.type)}
        id={weapon[ability.type] ? Styles.checkedAbilities : Styles.abilities}
    >
        {ability.name}
    </button>

    const renderCritOnButton = (critOn) => <button
        key={critOn.modificator}
        onClick={handleClickCritOn(critOn)}
        id={weapon.critOn?.modificator === critOn.modificator ? Styles.checkedAbilities : Styles.abilities}
    >
        {critOn.title}
    </button>

    const renderButton = (type) => (value) => <button
        key={`${type}-${value}`}
        onClick={handleClickCharacteristic(type, value)}
        id={weapon[type] === value ? Styles.checkedCharacteristic : Styles.characteristic}
    >
        {value}
    </button>

    const renderCharacteristics = (characteristic) => <div key={characteristic.type}>
        <b id={Styles.title}>{characteristic.name}</b>
        <div id={Styles.characteristicsContainer}>
            {characteristic.values.map(renderButton(characteristic.type))}
            {characteristic.hasCustom
                ? <FloatingLabelInput
                    style={inputStyles.custom}
                    onBlur={handleBlurCharacteristic(characteristic.type)}
                    onChange={handleChangeCharacteristic(characteristic.type)}
                    label='Custom'
                    placeholder='d3+3'
                    value={inputsValues[characteristic.type]}
                />
                : null
            }
        </div>
    </div>

    return  <div id={Styles.container}>
        <div id={Styles.nameContainer}>
            <b id={Styles.name}>Weapon {index + 1}</b>
            <button id={Styles.deleteButton} onClick={handleDelete}><img src={WhiteClose} alt="" /></button>
        </div>
        <FloatingLabelInput
            style={inputStyles.name}
            onBlur={handleBlurName}
            onChange={handleChangeName}
            label='Weapon Name'
            value={weaponName}
        />
        <div id={Styles.inputsContainer}>
            {Constants.calculatorInputs.map(renderInput)}
            {renderWeaponAbility({name: 'Champion', type: 'champion'})}
        </div>
        {Constants.calculatorCharacteristics.map(renderCharacteristics)}
        <div id={Styles.abilitiesContainer}>
            {Constants.calculatorAbilities.map(renderWeaponAbility)}
        </div>
        <div id={Styles.abilitiesContainer}>
            {Constants.critOn.map(renderCritOnButton)}
        </div>
    </div>
}

export default Weapon