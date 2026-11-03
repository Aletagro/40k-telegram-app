import React from 'react';
import {ListCard, ListItem} from '../components/ListCard'
import {sortByName} from '../utilities/utils'

import map from 'lodash/map'
import some from 'lodash/some'
import filter from 'lodash/filter'

const dataBase = require('../utilities/db')

// Ключевые документы - все публикации, у которых есть разделы правил, кроме основных правил
const KeyDocuments = () => {
    const documents = sortByName(filter(dataBase.data.publication, publication =>
        !publication.isCoreRules && some(dataBase.data.rule_section, ['publicationId', publication.id])
    ))

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

export default KeyDocuments
