import React from 'react';
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import {sortByName} from '../utilities/utils'
import Constants from '../Constants'

import map from 'lodash/map'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const CoreRules = () => {
    const documents = sortByName(filter(dataBase.data.rule_section, ['publicationId', Constants.coreRulesId]), 'displayOrder')

    const renderRow = (document) => <Row
        key={document.id}
        title={document.name}
        navigateTo='ruleSections'
        state={{document}}
    />

    return <>
        <HeaderImage src={Constants.coreRulesImage} alt='Core Rules' />
        <div id='column' className='Chapter'>
            {documents && map(documents, renderRow)}
        </div>
    </>
}

export default CoreRules