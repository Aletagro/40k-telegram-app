import React, {useReducer} from 'react'
import {roster} from '../utilities/appState'
import Checkbox from '../components/Checkbox'
import Plus from '../icons/plus.svg'
import Minus from '../icons/minus.svg'
import GreyPlus from '../icons/greyPlus.svg'
import GreyMinus from '../icons/greyMinus.svg'

import get from 'lodash/get'
import find from 'lodash/find'

import Styles from './styles/Wargear.module.css'

const dataBase = require('../dataBase.json')

const Wargear = ({index, wargear, unitData}) => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    // const wargearItem = find(dataBase.data.wargear_item_profile, ['wargearItemId', wargear.wargearItemId])
    const wargearItem = find(dataBase.data.wargear_item, ['id', wargear.wargearItemId])
    const {unitType, unitIndex, miniatureName, wargearOptionGroupId} = unitData
    const unit = roster.units[unitType][unitIndex]
    const value = get(unit, `wargears[${miniatureName}][${wargearOptionGroupId}][${wargearItem.name}]`, 0)

    const handleClickWargear = (newValue) => {
        const wargears = roster.units[unitType][unitIndex].wargears || {}
        const newWargears = {...wargears, [miniatureName]: {
            ...wargears[miniatureName], [wargearOptionGroupId]: {
                ...get(wargears, `[${miniatureName}][${wargearOptionGroupId}]`, {}),
                [wargearItem.name]: newValue
            }       
        }}
        roster.units[unitType][unitIndex].wargears = newWargears
        forceUpdate()
    }

    const handleClickCheckbox = () => {
        handleClickWargear(!value)
    }

    const handleClickMinus = () => {
        handleClickWargear(value - 1)
    }

    const handleClickPlus = () => {
        handleClickWargear(value + 1)
    }

    const renderStepper = () => {
        const disabledMinus = value === unit.models[miniatureName].min
        const disabledPlus = value === unit.models[miniatureName].select
        return <div id={Styles.countContainer}>
            {disabledMinus
                ? <button id={Styles.disabledButton} disabled={disabledMinus} onClick={handleClickMinus}><img src={GreyMinus} alt="" /></button>
                : <button id={Styles.button} onClick={handleClickMinus}><img src={Minus} alt="" /></button>
            }
            <p id={Styles.count}>{value}</p>
            {disabledPlus
                ? <button id={Styles.disabledButton} disabled={disabledPlus} onClick={handleClickPlus}><img src={GreyPlus} alt="" /></button>
                : <button id={Styles.button} onClick={handleClickPlus}><img src={Plus} alt="" /></button>
            }
        </div>
    }

    const renderInput = () => {
        if (wargear.inputType === 'checkbox') {
            return <Checkbox onClick={handleClickCheckbox} checked={value} />
        }
        if (wargear.inputType === 'stepper') {
            return renderStepper()
        }
    }

    return <div id={Styles.container}>
        <b id={Styles.wargearName}>{wargearItem.name}</b>
        {renderInput()}
    </div>
}

export default Wargear