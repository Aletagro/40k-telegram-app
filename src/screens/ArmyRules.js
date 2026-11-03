import React from 'react'
import {useLocation} from 'react-router-dom'
import {sortByName} from '../utilities/utils'
import {RuleCard} from '../components/Rule'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'
import filter from 'lodash/filter'

const dataBase = require('../utilities/db')

const ArmyRules = () => {
    const {faction, data} = useLocation().state

    const renderArmyRule = (armyRule) => <RuleCard
        key={armyRule.id}
        title={armyRule.name}
        rules={sortByName(filter(dataBase.data.rule_container_component, ['armyRuleId', armyRule.id]), 'displayOrder')}
    />

    return <>
        {faction.rosterHeaderImage ? <HeaderImage src={faction.rosterHeaderImage} alt={faction.name} isWide /> : null}
        <div id='column' className='Chapter'>
            {map(sortByName([...data], 'displayOrder'), renderArmyRule)}
        </div>
    </>
}

export default ArmyRules
