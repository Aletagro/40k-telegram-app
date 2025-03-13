import React from 'react';
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import Constants from '../Constants'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const CoreDocuments = () => {
    const documentsIds = filter(dataBase.data.publication_publication_group, (publication) => publication.publicationGroupId === Constants.coreDocumentsId)
    let documents = map(documentsIds, ({publicationId}) => find(dataBase.data.publication, publication => publication.id === publicationId))
    documents = filter(documents, document => !document.spearheadName)
    documents.sort((a, b) => a.displayOrder - b.displayOrder)

    const renderRow = (document) => <Row
        key={document.id}
        title={document.name}
        navigateTo='ruleSections'
        state={{document}}
    />

    return <>
        <HeaderImage src={Constants.rulesImage} alt='Core Documents' />
        <div id='column' className='Chapter'>
            {documents && map(documents, renderRow)}
        </div>
    </>
}

export default CoreDocuments