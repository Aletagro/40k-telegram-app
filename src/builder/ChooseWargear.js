import React from 'react'
import {useLocation} from 'react-router-dom'
import MiniatureWargearOptions from './MiniatureWargearOptions'
import {sortByName} from '../utilities/utils'

import map from 'lodash/map'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const ChooseWargear = () => {
    const {unit, unitIndex} = useLocation().state
    const miniatures = filter(dataBase.data.miniature, ['datasheetId', unit.id])
    const wargearOptionGroups = map(miniatures, miniature => {
        return {
            miniature,
            wargearOptions: sortByName(filter(dataBase.data.wargear_option_group, ['miniatureId', miniature.id]), 'displayOrder')
        }
    })

    const renderMiniatureWargearOptions = (wargearOptionGroup, index) => <MiniatureWargearOptions
        key={index}
        unit={unit}
        unitData={{unitType: unit.unitType, unitIndex}}
        wargearOptionGroup={wargearOptionGroup}
    />

    return <div id='column' className='Chapter'>
        {map(wargearOptionGroups, renderMiniatureWargearOptions)}
    </div>
}

export default ChooseWargear