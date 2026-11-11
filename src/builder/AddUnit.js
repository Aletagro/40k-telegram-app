import {t} from '../utilities/i18n'
import React from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {ListCard, ListItem} from '../components/ListCard'
import CollapseSection from '../components/CollapseSection'
import {sortByName} from '../utilities/utils'
import {addUnit, createUnit, getUnitLimit, getUnitCount, getUnitPoints, getDefaultComposition} from '../utilities/rosterModel'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import split from 'lodash/split'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'
import difference from 'lodash/difference'

const dataBase = require('../utilities/db')

const getAlliedBlocks = (alliedFactionIds) => {
    let allied = []
    let _alliedFactionIds = filter(alliedFactionIds, item => !find(dataBase.data.allied_faction, ['id', item.alliedFactionId])?.isSiblingFaction)
    const alliedWithParentKeyword = filter(_alliedFactionIds, item => size(filter(dataBase.data.allied_faction_parent_faction_keyword, ['alliedFactionId', item.alliedFactionId])) > 1)
    _alliedFactionIds = difference(_alliedFactionIds, alliedWithParentKeyword)
    forEach(_alliedFactionIds, item => {
        const links = filter(dataBase.data.allied_faction_datasheet, ['alliedFactionId', item.alliedFactionId])
        const datasheets = sortByName(map(links, link => find(dataBase.data.datasheet, ['id', link.datasheetId])))
        const publication = find(dataBase.data.publication, ['id', datasheets[0]?.publicationId])
        if (size(datasheets)) allied.push({title: split(publication?.name, ':')[1]?.trim() || publication?.name, units: datasheets, alliedFactionId: item.alliedFactionId})
    })
    forEach(alliedWithParentKeyword, item => {
        const links = filter(dataBase.data.allied_faction_datasheet, ['alliedFactionId', item.alliedFactionId])
        const datasheets = map(links, link => find(dataBase.data.datasheet, ['id', link.datasheetId]))
        forEach(filter(dataBase.data.allied_faction_parent_faction_keyword, ['alliedFactionId', item.alliedFactionId]), parent => {
            const parentDatasheets = filter(datasheets, datasheet => find(dataBase.data.datasheet_faction_keyword, link => link.datasheetId === datasheet.id && link.factionKeywordId === parent.factionKeywordId))
            const faction = find(dataBase.data.faction_keyword, ['id', parent.factionKeywordId])
            if (size(parentDatasheets)) allied.push({title: faction?.name, units: parentDatasheets, alliedFactionId: item.alliedFactionId})
        })
    })
    return sortByName(allied, 'title')
}

// Выбор юнита для добавления в ростер
const AddUnit = () => {
    const navigate = useNavigate()
    const {unitsType, isAllied, alliedFactionIds} = useLocation().state
    const allied = isAllied ? getAlliedBlocks(alliedFactionIds) : []
    const [expanded, setExpanded] = React.useState({})

    const handleClick = (datasheet, alliedFactionId = '') => () => {
        addUnit(createUnit(datasheet.id, {alliedFactionId}))
        navigate(-1)
    }

    const renderRow = (datasheet, alliedFactionId) => {
        const isLimit = getUnitCount(datasheet.id) >= getUnitLimit(datasheet.id)
        const points = getUnitPoints({datasheetId: datasheet.id, compositionId: getDefaultComposition(datasheet.id)?.id}, getUnitCount(datasheet.id) + 1)
        return <ListItem
            key={datasheet.id}
            title={datasheet.name}
            subtitle={isLimit ? t('Limit reached') : undefined}
            rightText={points ? `${points} pts` : undefined}
            image={datasheet.rowImage}
            onClick={isLimit ? undefined : handleClick(datasheet, alliedFactionId)}
            onInfo={() => navigate('/datasheet', {state: {title: datasheet.name, unit: datasheet}})}
        />
    }

    const handleToggle = (title) => setExpanded(state => ({...state, [title]: !state[title]}))

    if (isAllied) {
        return <div id='column' className='Chapter'>
            {map(allied, block => <CollapseSection key={block.title} title={block.title} expanded={Boolean(expanded[block.title])} onToggle={handleToggle}>
                <ListCard>{map(block.units, unit => renderRow(unit, block.alliedFactionId))}</ListCard>
            </CollapseSection>)}
        </div>
    }

    return <div id='column' className='Chapter'>
        <ListCard>{map(unitsType.units, unit => renderRow(unit))}</ListCard>
    </div>
}

export default AddUnit
