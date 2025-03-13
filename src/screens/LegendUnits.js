import React from 'react'
import {useLocation} from 'react-router-dom'
import {unitsSortesByType} from '../utilities/utils'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import Accordion from '../components/Accordion'

import map from 'lodash/map'

const LegendUnits = () => {
    const {units, image, title} = useLocation().state
    const _units = unitsSortesByType(units)

    const renderRow = (unit) => <Row
        key={unit?.id}
        title={unit?.name}
        rightText={unit?.points ? `${unit?.points} pts` : undefined}
        image={unit?.rowImage}
        navigateTo='warscroll'
        state={{unit}}
    />

    const renderUnitsType = (type) => <Accordion
        title={type.title}
        data={type.units}
        renderItem={renderRow}
    />

    return <>
        <HeaderImage src={image} alt={title} isWide />
        <div id='column' className='Chapter'>
            {map(_units, renderUnitsType)}
        </div>
    </>
}

export default LegendUnits