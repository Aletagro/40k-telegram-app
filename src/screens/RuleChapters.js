import React from 'react';
import {useLocation} from 'react-router-dom'
import Row from '../components/Row'
import Rules from './Rules'

import map from 'lodash/map'
import filter from 'lodash/filter'

const dataBase = require('../utilities/db')

const RuleChapters = () => {
    const {chapter} = useLocation().state
    const ruleChapters = filter(dataBase.data.rule_section, (section) => section.parentId === chapter.id)
    ruleChapters.sort((a, b) => a.displayOrder - b.displayOrder)

    const renderRow = (paragraph) => <Row
        key={paragraph.id}
        title={paragraph.name}
        navigateTo='rules'
        state={{paragraph}}
    />

    return ruleChapters.length > 0
        ? <>
            <div id='column' className='Chapter'>
                {ruleChapters && map(ruleChapters, renderRow)}
            </div>
        </>
        : <Rules info={chapter} />
}

export default RuleChapters