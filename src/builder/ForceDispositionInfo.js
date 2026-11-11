import React from 'react'
import {useLocation} from 'react-router-dom'
import {SectionTitle} from '../components/ListCard'
import {replaceAsterisks, sortByName} from '../utilities/utils'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import sortBy from 'lodash/sortBy'
import filter from 'lodash/filter'

import Styles from './styles/Builder.module.css'

const dataBase = require('../utilities/db')

// Что привязано к Force Disposition: основные миссии (Primary Missions) для каждой доктрины противника
const ForceDispositionInfo = () => {
    const {forceDispositionId} = useLocation().state
    const missions = sortBy(filter(dataBase.data.force_disposition_mission, ['friendlyForceDispositionId', forceDispositionId]), item => find(dataBase.data.primary_mission, ['id', item.primaryMissionId])?.name)

    const renderObjective = (objective) => {
        const scorings = filter(dataBase.data.primary_mission_objective_scoring, ['primaryMissionObjectiveId', objective.id])
        return <div key={objective.id}>
            <p className={Styles.muted}><b>{objective.name}</b>{objective.whenText ? ` - ${objective.whenText}` : ''}</p>
            {map(scorings, scoring => <p key={scoring.id}>{scoring.victoryPoints} VP: {replaceAsterisks(scoring.scoringCriteria)}</p>)}
        </div>
    }

    const renderMission = (item) => {
        const mission = find(dataBase.data.primary_mission, ['id', item.primaryMissionId])
        if (!mission) return null
        const opposition = find(dataBase.data.force_disposition, ['id', item.oppositionForceDispositionId])
        const objectives = sortByName(filter(dataBase.data.primary_mission_objective, ['primaryMissionId', mission.id]), 'displayOrder')
        return <div key={item.id} className={Styles.missionCard}>
            <h5>{mission.name}</h5>
            {opposition ? <p className={Styles.muted}>Against: {opposition.name}</p> : null}
            {mission.lore ? <p className={Styles.muted}><i>{mission.lore}</i></p> : null}
            {map(objectives, renderObjective)}
        </div>
    }

    return <div id='column' className='Chapter'>
        <SectionTitle>Primary Missions</SectionTitle>
        {size(missions) ? map(missions, renderMission) : <p className={Styles.empty}>No linked missions</p>}
    </div>
}

export default ForceDispositionInfo
