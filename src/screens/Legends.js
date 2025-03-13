import React from 'react'
import Constants from '../Constants'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'
import includes from 'lodash/includes'

const dataBase = require('../dataBase.json')

const Legends = () => {
    const units = filter(dataBase.data.warscroll, 'isLegends')
    const sortedUnits = {
        Chaos: [],
        Death: [],
        Destruction: [],
        Order: []
    }

    forEach(units, (unit) => {
        if (includes(unit.referenceKeywords, 'Chaos')) {
            sortedUnits.Chaos.push(unit)
        } else if (includes(unit.referenceKeywords, 'Death')) {
            sortedUnits.Death.push(unit)
        } else if (includes(unit.referenceKeywords, 'Destruction')) {
            sortedUnits.Destruction.push(unit)
        } else if (includes(unit.referenceKeywords, 'Order')) {
            sortedUnits.Order.push(unit)
        }
    })

    const renderRow = (grandAlliance) => <Row
        key={grandAlliance.id}
        title={grandAlliance.name}
        navigateTo='legendUnits'
        state={{units: sortedUnits[grandAlliance.name], image: grandAlliance.image}}
    />

    return <>
        <HeaderImage src='https://dhss9aar8ocw.cloudfront.net/8b513e4a-acff-43fe-823d-77c34ce62687' alt='legends' />
        <div id='column' className='Chapter'>
            {map(Constants.grandAlliances, renderRow)}
        </div>
    </>
}

export default Legends