import React from 'react';
import {useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import UnitRow from './UnitRow'
import Delete from '../icons/delete.svg'
import General from '../icons/general.svg'

import Styles from './styles/Regiment.module.css'

const emptyRegiment = {
    units: [],
    heroId: '',
    points: 0,
    artefact: '',
    heroicTrait: ''
}

const Regiment = ({regiment, index, alliganceId, forceUpdate, artefacts, heroicTraits}) => {
    const navigate = useNavigate()

    const handleDeleteRegiment = () => {
        const newRegiments = [...roster.regiments]
        roster.points = roster.points - newRegiments[index].points
        newRegiments.splice(index, 1)
        roster.regiments = newRegiments
        forceUpdate()
    }

    const handleAddUnit = (regiment, title, index) => () => {
        navigate('/addUnit', {state: {
            heroId: regiment.heroId,
            regimentId: index,
            alliganceId,
            title
        }})
    }

    const handleClickUnit = (unit) => {
        navigate('/datasheet', {state: {title: unit.name, unit}})
    }

    const handleDeleteUnit = (unit, unitIndex) => {
        const newRegiment = {...regiment}
        if (unitIndex === 0) {
            roster.points = roster.points - newRegiment.points
            roster.regiments[index] = emptyRegiment
        } else {
            roster.points = roster.points - unit.points
            newRegiment.points = newRegiment.points - unit.points
            newRegiment.units.splice(unitIndex, 1)
            roster.regiments[index] = newRegiment
        }
        forceUpdate()
    }

    const handleCopy = (unit) => {
        roster.regiments[index].units.push(unit)
        roster.regiments[index].points = roster.regiments[index].points + unit.points
        roster.points = roster.points + unit.points
        forceUpdate()
    }

    const handleReinforced = (unit, unitIndex) => {
        if (unit.isReinforced) {
            const _points = unit.points / 2
            roster.regiments[index].units[unitIndex] = {
                ...roster.regiments[index].units[unitIndex],
                isReinforced: false,
                points: _points
            }
            roster.regiments[index].points = roster.regiments[index].points - _points
            roster.points = roster.points - _points
        } else {
            roster.regiments[index].units[unitIndex] = {
                ...roster.regiments[index].units[unitIndex],
                isReinforced: true,
                points: unit.points * 2
            }
            roster.regiments[index].points = roster.regiments[index].points + unit.points
            roster.points = roster.points + unit.points
        }
        forceUpdate()
    }

    const handleChooseGeneral = () => {
        roster.generalRegimentIndex = index
        forceUpdate()
    }
       
    const renderUnit = (unit, _index) => <UnitRow
        key={_index}
        unit={unit}
        unitIndex={_index}
        regimentIndex={index}
        onClick={handleClickUnit}
        onDelete={handleDeleteUnit}
        onReinforced={handleReinforced}
        onCopy={handleCopy}
        artefacts={artefacts}
        heroicTraits={heroicTraits}
        isGeneral={regiment.heroId && _index === 0 && roster.generalRegimentIndex === index}
        alliganceId={alliganceId}
    />

    const title = regiment.heroId ? 'Add Unit' : 'Add Hero'
    return <div id={Styles.container} key={index}>
        <div id={Styles.title}>
            <div id={Styles.titleSubContainer}>
                <p id={Styles.text}>Regiment {index + 1}</p>
                <p id={Styles.points}>{regiment.points} Points</p>
            </div>
            <div id={Styles.rightBlock}>
                <button id={Styles.deleteButton} onClick={handleChooseGeneral}><img src={General} alt="" /></button>
                <button id={Styles.deleteButton} onClick={handleDeleteRegiment}><img src={Delete} alt="" /></button>
            </div>
        </div>
        {regiment.units.map(renderUnit)}
        <div id={Styles.addUnitContainer}>
            <button id={Styles.addUnitButton} onClick={handleAddUnit(regiment, title, index)}>{title}</button>
        </div>
    </div>
}

export default Regiment