import React from 'react';
import {useLocation} from 'react-router-dom'
import Rule from '../components/Rule'
import Ability from '../components/Ability'
import {sortByName} from '../utilities/utils'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'

import Styles from './styles/Rules.module.css'

const dataBase = require('../dataBase.json')

const Rules = ({info}) => {
    const {paragraph} = useLocation().state

    if (paragraph.containerType === 'stratagem') {
        const ability = find(dataBase.data.stratagem, ['id', paragraph.stratagemId])
        return <div id={Styles.abilityContainer}>
           <Ability key={paragraph.id} ability={ability} />
        </div>
    }

    const rules = sortByName(filter(dataBase.data.rule_container_component, ['ruleContainerId', paragraph.id]), 'displayOrder')
    const renderRule = (rule) => <Rule key={rule.id} rule={rule} />

    return <div id={Styles.container}>
        {map(rules, renderRule)}
    </div>
}

export default Rules