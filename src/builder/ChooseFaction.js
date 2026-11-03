import React from 'react'
import {useLocation} from 'react-router-dom'
import {roster, navigationState} from '../utilities/appState'
import ImageCard from '../components/ImageCard'
import {SectionTitle} from '../components/ListCard'

import map from 'lodash/map'
import find from 'lodash/find'

const dataBase = require('../utilities/db')

const ChooseFaction = () => {
    const {grandFaction} = useLocation().state

    const handleClick = ({faction}) => {
        roster.faction = faction.name
        roster.factionId = faction.id
        navigationState.isBuilder = true
    }

    const renderCard = (faction) => {
        // в Constants у армии только имя и id, картинка лежит в базе
        const image = find(dataBase.data.faction_keyword, ['id', faction.id])?.armySelectionImage
        return <ImageCard
            key={faction.id}
            title={faction.name}
            image={image}
            navigateTo='builder'
            state={{faction}}
            onClick={handleClick}
        />
    }

    return <div id='column' className='Chapter'>
        <SectionTitle>Choose your Faction</SectionTitle>
        {map(grandFaction.factions, renderCard)}
    </div>
}

export default ChooseFaction
