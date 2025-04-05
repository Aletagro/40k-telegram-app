import React, {useCallback, useReducer} from 'react'
import {useLocation} from 'react-router-dom'
import {getUnitsSortesByType} from '../utilities/utils'
import {isCollapseUnitsTypes} from '../utilities/appState'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import Accordion from '../components/Accordion'

const Units = () => {
    const {faction, codexInfo} = useLocation().state
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const units = getUnitsSortesByType(faction, codexInfo)

    const handleChangeExpand = useCallback((e) => {
        isCollapseUnitsTypes[e.nativeEvent.target?.innerText] = !isCollapseUnitsTypes[e.nativeEvent.target?.innerText]
        forceUpdate()
    }, [])

    const renderRow = (unit) => <Row
        key={unit?.id}
        title={unit?.name}
        rightText={unit?.points ? `${unit?.points} pts` : undefined}
        image={unit?.rowImage}
        navigateTo='datasheet'
        state={{unit}}
    />

    const renderUnitsType = (type) => <Accordion
        key={type.title}
        title={type.title}
        data={type.units}
        renderItem={renderRow}
        expanded={!isCollapseUnitsTypes[type.title]}
        onChangeExpand={handleChangeExpand}
    />

    return <>
        {faction?.rosterHeaderImage
            ? <HeaderImage src={faction?.rosterHeaderImage} alt={faction?.name} isWide />
            : null
        }
        <div id='column' className='Chapter'>
            {units.map(renderUnitsType)}
        </div>
    </>
}

export default Units