import {t} from '../utilities/i18n'
import React, {useEffect, useRef, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'
import Constants from '../Constants'
import Button from '../components/Button'
import GameBanner from './GameBanner'
import GameScore from './GameScore'
import GameSecondary from './GameSecondary'
import PickCardsModal from './PickCardsModal'
import GameField from './GameField'
import GameResult from './GameResult'
import GameRosters from './GameRosters'
import {getGame, saveGame} from './gameStorage'
import {advanceTurn, undo, canUndo, spendCp, addOtherCp, canGainOtherCp, getTurnInfo, getResult, STATUS_FINISHED} from './gameModel'
import {getScoreLimits} from './missionData'

import Styles from './styles/GameScreen.module.css'

const TAB_SCORE = 'score'
const TAB_SECONDARY = 'secondary'
const TAB_FIELD = 'field'

// Экран партии: баннер со счётом и CP, вкладки очков и поля боя, переход хода и отмена действия
const Game = () => {
    const navigate = useNavigate()
    const gameId = useLocation().state?.gameId
    const [game, setGame] = useState(() => getGame(gameId))
    const [tab, setTab] = useState(TAB_SCORE)
    const [dismissed, setDismissed] = useState('')

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

    // Игрок с физической колодой должен выбрать вытянутые карты: окно открывается само, пока выбор не сделан или не закрыт
    const pickerIndex = game.players.findIndex(player => player.secondary.pendingDraw > 0)
    const pickerKey = pickerIndex >= 0 ? `${pickerIndex}:${turn.turnIndex}:${game.players[pickerIndex].secondary.pendingDraw}:${game.players[pickerIndex].secondary.used.length}` : ''
    const pickerOpen = pickerIndex >= 0 && dismissed !== pickerKey
    const hasSecondary = game.players.some(player => player.secondary.mode !== 'none')
    const result = finished ? getResult(game, limits) : null
    const nextLabel = turn.isEnd ? t('Finish battle') : turn.isLast ? t('To end of battle') : t('Next turn')

    return <div className={Styles.page}>
        <GameBanner game={game} limits={limits} winner={result?.winner} onSpendCp={handleSpendCp} onGainCp={handleGainCp} canGainCp={(index) => canGainOtherCp(game, index)} />
        {finished ? <GameResult game={game} limits={limits} result={result} /> : <div className={Styles.body}>
            <p className={Styles.turnLine}>{turn.isEnd ? <b>{t('End of battle')}</b> : <>{t('Turn of')} <b>{game.players[turn.playerIndex].name}</b></>}</p>
            <div className={Styles.tabs}>
                <button type='button' className={`${Styles.tab} ${tab === TAB_SCORE ? Styles.tabActive : ''}`} onClick={() => setTab(TAB_SCORE)}>{t('Score')}</button>
                {hasSecondary ? <button type='button' className={`${Styles.tab} ${tab === TAB_SECONDARY ? Styles.tabActive : ''}`} onClick={() => setTab(TAB_SECONDARY)}>{t('Secondary')}</button> : null}
                <button type='button' className={`${Styles.tab} ${tab === TAB_FIELD ? Styles.tabActive : ''}`} onClick={() => setTab(TAB_FIELD)}>{t('Battlefield')}</button>
            </div>
            {tab === TAB_SCORE ? <GameScore key={turn.turnIndex} game={game} limits={limits} apply={apply} />
                : tab === TAB_SECONDARY ? <GameSecondary key={turn.turnIndex} game={game} limits={limits} apply={apply} onOpenPicker={() => setDismissed('')} />
                : <GameField game={game} />}
            <GameRosters game={game} />
        </div>}
        {pickerIndex >= 0 ? <PickCardsModal game={game} playerIndex={pickerIndex} open={pickerOpen} onClose={() => setDismissed(pickerKey)} apply={apply} /> : null}
        <div className={Styles.bottomBar}>
            <Button type='secondary' disabled={!canUndo(game)} onClick={() => apply(undo)}>{finished ? t('Reopen battle') : t('Undo')}</Button>
            <div className={Styles.grow}>
                {finished
                    ? <Button onClick={() => navigate('/dashboard', {replace: true, state: {title: t('Battle Dashboard')}})}>{t('Close')}</Button>
                    : <Button onClick={() => apply(current => advanceTurn(current))}>{nextLabel}</Button>}
            </div>
        </div>
    </div>
}

export default Game
