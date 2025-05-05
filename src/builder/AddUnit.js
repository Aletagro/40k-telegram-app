import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import {sortByName, setDefaultWargears} from '../utilities/utils'
import UnitRow from './UnitRow'
import Accordion from '../components/Accordion'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import split from 'lodash/split'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'
import difference from 'lodash/difference'

// import Styles from './styles/AddUnit.module.css'

const dataBase = require('../dataBase.json')

const AddUnit = () => {
    window.scrollTo(0, 0)
    const navigate = useNavigate()
    const {unitsType, isAllied, alliedFactionIds} = useLocation().state
    let allied = []
    if (isAllied) {
        let _alliedFactionIds = filter(alliedFactionIds, item => !find(dataBase.data.allied_faction, ['id', item.alliedFactionId])?.isSiblingFaction)
        const alliedWithParentKeyword = filter(_alliedFactionIds, item => {
            const parentFactions = filter(dataBase.data.allied_faction_parent_faction_keyword, ['alliedFactionId', item.alliedFactionId])
            return size(parentFactions) > 1
        })
        _alliedFactionIds = difference(_alliedFactionIds, alliedWithParentKeyword)
        const alliedDatasheetsIds = map(_alliedFactionIds, item => filter(dataBase.data.allied_faction_datasheet, ['alliedFactionId', item.alliedFactionId]))
        const alliedDatasheets = map(alliedDatasheetsIds, data => sortByName(map(data, item => find(dataBase.data.datasheet, ['id', item.datasheetId]))))
        allied = map(alliedDatasheets, _allied => {
            const faction = find(dataBase.data.publication, ['id', _allied[0].publicationId])
            return {title: split(faction.name, ':')[1], units: _allied}
        })
        allied = sortByName(allied, 'title')
        if (size(alliedWithParentKeyword)) {
            forEach(alliedWithParentKeyword, allieWithParentKeyword => {
                const datasheetsIds = filter(dataBase.data.allied_faction_datasheet, ['alliedFactionId', allieWithParentKeyword.alliedFactionId])
                const datasheets = map(datasheetsIds, item => find(dataBase.data.datasheet, ['id', item.datasheetId]))
                const parentFactions = filter(dataBase.data.allied_faction_parent_faction_keyword, ['alliedFactionId', allieWithParentKeyword.alliedFactionId])
                forEach(parentFactions, parentFaction => {
                    const parentFactionDatasheets = filter(datasheets, datasheet => find(dataBase.data.datasheet_faction_keyword, item => item.datasheetId === datasheet.id && item.factionKeywordId === parentFaction.factionKeywordId))
                    const faction = find(dataBase.data.faction_keyword, ['id', parentFaction.factionKeywordId])
                    allied.push({title: faction.name, units: parentFactionDatasheets})
                })
            })
        }
    }

    const getIsLimit = (unitId) => {
        const count = size(filter(roster.units[unitsType.title], ['id', unitId]))
        const miniature = find(dataBase.data.miniature, ['datasheetId', unitId])
        const miniatureKeywords = filter(dataBase.data.miniature_keyword, ['miniatureId', miniature.id])
        const keywords = map(miniatureKeywords, keyword => find(dataBase.data.keyword, ['id', keyword.keywordId]))
        const isWarlordTitan = Boolean(find(keywords, ['name', 'Warlord Titan']))
        return count === (isWarlordTitan ? 1 : unitsType.title === 'Battleline' ? 6 : 3)
    }

    const handleClick = (unit) => {
        if (roster.units[unitsType.title]) {
            const newUnits = roster.units[unitsType.title]
            newUnits.push(unit)
            roster.units[unitsType.title] = newUnits
        } else {
            roster.units = {...roster.units, [unitsType.title]: [unit]}
        }
        roster.points[unitsType.title] = (roster.points[unitsType.title] || 0) + unit.points
        roster.points.all = roster.points.all + unit.points
        setDefaultWargears(unit, unitsType.title)
        navigate(-1)
    }

    const renderRow = (unit) => getIsLimit(unit.id)
        ? null
        : <UnitRow key={unit?.id} unit={unit} onClick={handleClick} isAddUnit />
        

    const renderBlock = (block) => <Accordion
        title={block.title}
        data={block.units}
        renderItem={renderRow}
    />

    return <div id='column' className='Chapter'>
        {isAllied
            ? map(allied, renderBlock)
            : map(unitsType.units, renderRow)}
    </div>
}

export default AddUnit