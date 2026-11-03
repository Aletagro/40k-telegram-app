import React from 'react'
import {useLocation} from 'react-router-dom'
import {RuleCard, BehaviourCard} from '../components/Rule'
import Ability from '../components/Ability'
import {sortByName, getStratagemPhases} from '../utilities/utils'

import find from 'lodash/find'
import filter from 'lodash/filter'

const dataBase = require('../utilities/db')

const Rules = () => {
    const {paragraph} = useLocation().state

    if (paragraph.containerType === 'stratagem') {
        const stratagem = find(dataBase.data.stratagem, ['id', paragraph.stratagemId])
        return <div id='column' className='Chapter'>
            {stratagem ? <Ability ability={stratagem} phases={getStratagemPhases(stratagem.id)} /> : null}
        </div>
    }

    if (paragraph.containerType === 'behaviourType') {
        const behaviour = find(dataBase.data.behaviour_type, ['id', paragraph.behaviourTypeId])
        return <div id='column' className='Chapter'>
            {behaviour ? <BehaviourCard behaviour={behaviour} /> : null}
        </div>
    }

    const rules = sortByName(filter(dataBase.data.rule_container_component, ['ruleContainerId', paragraph.id]), 'displayOrder')

    return <div id='column' className='Chapter'>
        <RuleCard rules={rules} />
    </div>
}

export default Rules
