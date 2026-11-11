import React from 'react'
import {getCombatPatrols} from '../utilities/utils'
import ImageCard from '../components/ImageCard'
import {ListCard, ListItem, SectionTitle} from '../components/ListCard'
import Constants from '../Constants'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import filter from 'lodash/filter'

const dataBase = require('../utilities/db')

// Combat Patrol: готовые армии из коробок. Правила режима и армии, сгруппированные по гранд-фракциям
const CombatPatrol = () => {
    const patrols = getCombatPatrols()
    const rules = find(dataBase.data.publication, publication => !publication.isCombatPatrol && !publication.factionKeywordId && publication.name === 'Combat Patrol')

    const renderGrandFaction = (grandFaction) => {
        const grandPatrols = filter(patrols, ['grandFaction', grandFaction.name])
        if (!size(grandPatrols)) return null
        return <ImageCard
            key={grandFaction.name}
            title={grandFaction.name}
            image={grandFaction.image}
            size='lg'
            navigateTo='combatPatrolArmies'
            state={{grandFaction: grandFaction.name, patrols: grandPatrols}}
        />
    }

    return <div id='column' className='Chapter'>
        {rules
            ? <>
                <SectionTitle>Rules</SectionTitle>
                <ListCard>
                    <ListItem title='Combat Patrol Rules' navigateTo='ruleSections' state={{document: rules}} />
                </ListCard>
            </>
            : null
        }
        <SectionTitle>Armies</SectionTitle>
        {map(Constants.grandFactions, renderGrandFaction)}
    </div>
}

export default CombatPatrol
