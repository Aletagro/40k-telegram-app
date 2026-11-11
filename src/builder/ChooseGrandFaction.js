import {t} from '../utilities/i18n'
import React from 'react'
import Constants from '../Constants'
import {roster} from '../utilities/appState'
import ImageCard from '../components/ImageCard'
import {SectionTitle} from '../components/ListCard'

import map from 'lodash/map'

const ChooseGrandFaction = () => {

    const handleClick = ({grandFaction}) => {
        roster.grandFaction = grandFaction.name
    }

    const renderCard = (grandFaction) => <ImageCard
        key={grandFaction.name}
        title={t(grandFaction.name)}
        image={grandFaction.image}
        size='lg'
        navigateTo='chooseFaction'
        state={{grandFaction}}
        onClick={handleClick}
    />

    return <div id='column' className='Chapter'>
        <SectionTitle>{t('Choose your Army')}</SectionTitle>
        {map(Constants.grandFactions, renderCard)}
    </div>
}

export default ChooseGrandFaction
