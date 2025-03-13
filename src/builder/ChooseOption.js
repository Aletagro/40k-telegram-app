import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import {capitalizeFirstLetter} from '../utilities/utils'

import Styles from './styles/ChooseOption.module.css'

const dataBase = require('../dataBase.json')

const ChooseOption = () => {
    const {optionGroup, unitIndex, regimentIndex, isAuxiliary, isRoRUnitWithKeyword} = useLocation().state
    const navigate = useNavigate()
    const options = dataBase.data.option.filter(option => option.optionGroupId === optionGroup.id)


    const handleClickOption = (option) => () => {
        if (isRoRUnitWithKeyword) {
            const newUnit = {...roster.regimentsOfRenownUnits[unitIndex], [optionGroup.optionGroupType]: capitalizeFirstLetter(option)}
            roster.regimentsOfRenownUnits[unitIndex] = newUnit
        } else if (isAuxiliary) {
            const newUnit = {...roster.auxiliaryUnits[unitIndex], [optionGroup.optionGroupType]: capitalizeFirstLetter(option)}
            roster.auxiliaryUnits[unitIndex] = newUnit
        } else {
            const newUnit = {...roster.regiments[regimentIndex].units[unitIndex], [optionGroup.optionGroupType]: capitalizeFirstLetter(option)}
            roster.regiments[regimentIndex].units[unitIndex] = newUnit
        }
        navigate(-1)
    }

    const handleDeleteOption = () => {
        if (isRoRUnitWithKeyword) {
            const newUnit = {...roster.regimentsOfRenownUnits[unitIndex], [optionGroup.optionGroupType]: ''}
            roster.regimentsOfRenownUnits[unitIndex] = newUnit
        } else if (isAuxiliary) {
            const newUnit = {...roster.auxiliaryUnits[unitIndex], [optionGroup.optionGroupType]: ''}
            roster.auxiliaryUnits[unitIndex] = newUnit
        } else {
            const newUnit = {...roster.regiments[regimentIndex].units[unitIndex], [optionGroup.optionGroupType]: ''}
            roster.regiments[regimentIndex].units[unitIndex] = newUnit
        }
        navigate(-1)
    }

    const renderOption = (option) => <button id={Styles.button} key={option.id} onClick={handleClickOption(option.otherWarscrollOption || option.markOfChaos)}>{option.otherWarscrollOption || capitalizeFirstLetter(option.markOfChaos)}</button>

    return  <div id='column' className='Chapter'>
        <p id={Styles.name}>{optionGroup.name}</p>
        {options.map(renderOption)}
        <button id={Styles.delete} onClick={handleDeleteOption}>Delete</button>
    </div>
}

export default ChooseOption