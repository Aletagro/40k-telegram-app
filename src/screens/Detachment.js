import React from 'react';
import {useLocation} from 'react-router-dom'
import {sortByName, replaceAsterisks} from '../utilities/utils'
import Row from '../components/Row'
import Rule from '../components/Rule'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'
import size from 'lodash/size'
import filter from 'lodash/filter'

import Styles from './styles/Detachment.module.css'

const dataBase = require('../dataBase.json')

const Detachment = () => {
    const {detachment} = useLocation().state
    const detachmentRules = filter(dataBase.data.detachment_rule, ['detachmentId', detachment.id])
    const rules = map(detachmentRules, detachmentRule => sortByName(filter(dataBase.data.rule_container_component, ['detachmentRuleId', detachmentRule.id]), 'displayOrder'))
    const detachmentDetails = filter(dataBase.data.detachment_detail, ['detachmentId', detachment.id])
    const detachmentDetailsRules = map(detachmentDetails, detail => {
        const rules = filter(dataBase.data.detachment_detail_bullet_point, ['detachmentDetailId', detail.id])
        return {...detail, rules}
    })

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

    const renderDetachmentDetailRule = (detachmentDetailRule) =>
        <p id={Styles.detachmentDetailText} key={detachmentDetailRule.id}>{replaceAsterisks(detachmentDetailRule.text)}</p>

    const renderDetachmentDetail = (detachmentDetail) => <div id={Styles.detachmentDetailContiner} key={detachmentDetail.id}>
        <b id={Styles.detachmentDetailTitle} >{detachmentDetail.title}</b>
        {map(detachmentDetail.rules, renderDetachmentDetailRule)}
    </div>

    return <>
        {detachment.bannerImage ? <HeaderImage src={detachment.bannerImage} alt={detachment.name} /> : null}
        <div id='column' className='Chapter'>
            {map(items, renderRow)}
            <p id={Styles.title}>DETACHMENT RULES</p>
            {size(detachmentDetailsRules) && map(detachmentDetailsRules, renderDetachmentDetail)}
            {map(rules, renderDetachmentRules)}
        </div>
    </>
}

export default Detachment