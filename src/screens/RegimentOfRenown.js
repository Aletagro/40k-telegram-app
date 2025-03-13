import React from 'react';
import {useLocation} from 'react-router-dom'
import {sortByName, replaceAsterisks} from '../utilities/utils'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import Ability from '../components/Ability'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'

import Styles from './styles/RegimentOfRenown.module.css'

const dataBase = require('../dataBase.json')

const RegimentOfRenown = () => {
    window.scrollTo(0, 0)
    const {regiment} = useLocation().state
    const regimentAbilities = filter(dataBase.data.ability, (group) => group.abilityGroupId === regiment.id)
    const warscrollsIds = filter(dataBase.data.ability_group_regiment_of_renown_linked_warscroll, warscroll => warscroll.abilityGroupId === regiment.id)
    const warscrolls = sortByName(map(warscrollsIds, item => find(dataBase.data.warscroll, warscroll => warscroll.id === item.warscrollId)))

    const renderAbility = (ability) => <Ability
        key={ability.id}
        ability={ability}
        abilityKeywordsName='ability_keyword'
        abilityIdName='abilityId'
        isRegimentOfRenown
    />

    const renderWarscroll = (unit) => <Row
        key={unit.id}
        title={unit.name}
        rightText={unit?.points ? `${unit?.points} pts` : undefined}
        image={unit?.rowImage}
        navigateTo='warscroll'
        state={{unit}}
    />

    return <>
        <HeaderImage src={regiment.image} alt='Regiment Of Renown' />
        <div id='column' className='Chapter'>
            <p id={Styles.text}>{replaceAsterisks(regiment.subsectionRulesText)}</p>
            <h4 id={Styles.title}>{regiment.regimentOfRenownPointsCost} points</h4>
            {regimentAbilities && map(regimentAbilities, renderAbility)}
            <h4 id={Styles.title}>Warscrolls</h4>
            {warscrolls && map(warscrolls, renderWarscroll)}
        </div>
    </>
}

export default RegimentOfRenown