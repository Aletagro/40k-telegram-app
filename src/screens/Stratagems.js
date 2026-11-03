import React from 'react'
import {useLocation} from 'react-router-dom'
import Ability from '../components/Ability'
import {SectionTitle} from '../components/ListCard'
import HeaderImage from '../components/HeaderImage'
import {getStratagemPhases} from '../utilities/utils'

import map from 'lodash/map'
import filter from 'lodash/filter'
import startCase from 'lodash/startCase'

// Порядок групп стратагем; без категории - в конце
const CATEGORIES = ['battleTactic', 'strategicPloy', 'epicDeed', 'wargear', null]

const Stratagems = () => {
    const {detachment, data} = useLocation().state

    const renderStratagem = (stratagem) => <Ability
        key={stratagem.id}
        ability={{...stratagem, category: undefined}}
        phases={getStratagemPhases(stratagem.id)}
    />

    const renderGroup = (category) => {
        const stratagems = filter(data, item => (item.category || null) === category)
        return stratagems.length
            ? <React.Fragment key={category || 'other'}>
                <SectionTitle>{category ? startCase(category) : 'Stratagems'}</SectionTitle>
                {map(stratagems, renderStratagem)}
            </React.Fragment>
            : null
    }

    return <>
        {detachment.bannerImage ? <HeaderImage src={detachment.bannerImage} alt={detachment.name} /> : null}
        <div id='column' className='Chapter'>
            {map(CATEGORIES, renderGroup)}
        </div>
    </>
}

export default Stratagems
