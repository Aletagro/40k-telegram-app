import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Button from '../components/Button'
import {gameDraft} from '../utilities/appState'
import {getRecommendedPresets, getPresetLabel, getPreset, startGame} from './gameSetup'
import {MODE_STANDARD, getPresets, getTwists, getLayoutImage} from './missionData'
import {TwistInfoModal} from './MissionPick'

import map from 'lodash/map'
import sortBy from 'lodash/sortBy'

import Styles from './styles/Dashboard.module.css'

// Последний шаг перед игрой: поле боя, поворот (twist) и первый игрок
const GameBattlefield = () => {
    const navigate = useNavigate()
    const [, setVersion] = useState(0)
    const [showAll, setShowAll] = useState(false)
    const [info, setInfo] = useState(null)
    const [showError, setShowError] = useState(false)
    if (!gameDraft.players.length) return null

    const update = (fn) => () => { fn(); setVersion(v => v + 1) }
    const all = getPresets(gameDraft.mode)
    const recommended = getRecommendedPresets()
    // Когда рекомендованных столько же, сколько всех (Combat Patrol), переключатель не нужен
    const canToggle = recommended.length > 0 && recommended.length < all.length
    const presets = sortBy(showAll || !recommended.length ? all : recommended, getPresetLabel)
    const twists = gameDraft.mode === MODE_STANDARD ? getTwists(gameDraft.mode) : []
    const playerName = (index) => gameDraft.players[index].name || t('Player {{number}}', {number: index + 1})
    const chosen = getPreset(gameDraft.setup.presetId)

    const option = (label, active, onClick, key, onInfo) => <div className={`${Styles.mission} ${active ? Styles.missionActive : ''}`} key={key}>
        <button type='button' className={Styles.missionBody} onClick={onClick}>{label}</button>
        {onInfo ? <button type='button' className={Styles.missionInfo} onClick={onInfo} aria-label={t('Info')}>i</button> : null}
    </div>

    const presetOption = (preset) => {
        const image = getLayoutImage(preset.missionLayoutId)
        return <div className={`${Styles.mission} ${Styles.mapCard} ${gameDraft.setup.presetId === preset.id ? Styles.missionActive : ''}`} key={preset.id}>
            <button type='button' className={Styles.mapOption} onClick={update(() => { gameDraft.setup.presetId = preset.id })}>
                {image ? <img className={Styles.mapImage} src={image} alt='' loading='lazy' /> : null}
                <span className={Styles.mapTitle}>{getPresetLabel(preset)}</span>
            </button>
        </div>
    }

    const handleStart = () => {
        if (!gameDraft.setup.presetId) {
            setShowError(true)
            return
        }
        const game = startGame()
        navigate('/game', {replace: true, state: {title: t('Battle'), gameId: game.id}})
    }

    return <div className={Styles.page}>
        <div className={Styles.gap}>
            <p className={Styles.sectionTitle}>{t('Who goes first')}</p>
            <div className={Styles.pair}>
                {map(gameDraft.players, (player, index) => option(playerName(index), gameDraft.setup.firstPlayer === index, update(() => { gameDraft.setup.firstPlayer = index }), index))}
            </div>
            <Button type='secondary' onClick={update(() => { gameDraft.setup.firstPlayer = Math.random() < 0.5 ? 0 : 1 })}>{t('Roll off')}</Button>
        </div>
        <div className={`${Styles.gap} ${showError && !chosen ? Styles.cardError : ''}`}>
            <p className={Styles.sectionTitle}>{t('Battlefield')}</p>
            <p className={showError && !chosen ? Styles.errorText : Styles.muted}>{showError && !chosen ? t('Choose the battlefield') : canToggle && !showAll ? t('Recommended for these armies') : t('All layouts')}</p>
            {map(presets, presetOption)}
            {canToggle ? <Button type='secondary' onClick={() => setShowAll(!showAll)}>{showAll ? t('Show recommended') : t('Show all layouts')}</Button> : null}
        </div>
        {twists.length ? <div className={Styles.gap}>
            <p className={Styles.sectionTitle}>{t('Twist')}</p>
            {option(t('None'), !gameDraft.setup.twistId, update(() => { gameDraft.setup.twistId = null }), 'none')}
            {map(twists, twist => option(twist.name, gameDraft.setup.twistId === twist.id, update(() => { gameDraft.setup.twistId = twist.id }), twist.id, () => setInfo(twist)))}
        </div> : null}
        <div className={Styles.bottomBar}>
            <Button onClick={handleStart}>{t('Start battle')}</Button>
        </div>
        <TwistInfoModal twist={info} onClose={() => setInfo(null)} />
    </div>
}

export default GameBattlefield
