import React, {useCallback, useReducer} from 'react'
import Constants from '../Constants'
import {isCollapseRegimentAlliances} from '../utilities/appState'
import {regimentSortesByGrandAlliances} from '../utilities/utils'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import Accordion from '../components/Accordion'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const RegimentsOfRenownList = () => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const regimentsOfRenown = filter(dataBase.data.ability_group, (group) => group.abilityGroupType === 'regimentOfRenown')
    const sortedRegimentsOfRenown = regimentSortesByGrandAlliances(regimentsOfRenown.map(regiment => {
        const keywords = find(dataBase.data.warscroll, warscroll => warscroll.id === regiment.regimentOfRenownRowImageWarscrollId).referenceKeywords
        return {...regiment, keywords}
    }))

    const handleChangeExpand = useCallback((e) => {
        isCollapseRegimentAlliances[e.nativeEvent.target?.innerText] = !isCollapseRegimentAlliances[e.nativeEvent.target?.innerText]
        forceUpdate()
    }, [])

    const renderRow = (regiment) => {
        const image = find(dataBase.data.warscroll, ['id', regiment.regimentOfRenownRowImageWarscrollId])?.rowImage
        return <Row
            key={regiment.id}
            title={regiment.name}
            rightText={regiment?.regimentOfRenownPointsCost ? `${regiment?.regimentOfRenownPointsCost} pts` : undefined}
            navigateTo='regimentOfRenown'
            state={{regiment}}
            image={image}
        />
    }

    const renderRegimentAlliance = (alliance) => <Accordion
        title={alliance.title}
        data={alliance.regiments}
        renderItem={renderRow}
        expanded={!isCollapseRegimentAlliances[alliance.title]}
        onChangeExpand={handleChangeExpand}
    />

    return <>
        <HeaderImage src={Constants.regimentsOfRenownImage} alt='Regiment Of Renown' />
        <div id='column' className='Chapter'>
            {sortedRegimentsOfRenown && map(sortedRegimentsOfRenown, renderRegimentAlliance)}
        </div>
    </>
}

export default RegimentsOfRenownList