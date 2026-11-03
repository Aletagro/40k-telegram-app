import React from 'react';
import {ListCard, ListItem} from '../components/ListCard'
import {sortByName} from '../utilities/utils'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'

const dataBase = require('../utilities/db')

const CoreRules = () => {
    const corePublication = find(dataBase.data.publication, 'isCoreRules')
    const documents = sortByName(filter(dataBase.data.rule_section, ['publicationId', corePublication?.id]), 'displayOrder')

    const renderRow = (document) => <ListItem
        key={document.id}
        title={document.name}
        navigateTo='ruleSections'
        state={{document}}
    />

    return <div id='column' className='Chapter'>
        <ListCard>
            {documents && map(documents, renderRow)}
        </ListCard>
    </div>
}

export default CoreRules