import {t} from '../utilities/i18n'
import React from 'react'
import {getTurnInfo, getCp, getPlayerTotals, STATUS_FINISHED} from './gameModel'

import map from 'lodash/map'
import find from 'lodash/find'

import Styles from './styles/GameScreen.module.css'

const dataBase = require('../utilities/db')

// Баннер партии: две армии друг против друга, очки, CP, раунд. Ход игрока подчёркнут золотом
const GameBanner = ({game, limits, onSpendCp, onGainCp, canGainCp, winner = null}) => {
    const turn = getTurnInfo(game)
    const finished = game.status === STATUS_FINISHED

    const renderSide = (player, index) => {
        const faction = find(dataBase.data.faction_keyword, ['id', player.army?.factionId])
        const image = faction?.moreInfoImage || faction?.armySelectionImage
        const isActive = !finished && turn.playerIndex === index
        return <div className={`${Styles.side} ${isActive ? Styles.sideActive : ''} ${finished && winner === index ? Styles.sideWinner : ''}`} key={index}>
            {image ? <img className={Styles.sideImage} src={image} alt='' /> : null}
            <span className={Styles.sideShade} />
            <div className={Styles.sideContent}>
                {finished && winner === index ? <span className={Styles.winnerLabel}>{t('Winner')}</span> : null}
                <span className={Styles.sideName}>{player.name}</span>
                <span className={Styles.sideArmy}>{player.army?.name || faction?.name}</span>
                <span className={Styles.sideVp}>{getPlayerTotals(game, index, limits).total}</span>
                <span className={Styles.sideVpLabel}>{t('VP')}</span>
                <div className={Styles.cpRow}>
                    {finished ? null : <button type='button' className={Styles.cpButton} onClick={() => onSpendCp(index)} aria-label={t('Spend 1 CP')}>−</button>}
                    <span className={Styles.cpValue}>{getCp(game, index)} {t('CP')}</span>
                    {finished ? null : <button type='button' className={`${Styles.cpButton} ${canGainCp(index) ? '' : Styles.cpButtonDim}`} onClick={() => onGainCp(index)} aria-label={t('Gain 1 CP')}>+</button>}
                </div>
            </div>
        </div>
    }

    return <div className={Styles.banner}>
        <div className={Styles.status}>{finished ? t('Battle finished') : turn.isEnd ? t('End of battle') : t('Round {{round}} of {{max}}', {round: turn.round, max: 5})}</div>
        <div className={Styles.sides}>
            {map(game.players, renderSide)}
            <span className={Styles.vs}>{t('vs')}</span>
        </div>
    </div>
}

export default GameBanner
