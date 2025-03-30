import React from 'react';
import {useLocation} from 'react-router-dom'
import {sortByName} from '../utilities/utils'
import Ability from '../components/Ability'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const Stratagems = () => {
    const {detachment} = useLocation().state
    const stratagems = sortByName(filter(dataBase.data.stratagem, ['detachmentId', detachment.id]), 'displayOrder')

    const renderStratagem = (stratagem) => <Ability
        key={stratagem.id}
        ability={stratagem}
    />

    return <>
        {detachment.bannerImage ? <HeaderImage src={detachment.bannerImage} alt={detachment.name} /> : null}
        <div id='column' className='Chapter'>
            {map(stratagems, renderStratagem)}
        </div>
    </>
}

export default Stratagems