import React from 'react'
import {useLocation} from 'react-router-dom'
import ImageCard from '../components/ImageCard'

import map from 'lodash/map'

const Armies = () => {
    const {grandFaction} = useLocation().state

    const renderCard = (faction) => <ImageCard
        key={faction.id}
        title={faction.name}
        image={faction.armySelectionImage || faction.rosterHeaderImage}
        navigateTo='army'
        state={{faction, grandFaction: grandFaction.name}}
    />

    return <div id='column' className='Chapter'>
        {map(grandFaction.factions, renderCard)}
    </div>
}

export default Armies
