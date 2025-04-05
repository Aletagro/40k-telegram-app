import React from 'react';
import {useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import UnitRow from './UnitRow'

import map from 'lodash/map'
import size from 'lodash/size'
import find from 'lodash/find'
import filter from 'lodash/filter'

import Styles from './styles/UnitsType.module.css'

const dataBase = require('../dataBase.json')

const UnitsType = ({unitsType, factionId, forceUpdate, isAllied, alliedFactionIds}) => {
    const navigate = useNavigate()

    const getIsLimit = (unitId) => {
        const count = size(filter(roster.units[unitsType.title], ['id', unitId]))
        const miniature = find(dataBase.data.miniature, ['datasheetId', unitId])
        const miniatureKeywords = filter(dataBase.data.miniature_keyword, ['miniatureId', miniature.id])
        const keywords = map(miniatureKeywords, keyword => find(dataBase.data.keyword, ['id', keyword.keywordId]))
        const isWarlordTitan = Boolean(find(keywords, ['name', 'Warlord Titan']))
        return count === (isWarlordTitan ? 1 : unitsType.title === 'Battleline' ? 6 : 3)
    }

    const handleAddUnit = () => {
        navigate('/addUnit', {state: {
            unitsType,
            factionId,
            isAllied,
            alliedFactionIds,
            title: `Add ${unitsType.title}`
        }})
    }

    const handleClickUnit = (unit) => {
        navigate('/datasheet', {state: {title: unit.name, unit}})
    }

    const handleDeleteUnit = (unit, unitIndex) => {
        const newUnits = roster.units[unitsType.title]
        newUnits.splice(unitIndex, 1)
        roster.units[unitsType.title] = newUnits
        forceUpdate()
    }

    const handleCopy = (unit) => {
        roster.units[unitsType.title].push(unit)
        // roster.points[unitsType.title] = roster.points[unitsType.title] + unit.points
        // roster.points = roster.points + unit.points
        forceUpdate()
    }

    const handleReinforced = (unit, unitIndex) => {

    }

    const handleChooseWarlord = (index) => {
        roster.warlordIndex = index
        forceUpdate()
    }
       
    const renderUnit = (unit, index) => <UnitRow
        key={index}
        unit={unit}
        unitIndex={index}
        isCharacter={unitsType.title === 'Character'}
        isEpicHero={unitsType.title === 'Epic Hero'}
        onClick={handleClickUnit}
        onDelete={handleDeleteUnit}
        onReinforced={handleReinforced}
        onChooseWarlord={handleChooseWarlord}
        onCopy={handleCopy}
        factionId={factionId}
        isLimit={getIsLimit(unit.id)}
    />

    return <div id={Styles.container}>
        <div id={Styles.title}>
            <p id={Styles.text}>{unitsType.title}</p>
            <p id={Styles.points}>{roster.points[unitsType.title] || 0} Points</p>
        </div>
        {map(roster.units[unitsType.title], renderUnit)}
        <div id={Styles.addUnitContainer}>
            <button id={Styles.addUnitButton} onClick={handleAddUnit}>Add {unitsType.title}</button>
        </div>
    </div>
}

export default UnitsType