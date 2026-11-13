import {t} from '../utilities/i18n'
import React, {useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Button from '../components/Button'
import ToggleRow from '../components/ToggleRow'
import {gameDraft} from '../utilities/appState'
import {getPrimaryMissionId, getAutoPrimaryMissionId, getFixedSecondaryMissions} from './gameSetup'
import {MODE_STANDARD, MODE_COMBAT_PATROL} from './missionData'
import {MissionOption, MissionInfoModal} from './MissionPick'

import map from 'lodash/map'
import find from 'lodash/find'
import includes from 'lodash/includes'
import filter from 'lodash/filter'

import Styles from './styles/Dashboard.module.css'

const dataBase = require('../utilities/db')

// Шаг 2: миссии, раскладка, вторичные миссии и первый ход
const GameMission = () => {
    const navigate = useNavigate()
    const [, setVersion] = useState(0)
    const [showErrors, setShowErrors] = useState(false)
    const [info, setInfo] = useState(null)
    const firstError = useRef(null)
    const refresh = () => setVersion(v => v + 1)
    const isStandard = gameDraft.mode === MODE_STANDARD

    if (!gameDraft.players.length) return null

    const update = (fn) => () => { fn(); refresh() }
    const chip = (label, active, onClick, key) => <button type='button' key={key || label} className={`${Styles.chip} ${active ? Styles.chipActive : ''}`} onClick={onClick}>{label}</button>
    const playerName = (index) => gameDraft.players[index].name || t('Player {{number}}', {number: index + 1})
    const getMission = (id) => find(dataBase.data.primary_mission, ['id', id])

    const errors = {
        primary: map(gameDraft.players, (player, index) => !getPrimaryMissionId(index)),
        fixed: map(gameDraft.players, player => isStandard && player.secondaryMode === 'fixed' && player.fixedIds.length !== 2)
    }
    const hasErrors = errors.primary.includes(true) || errors.fixed.includes(true)
    const mark = (isError) => showErrors && isError ? Styles.cardError : ''
    const errorRef = (isError) => showErrors && isError && !firstError.current ? (node) => { firstError.current = node } : undefined

    const renderPrimary = (player, index) => {
        const missionId = getPrimaryMissionId(index)
        const mission = getMission(missionId)
        const isAuto = !player.primaryMissionId
        const hint = gameDraft.mode === MODE_COMBAT_PATROL
            ? t('From the Combat Patrol')
            : getAutoPrimaryMissionId(index) ? t('From Force Disposition') : t('Force Disposition is missing in the army, choose the mission manually')
        return <div className={Styles.gap}>
            <span className={Styles.label}>{t('Primary mission')}</span>
            {mission
                ? <MissionOption mission={mission} active onClick={() => setInfo({mission, kind: 'primary'})} onInfo={() => setInfo({mission, kind: 'primary'})} />
                : <p className={showErrors ? Styles.errorText : Styles.muted}>{hint}</p>}
            {mission ? <p className={Styles.muted}>{isAuto ? hint : t('Custom mission')}</p> : null}
            {gameDraft.mode === MODE_STANDARD
                ? <Button type='secondary' onClick={() => navigate('/gameChooseMission', {state: {title: t('Custom missions'), index}})}>{t('Choose custom missions')}</Button>
                : null}
        </div>
    }

    const renderSecondary = (player, index) => {
        if (!isStandard) return null
        const fixed = getFixedSecondaryMissions()
        return <div className={Styles.gap}>
            <span className={Styles.label}>{t('Secondary missions')}</span>
            <div className={Styles.chips}>
                {chip(t('Tactical'), player.secondaryMode === 'tactical', update(() => { player.secondaryMode = 'tactical' }))}
                {chip(t('Fixed'), player.secondaryMode === 'fixed', update(() => { player.secondaryMode = 'fixed' }))}
            </div>
            {player.secondaryMode === 'tactical' ? <>
                <div className={Styles.chips}>
                    {chip(t('Digital deck'), player.deckSource === 'digital', update(() => { player.deckSource = 'digital' }))}
                    {chip(t('Physical deck'), player.deckSource === 'physical', update(() => { player.deckSource = 'physical' }))}
                </div>
                <p className={Styles.muted}>{player.deckSource === 'physical'
                    ? t('You draw the cards by hand, and the app asks which ones you drew each Command phase')
                    : t('A digital deck: two cards are drawn each Command phase')}</p>
            </> : null}
            {player.secondaryMode === 'fixed' ? <>
                <p className={showErrors && errors.fixed[index] ? Styles.errorText : Styles.muted}>{t('Choose two fixed secondary missions')}</p>
                {map(fixed, mission => <MissionOption key={mission.id} mission={mission} active={includes(player.fixedIds, mission.id)}
                    onClick={update(() => {
                        player.fixedIds = includes(player.fixedIds, mission.id) ? filter(player.fixedIds, id => id !== mission.id) : [...player.fixedIds, mission.id].slice(-2)
                    })}
                    onInfo={() => setInfo({mission, kind: 'secondary'})} />)}
            </> : null}
        </div>
    }

    const renderPlayer = (player, index) => <div className={`${Styles.card} ${mark(errors.primary[index] || errors.fixed[index])}`} key={index} ref={errorRef(errors.primary[index] || errors.fixed[index])}>
        <h3 className={Styles.cardTitle}>{playerName(index)}</h3>
        {renderPrimary(player, index)}
        {renderSecondary(player, index)}
        {isStandard ? <ToggleRow label={t('Battle Ready army')} hint={t('Fully painted army: +10 VP')} checked={player.battleReady} onChange={update(() => { player.battleReady = !player.battleReady })} /> : null}
    </div>

    const handleNext = () => {
        if (hasErrors) {
            firstError.current = null
            setShowErrors(true)
            setTimeout(() => firstError.current?.scrollIntoView({behavior: 'smooth', block: 'center'}), 50)
            return
        }
        navigate('/gameBattlefield', {state: {title: t('Battlefield')}})
    }

    return <div className={Styles.page}>
        <div className={Styles.stack}>
            {gameDraft.players.map(renderPlayer)}
        </div>
        <div className={Styles.bottomBar}>
            <Button onClick={handleNext}>{t('Next')}</Button>
        </div>
        <MissionInfoModal mission={info?.mission} kind={info?.kind} onClose={() => setInfo(null)} />
    </div>
}

export default GameMission
