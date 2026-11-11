import React from 'react'
import {useLocation} from 'react-router-dom'
import ImageCard from '../components/ImageCard'

import map from 'lodash/map'

// Патрули одной гранд-фракции
const CombatPatrolArmies = () => {
    const {patrols} = useLocation().state

    const renderPatrol = (patrol) => <ImageCard
        key={patrol.id}
        title={patrol.name}
        image={patrol.detachment.bannerImage || patrol.detachment.rowImage}
        navigateTo='combatPatrolArmy'
        state={{patrol}}
    />

    return <div id='column' className='Chapter'>
        {map(patrols, renderPatrol)}
    </div>
}

export default CombatPatrolArmies
