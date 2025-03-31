import React from 'react';
import {useLocation} from 'react-router-dom'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import {sortByName} from '../utilities/utils'
import Constants from '../Constants'

import map from 'lodash/map'
import size from 'lodash/size'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const RuleSections = () => {
    const {document} = useLocation().state
    const ruleContainers = sortByName(filter(dataBase.data.rule_container, ['ruleSectionId', document.id]), 'displayOrder')
    const ruleSections = sortByName(filter(dataBase.data.rule_section, ['parentId', document.id]), 'displayOrder')
    let startContainers = []
    let endContainers = []
    if (document.id === '211c642c-438b-4b9b-886f-1a551a29a88d') {
        startContainers = filter(ruleContainers, ['id', 'd02413a0-4316-4e24-90d8-80f98af615b8'])
        endContainers = filter(ruleContainers, container => container.id !== 'd02413a0-4316-4e24-90d8-80f98af615b8')
    }
    console.log({ruleSections})
    const renderContainer = (paragraph) => {
        if (paragraph.containerType === 'introduction') {
            return null
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
            {ruleContainers
                ? size(startContainers)
                    ? map(startContainers, renderContainer)
                    : map(ruleContainers, renderContainer)
                : null
            }
            {ruleSections && map(ruleSections, renderSection)}
            {size(endContainers) && map(endContainers, renderContainer)}
        </div>
    </>
}

export default RuleSections