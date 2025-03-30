import React from 'react';
import {useLocation} from 'react-router-dom'
import {sortByName} from '../utilities/utils'
import Ability from '../components/Ability'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const Enhancements = () => {
    const {detachment} = useLocation().state
    const enhancements = sortByName(filter(dataBase.data.enhancement, ['detachmentId', detachment.id]), 'displayOrder')

    const renderEnhancement = (enhancement) => <Ability
        key={enhancement.id}
        ability={enhancement}
        isDarkBackground
    />

    return <>
        {detachment.bannerImage ? <HeaderImage src={detachment.bannerImage} alt={detachment.name} /> : null}
        <div id='column' className='Chapter'>
            {map(enhancements, renderEnhancement)}
        </div>
    </>
}

export default Enhancements