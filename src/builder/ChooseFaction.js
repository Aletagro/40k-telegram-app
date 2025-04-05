import React from 'react';
import {useLocation} from 'react-router-dom'
import {roster, navigationState} from '../utilities/appState'
import BuilderRow from './BuilderRow'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'

import Styles from './styles/ChooseFaction.module.css'

const ChooseFaction = () => {
    const {grandFaction} = useLocation().state

    const handleClick = ({faction}) => {
        roster.faction = faction.name
        roster.factionId = faction.id
        navigationState.isBuilder = true
    }
    
    const renderRow = (faction, index) => <BuilderRow
        key={faction.id}
        title={faction.name}
        navigateTo='builder'
        state={{faction}}
        onClick={handleClick}
    />

    return <>
        <HeaderImage src={grandFaction.image} alt={grandFaction.name} />
        <div id='column' className='Chapter'>
            <h4 id={Styles.title}>Choose your Faction</h4>
            {map(grandFaction.factions, renderRow)}
        </div>
    </>
}

export default ChooseFaction