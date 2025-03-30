import React, {useCallback, useReducer} from 'react'
import {useLocation} from 'react-router-dom'
import {sortByName, unitsSortesByType} from '../utilities/utils'
import {isCollapseUnitsTypes} from '../utilities/appState'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import Accordion from '../components/Accordion'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'
import findIndex from 'lodash/findIndex'

const dataBase = require('../dataBase.json')

const Units = () => {
    const {faction, codexInfo} = useLocation().state
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    let units = []
    if (codexInfo) {
        units = filter(dataBase.data.datasheet, datasheet => datasheet.publicationId === codexInfo?.id)
    } else {
        const unitsIds = map(filter(dataBase.data.datasheet_faction_keyword, (item) => item.factionKeywordId === faction.id), item => item.datasheetId)
        units = map(unitsIds, unitId => find(dataBase.data.datasheet, datasheet => datasheet.id === unitId))
    }
    const miniatures = map(units, unit => find(dataBase.data.miniature, ['datasheetId', unit.id]))
    const unitsTypes = map(miniatures, miniature => {
        const keywordsIds = sortByName(filter(dataBase.data.miniature_keyword, ['miniatureId', miniature.id]), 'displayOrder')
        const keywords = map(keywordsIds, keyword => find(dataBase.data.keyword, ['id', keyword.keywordId]))
        const characterIndex = findIndex(keywords, ['name', 'Character'])
        return characterIndex >= 0 ? 'Character' : keywords[0]?.name

    })
    units = map(units, (unit, index) => ({...unit, unitType: unitsTypes[index]}))
    units = unitsSortesByType(units)

    const handleChangeExpand = useCallback((e) => {
        isCollapseUnitsTypes[e.nativeEvent.target?.innerText] = !isCollapseUnitsTypes[e.nativeEvent.target?.innerText]
        forceUpdate()
    }, [])

    const renderRow = (unit) => <Row
        key={unit?.id}
        title={unit?.name}
        rightText={unit?.points ? `${unit?.points} pts` : undefined}
        image={unit?.rowImage}
        navigateTo='datasheet'
        state={{unit}}
    />

    const renderUnitsType = (type) => <Accordion
        title={type.title}
        data={type.units}
        renderItem={renderRow}
        expanded={!isCollapseUnitsTypes[type.title]}
        onChangeExpand={handleChangeExpand}
    />

    return <>
        {faction?.rosterHeaderImage
            ? <HeaderImage src={faction?.rosterHeaderImage} alt={faction?.name} isWide />
            : null
        }
        <div id='column' className='Chapter'>
            {units.map(renderUnitsType)}
        </div>
    </>
}

export default Units