import React from 'react';
import Constants from '../Constants'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'

const MainRules = () => {
    const renderRow = (grandAlliance) => <Row
        key={grandAlliance.id}
        title={grandAlliance.name}
        navigateTo='catalog'
        state={{grandAlliance}}
    />

    return <>
        <HeaderImage src='https://kartinki.pics/uploads/posts/2022-08/thumbs/1660848806_7-kartinkin-net-p-varkhammer-fentezi-malekit-oboi-krasivo-8.jpg' alt='main' />
        <div id='column' className='Chapter'>
            <Row title='Core Documents' navigateTo='coreDocuments' />
            {map(Constants.grandAlliances, renderRow)}
            <Row title='Regiment Of Renown' navigateTo='regimentOfRenownList' />
            <Row title='Manifestations' navigateTo='manifestations' />
            <Row title='Legends' navigateTo='legends' />
        </div>
    </>
}

export default MainRules