import {t} from '../utilities/i18n'
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
    const rules = find(dataBase.data.publication, publication => !publication.isCombatPatrol && !publication.factionKeywordId && publication.nameEn === 'Combat Patrol')

    const renderGrandFaction = (grandFaction) => {
        const grandPatrols = filter(patrols, ['grandFaction', grandFaction.name])
        if (!size(grandPatrols)) return null
        return <ImageCard
            key={grandFaction.name}
            title={t(grandFaction.name)}
            image={grandFaction.image}
            size='lg'
            navigateTo='combatPatrolArmies'
            state={{grandFaction: grandFaction.name, patrols: grandPatrols}}
        />
    }

    return <div id='column' className='Chapter'>
        {rules
            ? <>
                <SectionTitle>{t('Rules')}</SectionTitle>
                <ListCard>
                    <ListItem title={t('Combat Patrol Rules')} navigateTo='ruleSections' state={{document: rules}} />
                </ListCard>
            </>
            : null
        }
        <SectionTitle>{t('Armies')}</SectionTitle>
        {map(Constants.grandFactions, renderGrandFaction)}
    </div>
}

export default CombatPatrol
