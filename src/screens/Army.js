import React from 'react'
import {useLocation} from 'react-router-dom'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
// import {roster, navigationState} from '../utilities/appState'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import filter from 'lodash/filter'
import includes from 'lodash/includes'

import Styles from './styles/Army.module.css'

const dataBase = require('../dataBase.json')

const Army = () => {
    const {faction} = useLocation().state
    const codexInfo = find(dataBase.data.publication, publication => publication.factionKeywordId === faction.id && !publication.isCombatPatrol && !includes(publication.name, 'Imperial Armour'))
    const detachments = filter(dataBase.data.detachment, ['publicationId', codexInfo.id])

    let items = [
        {title: 'Datasheets', screen: 'units'},
        {title: 'Army Rules', screen: 'armyRules'},
    ]

    // const handleClickBuilder = () => {
    //     roster.allegiance = faction.name
    //     navigationState.isBuilder = true
    // }

    const renderRow = (item) => <Row
        key={item.title}
        title={item.title}
        navigateTo={item.screen}
        state={{faction, codexInfo, info: item}}
    />

    const renderDetachment = (detachment) => <Row
        key={detachment.id}
        title={detachment.name}
        navigateTo={'detachment'}
        state={{detachment, faction}}
    />


    // const renderBuilderRow = () => <Row
    //     title='Builder'
    //     navigateTo='builder'
    //     state={{alliganceId: faction.id}}
    //     onClick={handleClickBuilder}
    // />

    return <>
        <HeaderImage src={faction.rosterHeaderImage} alt={faction.name} isWide />
        <div id='column' className='Chapter'>
            {map(items, renderRow)}
            {/* {renderBuilderRow()} */}
            <p id={Styles.title}>Detachments</p>
            {size(detachments)
                ? map(detachments, renderDetachment)
                : null
            }
        </div>
    </>
}

export default Army