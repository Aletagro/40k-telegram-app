import {t} from '../utilities/i18n'
import React, {useEffect, useRef, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'
import Constants from '../Constants'
import Button from '../components/Button'
import GameBanner from './GameBanner'
import GameScore from './GameScore'
import GameField from './GameField'
import {getGame, saveGame} from './gameStorage'
import {advanceTurn, undo, canUndo, spendCp, addOtherCp, canGainOtherCp, getTurnInfo, getResult, STATUS_FINISHED} from './gameModel'
import {getScoreLimits} from './missionData'

import Styles from './styles/GameScreen.module.css'

const TAB_SCORE = 'score'
const TAB_FIELD = 'field'

// Экран партии: баннер со счётом и CP, вкладки очков и поля боя, переход хода и отмена действия
const Game = () => {
    const navigate = useNavigate()
    const gameId = useLocation().state?.gameId
    const [game, setGame] = useState(() => getGame(gameId))
    const [tab, setTab] = useState(TAB_SCORE)

    // При смене хода: новый раунд (или конец битвы) - наверх экрана, другой игрок в том же раунде - к его блоку очков
    const turnIndex = game ? getTurnInfo(game).turnIndex : 0
    const previous = useRef(turnIndex)
    useEffect(() => {
        if (previous.current === turnIndex) return
        const round = (index) => index >= 10 ? 'end' : Math.floor(index / 2)
        const roundChanged = round(previous.current) !== round(turnIndex)
        previous.current = turnIndex
        if (roundChanged) {
            window.scrollTo({top: 0, behavior: 'smooth'})
        } else {
            setTimeout(() => document.getElementById('active-player-block')?.scrollIntoView({behavior: 'smooth', block: 'start'}), 60)
        }
    }, [turnIndex])

    if (!game) return <div className={Styles.page}><div className={Styles.body}><p className={Styles.muted}>{t('Battle not found')}</p></div></div>

    const limits = getScoreLimits(game.mode)
    const turn = getTurnInfo(game)
    const finished = game.status === STATUS_FINISHED

    // Применяет изменение к партии и сразу сохраняет её на устройстве
    const apply = (fn) => {
        setGame(current => {
            const next = fn(current)
            if (next !== current) saveGame(next)
            return next
        })
    }

    const handleSpendCp = (index) => apply(current => spendCp(current, index, 1, 'manual'))

    const handleGainCp = (index) => {
        if (!canGainOtherCp(game, index)) {
            toast.info(t('Only 1 extra CP per round besides the Core CP'), Constants.toastParams)
            return
        }
        apply(current => addOtherCp(current, index).game)
    }

    const result = finished ? getResult(game, limits) : null
    const nextLabel = turn.isEnd ? t('Finish battle') : turn.isLast ? t('To end of battle') : t('Next turn')

    const renderResult = () => <div className={`${Styles.card} ${Styles.result}`}>
        <h3 className={Styles.resultTitle}>{result.winner === null ? t('Draw') : t('{{name}} wins', {name: game.players[result.winner].name})}</h3>
        <p className={Styles.muted}>{result.players[0].total} : {result.players[1].total}</p>
    </div>

    return <div className={Styles.page}>
        <GameBanner game={game} limits={limits} onSpendCp={handleSpendCp} onGainCp={handleGainCp} canGainCp={(index) => canGainOtherCp(game, index)} />
        <div className={Styles.body}>
            {finished ? renderResult() : <p className={Styles.turnLine}>{turn.isEnd ? <b>{t('End of battle')}</b> : <>{t('Turn of')} <b>{game.players[turn.playerIndex].name}</b></>}</p>}
            <div className={Styles.tabs}>
                <button type='button' className={`${Styles.tab} ${tab === TAB_SCORE ? Styles.tabActive : ''}`} onClick={() => setTab(TAB_SCORE)}>{t('Score')}</button>
                <button type='button' className={`${Styles.tab} ${tab === TAB_FIELD ? Styles.tabActive : ''}`} onClick={() => setTab(TAB_FIELD)}>{t('Battlefield')}</button>
            </div>
            {tab === TAB_SCORE ? <GameScore key={turn.turnIndex} game={game} limits={limits} apply={apply} /> : <GameField game={game} />}
        </div>
        <div className={Styles.bottomBar}>
            <Button type='secondary' disabled={!canUndo(game)} onClick={() => apply(undo)}>{t('Undo')}</Button>
            <div className={Styles.grow}>
                {finished
                    ? <Button onClick={() => navigate('/dashboard', {replace: true, state: {title: t('Battle Dashboard')}})}>{t('Close')}</Button>
                    : <Button onClick={() => apply(current => advanceTurn(current))}>{nextLabel}</Button>}
            </div>
        </div>
    </div>
}

export default Game
