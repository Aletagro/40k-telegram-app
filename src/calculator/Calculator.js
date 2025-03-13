import React, {useState} from 'react'
import {getCalcUnit} from '../utilities/utils'
import {calc} from '../utilities/appState'
import CalcUnit from './CalcUnit'
import DamageTable from './DamageTable'
import Target from './Target'

import Styles from './styles/Calculator.module.css'

const Calculator = () => {
    const [target, setTarget] = useState({})
    const [updateCount, setUpdateCount] = useState(0)

    const handleUpdate = () => {
        setUpdateCount(updateCount + 1)
    }

    const handleAddUnit = () => {
        const newUnits = [...calc.units]
        newUnits.push(getCalcUnit())
        calc.units = newUnits
        handleUpdate()
    }

    const handleChangeTarget = (type, value) => {
        const newTartget = {...target}
        if (type === 'isEthereal') {
            newTartget.isEthereal = !newTartget.isEthereal
        } else {
            newTartget[type] = value
        }
        setTarget(newTartget)
    }

    const handleDeleteUnit = (index) => {
        const newUnits = [...calc.units]
        newUnits.splice(index, 1)
        calc.units = newUnits
        handleUpdate()
    }

    const renderUnit = (unit, index) => <CalcUnit
        key={index}
        index={index}
        unit={unit}
        onDelete={handleDeleteUnit}
        onUpdate={handleUpdate}
    />

    return  <div id='column' className='Chapter'>
        <DamageTable units={calc.units} target={target} />
        <Target target={target} onChange={handleChangeTarget} />
        {calc.units.map(renderUnit)}
        <button id={Styles.addWeapon} onClick={handleAddUnit}>Add Unit</button>
    </div>
}

export default Calculator