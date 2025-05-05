import React from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import MiniatureWargearOptions from './MiniatureWargearOptions'
import {sortByName} from '../utilities/utils'

import map from 'lodash/map'
import filter from 'lodash/filter'

import Styles from './styles/ChooseEnhancement.module.css'

const dataBase = require('../dataBase.json')

const ChooseWargear = () => {
    const navigate = useNavigate()
    const {unit, unitIndex, isAllied} = useLocation().state
    const miniatures = filter(dataBase.data.miniature, ['datasheetId', unit.id])
    const wargearOptionGroups = map(miniatures, miniature => {
        return {
            miniature,
            wargearOptions: sortByName(filter(dataBase.data.wargear_option_group, ['miniatureId', miniature.id]), 'displayOrder')
        }
    })

    const handleGoBack = () => {
        navigate(-1)
    }

    const renderMiniatureWargearOptions = (wargearOptionGroup, index) => <MiniatureWargearOptions
        key={index}
        unit={unit}
        unitData={{unitType: isAllied ? 'Allied Units' : unit.unitType, unitIndex}}
        wargearOptionGroup={wargearOptionGroup}
    />

    return <div id='column' className='Chapter'>
        {map(wargearOptionGroups, renderMiniatureWargearOptions)}
        <button id={Styles.delete} onClick={handleGoBack}>Back</button>
    </div>
}

export default ChooseWargear