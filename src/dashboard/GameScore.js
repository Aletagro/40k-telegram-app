import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import {getTurnInfo, getPlayerTotals, getScoreCount, setScore, MAX_ROUNDS} from './gameModel'
import {getPrimaryMissionDetail, getRoundObjectives} from './missionData'
import {MissionInfoModal} from './MissionPick'
import {replaceAsterisks} from '../utilities/utils'

import map from 'lodash/map'
import filter from 'lodash/filter'
import range from 'lodash/range'
import find from 'lodash/find'
import includes from 'lodash/includes'
import without from 'lodash/without'

import Styles from './styles/GameScreen.module.css'

const dataBase = require('../utilities/db')

// Вкладка очков: каждый раунд отдельным сворачивающимся блоком (открыт текущий), внутри цели основной миссии обоих игроков
const GameScore = ({game, limits, apply}) => {
    const turn = getTurnInfo(game)
    const [open, setOpen] = useState([turn.round])
    const [info, setInfo] = useState(null)
    const totals = map(game.players, (item, index) => getPlayerTotals(game, index, limits))
    const ignored = totals[0].ignored + totals[1].ignored
    // Показываем начавшиеся раунды: сверху самый новый
    const lastRound = turn.isEnd ? MAX_ROUNDS : turn.round
    const rounds = [...(turn.isEnd ? ['end'] : []), ...range(lastRound, 0, -1)]
    const first = game.setup?.firstPlayer || 0

    const toggle = (round) => setOpen(current => includes(current, round) ? without(current, round) : [...current, round])

    const setCount = (playerIndex, round, objective, scoring, count) => {
        const exclusiveWith = scoring.isExclusive ? map(filter(objective.scorings, other => other.isExclusive && other.id !== scoring.id), 'id') : []
        apply(current => setScore(current, playerIndex, {round, kind: 'primary', source: scoring.id, count: Math.max(0, count), vp: scoring.vp, exclusiveWith}))
    }

    const renderScoring = (playerIndex, round, objective, scoring) => {
        const count = getScoreCount(game, playerIndex, {round, kind: 'primary', source: scoring.id})
        return <div className={Styles.scoreRow} key={scoring.id}>
            <p className={Styles.scoreText}><b>{t('{{count}} VP', {count: scoring.vp})}</b>{scoring.criteria ? <> - {replaceAsterisks(scoring.criteria)}</> : null}</p>
            {scoring.input === 'checkbox'
                ? <button type='button' className={`${Styles.check} ${count ? Styles.checkOn : ''}`} onClick={() => setCount(playerIndex, round, objective, scoring, count ? 0 : 1)} aria-label={t('Scored')}>{count ? '✓' : ''}</button>
                : <div className={Styles.stepper}>
                    <button type='button' className={Styles.stepButton} onClick={() => setCount(playerIndex, round, objective, scoring, count - 1)}>−</button>
                    <span className={Styles.stepValue}>{count}</span>
                    <button type='button' className={Styles.stepButton} onClick={() => setCount(playerIndex, round, objective, scoring, count + 1)}>+</button>
                </div>}
        </div>
    }

    const renderPlayer = (playerIndex, round) => {
        const player = game.players[playerIndex]
        const detail = getPrimaryMissionDetail(player.primaryMissionId)
        const objectives = getRoundObjectives(detail, round)
        const isActive = round === turn.round && turn.playerIndex === playerIndex
        return <div className={`${Styles.playerBlock} ${isActive ? Styles.playerActive : ''}`} id={isActive ? 'active-player-block' : undefined} key={playerIndex}>
            <div className={Styles.playerHead}>
                <span className={Styles.playerName}>{player.name}</span>
                <button type='button' className={Styles.infoLink} onClick={() => setInfo({id: player.primaryMissionId, name: find(dataBase.data.primary_mission, ['id', player.primaryMissionId])?.name})}>
                    {find(dataBase.data.primary_mission, ['id', player.primaryMissionId])?.name} (i)
                </button>
            </div>
            {objectives.length ? map(objectives, objective => <div className={Styles.objective} key={objective.id}>
                <h4 className={Styles.objectiveTitle}>{objective.name}</h4>
                {objective.when ? <p className={Styles.when}>{replaceAsterisks(objective.when)}</p> : null}
                {map(objective.scorings, scoring => renderScoring(playerIndex, round, objective, scoring))}
            </div>) : <p className={Styles.muted}>{t('Nothing to score in this round')}</p>}
        </div>
    }

    const renderRound = (round) => {
        const isOpen = includes(open, round)
        const cells = map(totals, total => {
            const row = find(total.rounds, ['round', round])
            return row.primary + row.secondary
        })
        // В раунде первым идёт игрок, который ходит первым
        const order = round === 'end' ? [0, 1] : [first, 1 - first]
        return <div className={Styles.card} key={round}>
            <button type='button' className={Styles.roundHead} onClick={() => toggle(round)} aria-expanded={isOpen}>
                <span className={Styles.roundTitle}>{round === 'end' ? t('End of battle') : t('Round {{round}}', {round})}{round === turn.round ? ` · ${t('current')}` : ''}</span>
                <span className={Styles.roundScore}>{cells[0]} : {cells[1]}</span>
                <span className={`${Styles.chevron} ${isOpen ? Styles.chevronOpen : ''}`} aria-hidden='true' />
            </button>
            {isOpen ? map(order, playerIndex => renderPlayer(playerIndex, round)) : null}
        </div>
    }

    return <>
        {map(rounds, renderRound)}
        <div className={Styles.card}>
            <h4 className={Styles.cardTitle}>{t('Score')}</h4>
            <table className={Styles.table}>
                <thead><tr><th /><th>{game.players[0].name}</th><th>{game.players[1].name}</th></tr></thead>
                <tbody>
                    <tr><td>{t('Primary mission')}</td><td>{totals[0].primary}</td><td>{totals[1].primary}</td></tr>
                    <tr><td>{t('Secondary missions')}</td><td>{totals[0].secondary}</td><td>{totals[1].secondary}</td></tr>
                    {totals[0].battleReady || totals[1].battleReady ? <tr><td>{t('Battle Ready')}</td><td>{totals[0].battleReady}</td><td>{totals[1].battleReady}</td></tr> : null}
                    <tr className={Styles.total}><td>{t('Total')}</td><td>{totals[0].total}</td><td>{totals[1].total}</td></tr>
                </tbody>
            </table>
            {ignored ? <p className={Styles.note}>{t('{{count}} VP are over the limits and not counted', {count: ignored})}</p> : null}
        </div>
        <MissionInfoModal mission={info} kind='primary' onClose={() => setInfo(null)} />
    </>
}

export default GameScore
