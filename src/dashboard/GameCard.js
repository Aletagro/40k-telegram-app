import {t} from '../utilities/i18n'
import React from 'react'
import {useNavigate} from 'react-router-dom'
import {getTurnInfo, getResult, STATUS_FINISHED} from './gameModel'
import {MODE_COMBAT_PATROL, getScoreLimits} from './missionData'

import map from 'lodash/map'
import find from 'lodash/find'

import Styles from './styles/Dashboard.module.css'

const dataBase = require('../utilities/db')

const getImage = (player) => {
    const faction = find(dataBase.data.faction_keyword, ['id', player.army?.factionId])
    return faction?.moreInfoImage || faction?.armySelectionImage
}

// Карточка партии для списков дашборда: армии, счёт, режим, ход или победитель и дата
const GameCard = ({game, onDelete}) => {
    const navigate = useNavigate()
    const result = getResult(game, getScoreLimits(game.mode))
    const score = result.players
    let progress
    if (game.status === STATUS_FINISHED) {
        progress = result.winner === null ? t('Draw') : t('{{name}} wins', {name: game.players[result.winner].name})
    } else {
        const turn = getTurnInfo(game)
        progress = turn.isEnd ? t('End of battle') : t('Round {{round}} of {{max}}', {round: turn.round, max: 5})
    }
    return <div className={Styles.gameCard}>
        <button type='button' className={Styles.gameButton} onClick={() => navigate('/game', {state: {title: t('Battle'), gameId: game.id}})}>
            <span className={Styles.gameImages}>
                {map(game.players, (player, index) => <span className={Styles.gameHalf} key={index}>
                    {getImage(player) ? <img className={Styles.gameImage} src={getImage(player)} alt='' loading='lazy' /> : null}
                    <span className={Styles.gameShade} />
                    <span className={Styles.gameName}>{player.name}</span>
                    <span className={Styles.gameArmy}>{player.army?.name}</span>
                </span>)}
                <span className={Styles.gameScore}>{score[0].total} : {score[1].total}</span>
            </span>
            <span className={Styles.gameInfo}>
                <span>{game.mode === MODE_COMBAT_PATROL ? 'Combat Patrol' : t('Matched Play')} · {progress}</span>
                <span>{new Date(game.updatedAt).toLocaleDateString()}</span>
            </span>
        </button>
        <button type='button' className={Styles.gameDelete} onClick={() => onDelete(game)} aria-label={t('Delete battle')}>×</button>
    </div>
}

export default GameCard
