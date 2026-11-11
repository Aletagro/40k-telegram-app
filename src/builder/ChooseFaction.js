import {t} from '../utilities/i18n'
import React from 'react'
import {useLocation} from 'react-router-dom'
import {roster, navigationState} from '../utilities/appState'
import {resetRoster} from '../utilities/rosterModel'
import ImageCard from '../components/ImageCard'
import {SectionTitle} from '../components/ListCard'
import {getFactionLabel} from '../utilities/utils'

import map from 'lodash/map'
import find from 'lodash/find'

const dataBase = require('../utilities/db')

const ChooseFaction = () => {
    const {grandFaction} = useLocation().state

    const handleClick = ({faction}) => {
        resetRoster()
        roster.grandFaction = grandFaction.name
        roster.faction = faction.name
        roster.factionId = faction.id
        navigationState.isBuilder = true
    }

    const renderCard = (faction) => {
        // в Constants у армии только имя и id, картинка лежит в базе
        const image = find(dataBase.data.faction_keyword, ['id', faction.id])?.armySelectionImage
        return <ImageCard
            key={faction.id}
            title={getFactionLabel(faction.id, faction.name)}
            image={image}
            navigateTo='builder'
            state={{faction}}
            onClick={handleClick}
        />
    }

    return <div id='column' className='Chapter'>
        <SectionTitle>{t('Choose your Faction')}</SectionTitle>
        {map(grandFaction.factions, renderCard)}
    </div>
}

export default ChooseFaction
