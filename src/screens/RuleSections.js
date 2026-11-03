import React from 'react';
import {useLocation} from 'react-router-dom'
import {ListCard, ListItem} from '../components/ListCard'
import {sortByName} from '../utilities/utils'

import map from 'lodash/map'
import filter from 'lodash/filter'

const dataBase = require('../utilities/db')

const RuleSections = () => {
    const {document} = useLocation().state
    const ruleContainers = sortByName(filter(dataBase.data.rule_container, ['ruleSectionId', document.id]), 'displayOrder')
    // document - это либо раздел (его подразделы и правила), либо публикация (её корневые разделы)
    const ruleSections = sortByName(filter(dataBase.data.rule_section, section =>
        section.parentId === document.id || (section.publicationId === document.id && !section.parentId)
    ), 'displayOrder')

    const renderContainer = (paragraph) => {
        if (paragraph.containerType === 'introduction') {
            return null
        }
        return <ListItem
            key={paragraph.id}
            title={paragraph.title}
            subtitle={paragraph.subtitle}
            navigateTo='rules'
            state={{paragraph}}
        />
    }

    const renderSection = (document) => <ListItem
        key={document.id}
        title={document.name}
        navigateTo='ruleSections'
        state={{document}}
    />

    return <div id='column' className='Chapter'>
        <ListCard>
            {map(ruleContainers, renderContainer)}
            {map(ruleSections, renderSection)}
        </ListCard>
    </div>
}

export default RuleSections