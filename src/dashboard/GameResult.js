import {t} from '../utilities/i18n'
import React from 'react'
import {getPreset, getPresetLabel} from './gameSetup'
import {getTwists, MODE_COMBAT_PATROL} from './missionData'
import {MAX_ROUNDS} from './gameModel'

import map from 'lodash/map'
import find from 'lodash/find'
import range from 'lodash/range'
import compact from 'lodash/compact'

import Styles from './styles/GameScreen.module.css'

const dataBase = require('../utilities/db')

const SECONDARY_LABELS = {tactical: 'Tactical', fixed: 'Fixed'}

// Итоги партии: победитель, разбивка очков, очки по раундам и сведения о битве
const GameResult = ({game, result}) => {
    const [first, second] = result.players
    const rows = range(1, MAX_ROUNDS + 1).concat('end')
    const preset = getPreset(game.setup.presetId)
    const twist = find(getTwists(game.mode), ['id', game.setup.twistId])
    const missionName = (player) => find(dataBase.data.primary_mission, ['id', player.primaryMissionId])?.name
    const hasBattleReady = first.battleReady || second.battleReady

    const info = compact([
        [t('Mode'), game.mode === MODE_COMBAT_PATROL ? 'Combat Patrol' : t('Matched Play')],
        preset ? [t('Battlefield'), getPresetLabel(preset)] : null,
        twist ? [t('Twist'), twist.name] : null,
        ...map(game.players, player => [player.name, [missionName(player), player.secondary.mode !== 'none' ? t(SECONDARY_LABELS[player.secondary.mode]) : null].filter(Boolean).join(' · ')])
    ])

    return <div className={Styles.body}>
        <div className={`${Styles.card} ${Styles.result}`}>
            <h3 className={Styles.resultTitle}>{result.winner === null ? t('Draw') : t('{{name}} wins', {name: game.players[result.winner].name})}</h3>
            <p className={Styles.resultBig}>{first.total} : {second.total}</p>
            <p className={Styles.muted}>{new Date(game.updatedAt).toLocaleDateString()}</p>
        </div>
        <div className={Styles.card}>
            <h4 className={Styles.cardTitle}>{t('Score')}</h4>
            <table className={Styles.table}>
                <thead><tr><th /><th>{game.players[0].name}</th><th>{game.players[1].name}</th></tr></thead>
                <tbody>
                    <tr><td>{t('Primary mission')}</td><td>{first.primary}</td><td>{second.primary}</td></tr>
                    <tr><td>{t('Secondary missions')}</td><td>{first.secondary}</td><td>{second.secondary}</td></tr>
                    {hasBattleReady ? <tr><td>{t('Battle Ready')}</td><td>{first.battleReady}</td><td>{second.battleReady}</td></tr> : null}
                    <tr className={Styles.total}><td>{t('Total')}</td><td>{first.total}</td><td>{second.total}</td></tr>
                </tbody>
            </table>
        </div>
        <div className={Styles.card}>
            <h4 className={Styles.cardTitle}>{t('By rounds')}</h4>
            <table className={Styles.table}>
                <thead><tr><th /><th>{game.players[0].name}</th><th>{game.players[1].name}</th></tr></thead>
                <tbody>
                    {map(rows, round => {
                        const cells = map(result.players, total => find(total.rounds, ['round', round]))
                        return <tr key={round}>
                            <td>{round === 'end' ? t('End of battle') : t('Round {{round}}', {round})}</td>
                            {map(cells, (cell, index) => <td key={index}>{cell.primary + cell.secondary}{cell.secondary ? <small>{cell.primary} + {cell.secondary}</small> : null}</td>)}
                        </tr>
                    })}
                    <tr className={Styles.total}><td>{t('Total')}</td><td>{first.primary + first.secondary}</td><td>{second.primary + second.secondary}</td></tr>
                </tbody>
            </table>
        </div>
        <div className={Styles.card}>
            <h4 className={Styles.cardTitle}>{t('Battle')}</h4>
            {map(info, ([label, value]) => <div className={Styles.infoRow} key={label}><span>{label}</span><span>{value}</span></div>)}
        </div>
    </div>
}

export default GameResult
