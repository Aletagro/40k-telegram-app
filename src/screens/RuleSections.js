import React from 'react';
import {useLocation} from 'react-router-dom'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const RuleSections = () => {
    const {document} = useLocation().state
    const ruleSections = filter(dataBase.data.rule_section, (section) => section.publicationId === document.id && !section.parentId)
    ruleSections.sort((a, b) => a.displayOrder - b.displayOrder)
    
    const renderRow = (chapter) => <Row
        key={chapter.id}
        title={chapter.name}
        navigateTo='ruleChapters'
        state={{chapter}}
    />

    return <>
        <HeaderImage src={document.backgroundImage} alt={document.name} />
        <div id='column' className='Chapter'>
            {ruleSections && map(ruleSections, renderRow)}
        </div>
    </>
}

export default RuleSections