import React from 'react';
import {useLocation} from 'react-router-dom'
import {sortByName} from '../utilities/utils'
import Rule from '../components/Rule'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'
import filter from 'lodash/filter'

import Styles from './styles/ArmyRules.module.css'

const dataBase = require('../dataBase.json')

const ArmyRules = () => {
    const {faction, data} = useLocation().state
    const rules = map(data, armyRule => sortByName(filter(dataBase.data.rule_container_component, ['armyRuleId', armyRule?.id]), 'displayOrder'))

    const renderRule = (rule) => <Rule
        key={rule.id}
        rule={rule}
    />

    const renderArmyRule = (armyRule, i) => <div key={armyRule.id}>
        <p id={Styles.title}>{data[i]?.name}</p>
        <div id={Styles.armyRuleContainer}>
            {map(armyRule, renderRule)}
        </div>
    </div>

    return <>
        {faction.rosterHeaderImage ? <HeaderImage src={faction.rosterHeaderImage} alt={faction.name} isWide /> : null}
        <div id='column' className='Chapter'>
            {map(rules, renderArmyRule)}
        </div>
    </>
}

export default ArmyRules