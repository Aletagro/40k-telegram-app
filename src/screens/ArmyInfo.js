import React from 'react';
import {useLocation} from 'react-router-dom'
import Constants from '../Constants'
import {replaceAsterisks} from '../utilities/utils'
import Ability from '../components/Ability'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'
import find from 'lodash/find'

import Styles from './styles/ArmyInfo.module.css'

const ArmyInfo = () => {
    const {allegiance, info} = useLocation().state
    const armyEnhancement = find(Constants.armyEnhancements, enhancement => enhancement.title === info.title)

    const renderAbility = (ability) => <Ability
        key={ability.id}
        ability={ability}
        abilityKeywordsName={armyEnhancement?.abilityKeywordsName}
        abilityIdName={armyEnhancement?.abilityIdName}
    />

    const renderBlock = (block) => <div key={block.id}>
        <p id={Styles.title}>{block.name}</p>
        {map(block.abilities, renderAbility)}
    </div>

    return <>
        {allegiance.rosterHeaderImage ? <HeaderImage src={allegiance.rosterHeaderImage} alt={allegiance.name} isWide /> : null}
        <div id='column' className='Chapter'>
        {info.restrictionText ? <p id={Styles.note}>{replaceAsterisks(info.restrictionText)}</p> : null}
        {map(info.abilities, info.withoutTitle ? renderAbility : renderBlock)}
        </div>
    </>
}

export default ArmyInfo