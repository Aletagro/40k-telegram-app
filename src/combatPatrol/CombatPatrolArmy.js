import {t} from '../utilities/i18n'
import React from 'react'
import {useLocation} from 'react-router-dom'
import {getCombatPatrolUnits} from '../utilities/utils'
import Tile from '../components/Tile'
import HeaderImage from '../components/HeaderImage'
import {ListCard, ListItem, SectionTitle} from '../components/ListCard'

import map from 'lodash/map'

// Один патруль: состав коробки (фиксированные даташиты) и детачмент с правилами, стратагемами и энхансментами
const CombatPatrolArmy = () => {
    const {patrol} = useLocation().state
    const units = getCombatPatrolUnits(patrol.detachment)

    const renderUnit = (unit) => <ListItem
        key={unit.id}
        title={unit.name}
        subtitle={unit.isWarlord ? t('Warlord') : undefined}
        image={unit.rowImage}
        navigateTo='datasheet'
        state={{unit}}
    />

    return <>
        {patrol.detachment.bannerImage ? <HeaderImage src={patrol.detachment.bannerImage} alt={patrol.name} /> : null}
        <div id='column' className='Chapter'>
            <Tile
                featured
                title={patrol.patrolName}
                text={t('Detachment rules, stratagems and enhancements')}
                navigateTo='detachment'
                state={{detachment: patrol.detachment, faction: patrol.faction}}
            />
            <SectionTitle>{t('Datasheets')}</SectionTitle>
            <ListCard>{map(units, renderUnit)}</ListCard>
        </div>
    </>
}

export default CombatPatrolArmy
