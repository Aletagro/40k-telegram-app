import React from 'react'
import {sortByName, getCodexInfo} from '../utilities/utils'
import ImageCard from '../components/ImageCard'
import MenuRow from '../components/MenuRow'
import {SectionTitle} from '../components/ListCard'
import Constants from '../Constants'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'

const dataBase = require('../utilities/db')

const MainRules = () => {
    const factions = filter(dataBase.data.faction_keyword, faction =>
        !faction.excludedFromArmyBuilder && getCodexInfo(faction.id)
    )
    const sortedFactions = sortByName(map(factions, faction => ({...faction, name: faction.commonName || faction.name})))
    console.log('sortedFactions', sortedFactions)
    const grandFactions = map(Constants.grandFactions, grandFaction => {
        const _factions = filter(sortedFactions, faction => find(grandFaction.factions, ['name', faction.name]))
        return {...grandFaction, factions: _factions}
    })

    const renderGrandFaction = (grandFaction) => <ImageCard
        key={grandFaction.name}
        title={grandFaction.name}
        image={grandFaction.image}
        size='lg'
        navigateTo='armies'
        state={{grandFaction}}
    />

    return <div id='column' className='Chapter'>
        <SectionTitle>Armies</SectionTitle>
        {map(grandFactions, renderGrandFaction)}
        <SectionTitle>Library</SectionTitle>
        <MenuRow title='Core Rules' text='The rules of the game' navigateTo='coreRules' />
        <MenuRow title='Key Documents' text='Chapter Approved, event companions, legends' navigateTo='keyDocuments' />
    </div>
}

export default MainRules
