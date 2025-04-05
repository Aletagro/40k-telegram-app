import React from 'react'
import {useLocation} from 'react-router-dom'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import {sortByName} from '../utilities/utils'
import {roster, navigationState} from '../utilities/appState'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import filter from 'lodash/filter'
import includes from 'lodash/includes'

import Styles from './styles/Army.module.css'

const dataBase = require('../dataBase.json')

const Army = () => {
    const {faction, grandFaction} = useLocation().state
    const codexInfo = find(dataBase.data.publication, publication => publication.factionKeywordId === faction.id && !publication.isCombatPatrol && !includes(publication.name, 'Imperial Armour'))
    const detachments = sortByName(filter(dataBase.data.detachment, ['publicationId', codexInfo.id]))
    const armyRules = filter(dataBase.data.army_rule, ['publicationId', codexInfo.id])
    const faq = filter(dataBase.data.faq, ['publicationId', codexInfo.id])
    const errata = filter(dataBase.data.amendment, ['publicationId', codexInfo.id])
    const grotErrataId = find(dataBase.data.rule_section, section => section.name === faction.name && section.parentId === '2258eed7-0511-4e18-9e51-206b959580b4')?.id
    const grotErrataContainer = filter(dataBase.data.rule_container, ['ruleSectionId', grotErrataId])
    const grotErrata = map(grotErrataContainer, container => {
        const text = find(dataBase.data.rule_container_component, ['ruleContainerId', container.id])?.textContent
        return {...container, text}
    })

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
    if (size(grotErrata)) {
        items.push({title: 'Grotmas Detachments Errata', screen: 'errata', data: grotErrata})
    }

    const handleClickBuilder = () => {
        roster.grandFaction = grandFaction
        roster.faction = faction.name
        roster.factionId = faction.id
        navigationState.isBuilder = true
    }

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


    const renderBuilderRow = () => <Row
        title='Builder'
        navigateTo='builder'
        state={{faction}}
        onClick={handleClickBuilder}
    />

    return <>
        <HeaderImage src={faction.rosterHeaderImage} alt={faction.name} isWide />
        <div id='column' className='Chapter'>
            {map(items, renderRow)}
            {renderBuilderRow()}
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