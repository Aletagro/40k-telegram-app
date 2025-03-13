import React from 'react';
import Constants from '../Constants'
import {roster} from '../utilities/appState'
import BuilderRow from './BuilderRow'

import Styles from './styles/ChooseGrandAlliance.module.css'

const ChooseGrandAlliance = () => {

    const handleClick = ({grandAlliance}) => {
        roster.grandAlliance = grandAlliance.name
    }

    const renderRow = (grandAlliance) => <BuilderRow
        key={grandAlliance.id}
        title={grandAlliance.name}
        navigateTo='chooseFaction'
        state={{grandAlliance}}
        onClick={handleClick}
    />

    return  <div id='column' className='Chapter'>
        <h4 id={Styles.title}>Choose your Grand Alliance</h4>
        {Constants.grandAlliances.map(renderRow)}
    </div>
}

export default ChooseGrandAlliance