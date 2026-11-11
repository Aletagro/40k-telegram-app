import React from 'react'
import sortBy from 'lodash/sortBy'
import filter from 'lodash/filter'
import find from 'lodash/find'
import map from 'lodash/map'
import maxBy from 'lodash/maxBy'
import {getMiniatureCounts} from '../utilities/wargearModel'

import Styles from './styles/UnitStats.module.css'

const dataBase = require('../utilities/db')

// Основная модель отряда: которой больше всего в выбранном составе (при равенстве - первая по порядку)
export const getMainMiniature = (unit) => {
    const counts = getMiniatureCounts(unit)
    const miniatures = sortBy(filter(dataBase.data.miniature, miniature => miniature.datasheetId === unit.datasheetId && !miniature.statlineHidden), 'displayOrder')
    const inUnit = filter(miniatures, miniature => counts[miniature.id])
    return maxBy(inUnit, miniature => counts[miniature.id]) || miniatures[0]
}

// Неуязвимое спасение: общее для отряда или основной модели
export const getInvulSave = (unit) => {
    const main = getMainMiniature(unit)
    const saves = filter(dataBase.data.invulnerable_save, ['datasheetId', unit.datasheetId])
    return (find(saves, save => !save.miniatureId) || find(saves, save => save.miniatureId === main?.id))?.save || ''
}

// Характеристики основной модели отряда в одну строку
const UnitStats = ({unit}) => {
    const miniature = getMainMiniature(unit)
    if (!miniature) return null
    const stats = [
        {label: 'M', value: miniature.movement},
        {label: 'T', value: miniature.toughness},
        {label: 'SV', value: miniature.save},
        {label: 'W', value: miniature.wounds},
        {label: 'LD', value: miniature.leadership},
        {label: 'OC', value: miniature.objectiveControl}
    ]
    return <div className={Styles.container}>
        {map(stats, ({label, value}) => <span key={label} className={Styles.stat}>
            <span className={Styles.value}>{value}</span>
            <span className={Styles.label}>{label}</span>
        </span>)}
    </div>
}

export default UnitStats
