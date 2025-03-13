import React from 'react';
import Constants from '../Constants';
import {singlePlayer} from '../utilities/appState';
import {sortByName} from '../utilities/utils'
import Checkbox from '../components/Checkbox'

import Styles from './styles/NewGame.module.css'

const dataBase = require('../dataBase.json');

const NewGamePlayer = ({onUpdate, player}) => {   
    const getAllegiances = (grandAlliance) => {
        let allegiances = dataBase.data.faction_keyword.filter((faction) => faction.parentFactionKeywordId === grandAlliance.id)
        // нужно чтобы орков разделить на отдельные книги
        if (grandAlliance.name === 'Destruction') {
            const orrukWarclansId = allegiances.find(allegiance => allegiance.name === 'Orruk Warclans')?.id
            const orrukAllegiances = dataBase.data.faction_keyword.filter((faction) => faction.parentFactionKeywordId === orrukWarclansId && !faction.armyOfRenown)
            allegiances = [...allegiances, ...orrukAllegiances]
            allegiances = allegiances.filter(allegiance => allegiance.name !== 'Orruk Warclans')
        }
        sortByName(allegiances)
        return allegiances
    }

    const allegiances = getAllegiances(singlePlayer[player].alliance)

    const handleClickGrandAlliance = (alliance, player) => () => {
        singlePlayer[player].alliance = {
            name: alliance.name,
            id: alliance.id
        }
        singlePlayer[player].allegiance = {name: '', id: ''}
        onUpdate()
    }

    const handleClickAllegiance = (allegiance, player) => () => {
        singlePlayer[player].allegiance = {
            name: allegiance.name,
            id: allegiance.id
        }
        onUpdate()
    }

    const handleAddCP = () => {
        if (singlePlayer[player].cp === 4) {
            singlePlayer[player].cp = 5
        } else {
            singlePlayer[player].cp = 4
        }
        onUpdate()
    }

    const renderGrandAlliance = (alliance) => <button
        key={alliance.id}
        onClick={handleClickGrandAlliance(alliance, player)}
        id={singlePlayer[player].alliance.id === alliance.id ? Styles.checkedButton : Styles.button}
    >
        {alliance.shortName || alliance.name}
    </button>

    const renderAllegiances = (allegiance) => <button
        key={allegiance.id}
        onClick={handleClickAllegiance(allegiance, player)}
        id={singlePlayer[player].allegiance.id === allegiance.id ? Styles.checkedButton : Styles.button}
    >
        {allegiance.name}
    </button>

    return <div id={Styles.playerContainer}>
        <div id={Styles.playerTitle}>
            <p id={Styles.title}>{player === 'firstPlayer' ? '1st' : '2nd'} Player's Army</p>
        <div id={Styles.addCpContainer}>
            <p id={Styles.title}>+1 CP</p>
            <Checkbox onClick={handleAddCP} checked={singlePlayer[player].cp === 5} isGold />
        </div>
        </div>
        <div id={Styles.alliancesButtons}>
            {Constants.grandAlliances.map(renderGrandAlliance)}
        </div>
        <div id={Styles.separator} />
        <div id={Styles.armiesButtons}>
            {allegiances.map(renderAllegiances)}
        </div>
    </div>
}

export default NewGamePlayer