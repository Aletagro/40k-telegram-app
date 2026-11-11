import React, {useCallback, useReducer} from 'react'
import {useLocation} from 'react-router-dom'
import {getUnitsSortesByType, getParentCodexId} from '../utilities/utils'
import {isCollapseUnitsTypes} from '../utilities/appState'
import {ListCard, ListItem} from '../components/ListCard'
import CollapseSection from '../components/CollapseSection'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'

const Units = () => {
    const {faction, codexInfo} = useLocation().state
    const [, forceUpdate] = useReducer((x) => x + 1, 0)
    const units = getUnitsSortesByType(faction, codexInfo, undefined, getParentCodexId(faction))

    const handleToggle = useCallback((title) => {
        isCollapseUnitsTypes[title] = !isCollapseUnitsTypes[title]
        forceUpdate()
    }, [])

    const renderRow = (unit) => <ListItem
        key={unit?.id}
        title={unit?.name}
        rightText={unit?.points ? `${unit?.points} pts` : undefined}
        image={unit?.rowImage}
        navigateTo='datasheet'
        state={{unit}}
    />

    const renderUnitsType = (type) => <CollapseSection
        key={type.title}
        title={type.label || type.title}
        expanded={!isCollapseUnitsTypes[type.title]}
        onToggle={() => handleToggle(type.title)}
    >
        <ListCard>{map(type.units, renderRow)}</ListCard>
    </CollapseSection>

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
