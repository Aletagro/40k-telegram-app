import React from 'react';
import {useLocation} from 'react-router-dom'
import {sortByName} from '../utilities/utils'
import Row from '../components/Row'
import Rule from '../components/Rule'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'
import filter from 'lodash/filter'

import Styles from './styles/Detachment.module.css'

const dataBase = require('../dataBase.json')

const Detachment = () => {
    const {detachment} = useLocation().state
    const detachmentRules = filter(dataBase.data.detachment_rule, ['detachmentId', detachment.id])
    const rules = map(detachmentRules, detachmentRule => sortByName(filter(dataBase.data.rule_container_component, ['detachmentRuleId', detachmentRule.id]), 'displayOrder'))

    let items = [
        {title: 'Enhancements', screen: 'enhancements'},
        {title: 'Stratagems', screen: 'stratagems'},
    ]

    const renderRow = (item) => <Row
        key={item.title}
        title={item.title}
        navigateTo={item.screen}
        state={{detachment}}
    />

    const renderRule = (rule) => <Rule
        key={rule.id}
        rule={rule}
    />

    const renderDetachmentRules = (armyRule, i) => <div key={armyRule.id}>
        <p id={Styles.title}>{detachmentRules[i].name}</p>
        <div id={Styles.detachmentRuleContainer}>
            {map(armyRule, renderRule)}
        </div>
    </div>

    return <>
        {detachment.bannerImage ? <HeaderImage src={detachment.bannerImage} alt={detachment.name} /> : null}
        <div id='column' className='Chapter'>
            {map(items, renderRow)}
            <p id={Styles.title}>DETACHMENT RULES</p>
            {map(rules, renderDetachmentRules)}
        </div>
    </>
}

export default Detachment