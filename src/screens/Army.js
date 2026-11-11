import React from 'react'
import {useLocation} from 'react-router-dom'
import Tile from '../components/Tile'
import {ListCard, ListItem, SectionTitle} from '../components/ListCard'
import ImageCard from '../components/ImageCard'
import HeaderImage from '../components/HeaderImage'
import {sortByName, getCodexInfo} from '../utilities/utils'
import {roster, navigationState, lists} from '../utilities/appState'
import {resetRoster} from '../utilities/rosterModel'

import map from 'lodash/map'
import size from 'lodash/size'
import filter from 'lodash/filter'

import Styles from './styles/Army.module.css'

const dataBase = require('../utilities/db')

const Army = () => {
    const {faction, grandFaction} = useLocation().state
    const codexInfo = getCodexInfo(faction.id)
    const detachments = sortByName(filter(dataBase.data.detachment, ['publicationId', codexInfo.id]))
    const armyRules = filter(dataBase.data.army_rule, ['publicationId', codexInfo.id])
    // В таблице faq лежат и вопросы с ответами (question), и эрраты (errataHeader)
    const publicationFaq = filter(dataBase.data.faq, ['publicationId', codexInfo.id])
    const faq = filter(publicationFaq, 'question')
    const errata = filter(publicationFaq, 'errataHeader')

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

    const handleClickBuilder = () => {
        resetRoster()
        roster.grandFaction = grandFaction
        roster.faction = faction.name
        roster.factionId = faction.id
        navigationState.isBuilder = true
    }

    const handleOpenLists = () => {
        lists.data = []
        lists.meta = {}
        lists.isFirstReq = true
        lists.filters = {faction_id: faction.id, points_limit: 2000}
    }

    const [datasheets, ...rules] = items

    // если плиток нечётное число, последняя растягивается на всю ширину
    const renderTile = (item, index) => <Tile
        key={item.title}
        compact
        wide={size(rules) % 2 === 1 && index === size(rules) - 1}
        title={item.title}
        navigateTo={item.screen}
        state={{faction, codexInfo, data: item.data}}
    />

    const renderDetachment = (detachment) => <ImageCard
        key={detachment.id}
        title={detachment.name}
        image={detachment.bannerImage || detachment.rowImage}
        badge={detachment.detachmentPointsCost ? `${detachment.detachmentPointsCost} DP` : undefined}
        navigateTo='detachment'
        state={{detachment, faction}}
    />

    return <>
        <HeaderImage src={faction.rosterHeaderImage} alt={faction.name} isWide />
        <div id='column' className='Chapter'>
            <Tile
                featured
                title='Datasheets'
                text='All units of the army'
                navigateTo={datasheets.screen}
                state={{faction, codexInfo}}
            />
            {size(rules)
                ? <div className={Styles.grid}>{map(rules, renderTile)}</div>
                : <div className={Styles.spacer} />
            }
            <ListCard>
                <ListItem title='Builder' navigateTo='builder' state={{faction}} onClick={handleClickBuilder} />
                <ListItem title='Community Lists' navigateTo='lists' onClick={handleOpenLists} />
            </ListCard>
            {size(detachments)
                ? <>
                    <SectionTitle>Detachments</SectionTitle>
                    {map(detachments, renderDetachment)}
                </>
                : null
            }
        </div>
    </>
}

export default Army