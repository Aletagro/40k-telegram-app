import React from 'react';
import {useLocation} from 'react-router-dom'
import Ability from '../components/Ability'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'

const Enhancements = () => {
    const {detachment, data} = useLocation().state

    const renderEnhancement = (enhancement) => <Ability
        key={enhancement.id}
        ability={enhancement}
        isEnchancement
    />

    return <>
        {detachment.bannerImage ? <HeaderImage src={detachment.bannerImage} alt={detachment.name} /> : null}
        <div id='column' className='Chapter'>
            {map(data, renderEnhancement)}
        </div>
    </>
}

export default Enhancements