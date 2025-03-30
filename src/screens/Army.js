import React from 'react'
import {useLocation} from 'react-router-dom'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import {sortByName} from '../utilities/utils'
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
    const detachments = sortByName(filter(dataBase.data.detachment, ['publicationId', codexInfo.id]))
    const armyRules = filter(dataBase.data.army_rule, ['publicationId', codexInfo.id])
    const faq = filter(dataBase.data.faq, ['publicationId', codexInfo.id])
    const errata = filter(dataBase.data.amendment, ['publicationId', codexInfo.id])

    let items = [
        {title: 'Datasheets', screen: 'units'}
    ]

    if (size(armyRules)) {
        items.push({title: 'Army Rules', screen: 'armyRules', data: armyRules})
    }
    if (size(faq)) {
        items.push({title: 'FAQs', screen: 'faq', data: faq})
    }
    if (size(errata)) {
        items.push({title: 'Updates & Errata', screen: 'errata', data: errata})
    }

    // const handleClickBuilder = () => {
    //     roster.allegiance = faction.name
    //     navigationState.isBuilder = true
    // }

    const renderRow = (item) => <Row
        key={item.title}
        title={item.title}
        navigateTo={item.screen}
        state={{faction, codexInfo, data: item.data}}
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
            {size(detachments)
                ? <>
                    <p id={Styles.title}>Detachments</p>
                    {map(detachments, renderDetachment)}
                </>
                : null
            }
        </div>
    </>
}

export default Army