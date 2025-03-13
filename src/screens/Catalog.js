import React from 'react';
import {useLocation} from 'react-router-dom'
import {sortByName} from '../utilities/utils'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const Catalog = () => {
    const {grandAlliance} = useLocation().state
    let allegiances = filter(dataBase.data.faction_keyword, (faction) => faction.parentFactionKeywordId === grandAlliance.id)
    // нужно чтобы орков разделить на отдельные книги
    if (grandAlliance.name === 'Destruction') {
        const orrukWarclansId = find(allegiances, allegiance => allegiance.name === 'Orruk Warclans')?.id
        const orrukAllegiances = filter(dataBase.data.faction_keyword, (faction) => faction.parentFactionKeywordId === orrukWarclansId && !faction.armyOfRenown)
        allegiances = [...allegiances, ...orrukAllegiances]
        allegiances = filter(allegiances, allegiance => allegiance.name !== 'Orruk Warclans')
    }
    sortByName(allegiances)

    const renderRow = (allegiance) => <Row
        key={allegiance.id}
        title={allegiance.name}
        navigateTo='army'
        state={{allegiance, grandAlliance: grandAlliance.name}}
    />

    return <>
        <HeaderImage src={grandAlliance.image} alt={grandAlliance.name} isWide />
        <div id='column' className='Chapter'>
            {allegiances && map(allegiances, renderRow)}
        </div>
    </>
}

export default Catalog