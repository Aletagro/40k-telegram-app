import React from 'react';
import {useLocation} from 'react-router-dom'
import Row from '../components/Row'
import Ability from '../components/Ability'
import HeaderImage from '../components/HeaderImage'
import {sortByName} from '../utilities/utils'
import Constants from '../Constants'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const RuleSections = () => {
    const {document} = useLocation().state
    const ruleContainers = sortByName(filter(dataBase.data.rule_container, ['ruleSectionId', document.id]), 'displayOrder')
    const ruleSections = sortByName(filter(dataBase.data.rule_section, ['parentId', document.id]), 'displayOrder')

    const renderContainer = (paragraph) => {
        if (paragraph.containerType === 'stratagem') {
            const ability = find(dataBase.data.stratagem, ['id', paragraph.stratagemId])
            return <Ability key={paragraph.id} ability={ability} />
        }
        return <Row
            key={paragraph.id}
            title={paragraph.title}
            subtitle={paragraph.subtitle}
            navigateTo='rules'
            state={{paragraph}}
        />
    }

    const renderSection = (document) => <Row
        key={document.id}
        title={document.name}
        navigateTo='ruleSections'
        state={{document}}
    />

    return <>
        <HeaderImage src={Constants.coreRulesImage} alt={document.name} />
        <div id='column' className='Chapter'>
            {ruleContainers && map(ruleContainers, renderContainer)}
            {ruleSections && map(ruleSections, renderSection)}
        </div>
    </>
}

export default RuleSections