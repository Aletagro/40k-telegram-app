import React from 'react'
import {useLocation} from 'react-router-dom'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'

const Armies = () => {
    const {grandFaction} = useLocation().state

    const renderRow = (faction) => <Row
        key={faction.id}
        title={faction.name}
        navigateTo='army'
        state={{faction, grandFaction: grandFaction.name}}
    />

    return <>
        <HeaderImage src={grandFaction.image} alt='main' />
        <div id='column' className='Chapter'>
            {map(grandFaction.factions, renderRow)}
        </div>
    </>
}

export default Armies