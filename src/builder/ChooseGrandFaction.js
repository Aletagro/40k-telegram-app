import React from 'react';
import Constants from '../Constants'
import {roster} from '../utilities/appState'
import BuilderRow from './BuilderRow'

const ChooseGrandFaction = () => {

    const handleClick = ({grandFaction}) => {
        roster.grandFaction = grandFaction.name
    }

    const renderRow = (grandFaction, index) => <BuilderRow
        key={index}
        title={grandFaction.name}
        navigateTo='chooseFaction'
        state={{grandFaction}}
        onClick={handleClick}
    />

    return  <div id='column' className='Chapter'>
        {Constants.grandFactions.map(renderRow)}
    </div>
}

export default ChooseGrandFaction