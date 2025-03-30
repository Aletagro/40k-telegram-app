import React from 'react'
import {sortByName} from '../utilities/utils'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'
import includes from 'lodash/includes'

import Styles from './styles/Main.module.css'

const dataBase = require('../dataBase.json')

const MainRules = () => {
    const factions = filter(dataBase.data.faction_keyword, faction => 
        !faction.excludedFromArmyBuilder && find(dataBase.data.publication, publication => publication.factionKeywordId === faction.id && !publication.isCombatPatrol && !includes(publication.name, 'Imperial Armour'))
    )
    const sortedFactions = sortByName(map(factions, faction => ({...faction, name: faction.commonName || faction.name})))

    const renderRow = (faction) => <Row
        key={faction.id}
        title={faction.name}
        navigateTo='army'
        state={{faction}}
    />

    return <>
        <HeaderImage src='https://w0.peakpx.com/wallpaper/632/404/HD-wallpaper-warhammer-40k-concept-art-warhammer.jpg' alt='main' />
        <div id='column' className='Chapter'>
            <Row title='Core Rules' navigateTo='coreRules' />
            <Row title='Key Documents' navigateTo='keyDocuments' />
            <div id={Styles.separator} />
            {map(sortedFactions, renderRow)}
        </div>
    </>
}

export default MainRules