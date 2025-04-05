import React from 'react';
import {useLocation} from 'react-router-dom'
import Ability from '../components/Ability'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'

const Stratagems = () => {
    const {detachment, data} = useLocation().state

    const renderStratagem = (stratagem) => <Ability
        key={stratagem.id}
        ability={stratagem}
    />

    return <>
        {detachment.bannerImage ? <HeaderImage src={detachment.bannerImage} alt={detachment.name} /> : null}
        <div id='column' className='Chapter'>
            {map(data, renderStratagem)}
        </div>
    </>
}

export default Stratagems