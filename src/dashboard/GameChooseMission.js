import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import Button from '../components/Button'
import {gameDraft} from '../utilities/appState'
import {MissionOption, MissionInfoModal} from './MissionPick'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'
import uniq from 'lodash/uniq'
import compact from 'lodash/compact'

import Styles from './styles/Dashboard.module.css'

const dataBase = require('../utilities/db')

// Своя основная миссия игрока вместо определённой по Force Disposition. Миссии сгруппированы по доктрине
const GameChooseMission = () => {
    const navigate = useNavigate()
    const index = useLocation().state?.index ?? 0
    const player = gameDraft.players[index]
    const [info, setInfo] = useState(null)
    if (!player) return null

    const groups = compact(map(dataBase.data.force_disposition, disposition => {
        const ids = uniq(map(filter(dataBase.data.force_disposition_mission, ['friendlyForceDispositionId', disposition.id]), 'primaryMissionId'))
        const missions = compact(map(ids, id => find(dataBase.data.primary_mission, ['id', id])))
        return missions.length ? {disposition, missions} : null
    }))

    const choose = (id) => () => {
        player.primaryMissionId = id
        navigate(-1)
    }

    return <div className={Styles.page}>
        <p className={Styles.muted}>{t('Both players agreed to play these missions instead of the ones from Force Disposition')}</p>
        {map(groups, ({disposition, missions}) => <div key={disposition.id} className={Styles.gap}>
            <p className={Styles.sectionTitle}>{disposition.name}</p>
            {map(missions, mission => <MissionOption key={mission.id} mission={mission} active={player.primaryMissionId === mission.id} onClick={choose(mission.id)} onInfo={() => setInfo(mission)} />)}
        </div>)}
        {player.primaryMissionId ? <div className={Styles.bottomBar}><Button type='secondary' onClick={choose(null)}>{t('Use missions from Force Disposition')}</Button></div> : null}
        <MissionInfoModal mission={info} kind='primary' onClose={() => setInfo(null)} />
    </div>
}

export default GameChooseMission
