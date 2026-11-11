import {t} from '../utilities/i18n'
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
    const sortedFactions = sortByName(map(factions, faction => ({...faction, name: faction.commonName || faction.name, nameEn: faction.commonNameEn || faction.nameEn})))
    const grandFactions = map(Constants.grandFactions, grandFaction => {
        const _factions = filter(sortedFactions, faction => find(grandFaction.factions, ['id', faction.id]))
        return {...grandFaction, factions: _factions}
    })

    const renderGrandFaction = (grandFaction) => <ImageCard
        key={grandFaction.name}
        title={t(grandFaction.name)}
        image={grandFaction.image}
        size='lg'
        navigateTo='armies'
        state={{grandFaction}}
    />

    return <div id='column' className='Chapter'>
        <SectionTitle>{t('Armies')}</SectionTitle>
        {map(grandFactions, renderGrandFaction)}
        <SectionTitle>{t('Library')}</SectionTitle>
        <MenuRow title={t('Core Rules')} text={t('The rules of the game')} navigateTo='coreRules' />
        <MenuRow title={t('Key Documents')} text={t('Chapter Approved, event companions, legends')} navigateTo='keyDocuments' />
    </div>
}

export default MainRules
