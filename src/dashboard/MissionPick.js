import {t} from '../utilities/i18n'
import React from 'react'
import Modal from '../components/Modal'
import {replaceAsterisks} from '../utilities/utils'
import {getPrimaryMissionDetail, getSecondaryMissionDetail} from './missionData'

import map from 'lodash/map'
import size from 'lodash/size'

import Styles from './styles/Dashboard.module.css'

// Плашка миссии: название и кнопка "i", которая открывает описание
export const MissionOption = ({mission, active, onClick, onInfo}) => <div className={`${Styles.mission} ${active ? Styles.missionActive : ''}`}>
    <button type='button' className={Styles.missionBody} onClick={onClick}>{mission.name}</button>
    <button type='button' className={Styles.missionInfo} onClick={onInfo} aria-label={t('Info')}>i</button>
</div>

// Окно с описанием миссии и тем, за что дают очки. kind: 'primary' | 'secondary'
// Окно с текстом поворота (twist)
export const TwistInfoModal = ({twist, onClose}) => <Modal visible={Boolean(twist)} title={twist?.name} onClose={onClose}>
    {twist ? <div className={Styles.scrollBox}>
        {twist.lore ? <p className={Styles.infoCaption}><i>{replaceAsterisks(twist.lore)}</i></p> : null}
        {twist.rules ? <p className={Styles.infoCaption}>{replaceAsterisks(twist.rules)}</p> : null}
    </div> : null}
</Modal>

export const MissionInfoModal = ({mission, kind, onClose}) => {
    const detail = mission ? (kind === 'primary' ? getPrimaryMissionDetail(mission.id) : getSecondaryMissionDetail(mission.id, 'fixed')) : null
    return <Modal visible={Boolean(mission)} title={mission?.name} onClose={onClose}>
        {detail ? <div className={Styles.scrollBox}>
            {detail.description ? <p className={Styles.infoCaption}>{replaceAsterisks(detail.description)}</p> : null}
            {map(detail.objectives, objective => <div className={Styles.infoBlock} key={objective.id}>
                <p className={Styles.infoName}>{objective.name}</p>
                {objective.when ? <p className={Styles.infoWhen}>{replaceAsterisks(objective.when)}</p> : null}
                {size(objective.scorings)
                    ? map(objective.scorings, scoring => <p className={Styles.infoScoring} key={scoring.id}>
                        <b>{t('{{count}} VP', {count: scoring.vp})}</b>{scoring.criteria ? <> - {replaceAsterisks(scoring.criteria)}</> : null}
                        {scoring.cap ? <span className={Styles.infoWhen}> ({t('up to {{count}} VP', {count: scoring.cap})})</span> : null}
                    </p>)
                    : null}
            </div>)}
        </div> : null}
    </Modal>
}
