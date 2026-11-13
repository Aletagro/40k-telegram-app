import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import Modal from '../components/Modal'
import Button from '../components/Button'
import GameCard from './GameCard'
import {loadGames, deleteGame} from './gameStorage'
import {getStats, getFinishedGames} from './gameStats'
import {getFactionLabel} from '../utilities/utils'
import {MODE_STANDARD, MODE_COMBAT_PATROL} from './missionData'

import map from 'lodash/map'
import filter from 'lodash/filter'
import some from 'lodash/some'

import Styles from './styles/Dashboard.module.css'

const TAB_HISTORY = 'history'
const TAB_STATS = 'stats'
const ALL = 'all'

const getLabel = (key) => key ? getFactionLabel(key, t('Unknown army')) : t('Unknown army')

// История завершённых партий и статистика (я - первый игрок каждой партии)
const GameHistory = () => {
    const [games, setGames] = useState(() => loadGames())
    const [tab, setTab] = useState(TAB_HISTORY)
    const [toDelete, setToDelete] = useState(null)
    const [mode, setMode] = useState(ALL)
    const allFinished = getFinishedGames(games)
    // Фильтр режима показываем, только если в истории есть партии обоих режимов
    const hasFilter = some(allFinished, ['mode', MODE_STANDARD]) && some(allFinished, ['mode', MODE_COMBAT_PATROL])
    const activeMode = hasFilter ? mode : ALL
    const finished = activeMode === ALL ? allFinished : filter(allFinished, ['mode', activeMode])
    const stats = getStats(finished)

    const handleDelete = () => {
        deleteGame(toDelete.id)
        setGames(current => current.filter(game => game.id !== toDelete.id))
        setToDelete(null)
    }

    const renderGroups = (title, groups) => groups.length
        ? <div className={Styles.card}>
            <h4 className={Styles.cardTitle}>{title}</h4>
            <table className={Styles.statsTable}>
                <thead><tr><th /><th>{t('Battles')}</th><th>{t('Wins')}</th><th>{t('Draws')}</th><th>{t('Losses')}</th></tr></thead>
                <tbody>{map(groups, group => <tr key={group.key}>
                    <td>{getLabel(group.key)}</td><td>{group.games}</td><td>{group.wins}</td><td>{group.draws}</td><td>{group.losses}</td>
                </tr>)}</tbody>
            </table>
        </div>
        : null

    const renderStats = () => <div className={Styles.gap}>
        <div className={Styles.statsGrid}>
            {map([[t('Battles'), stats.total], [t('Win rate'), `${stats.winRate}%`], [t('Wins'), stats.wins], [t('Draws'), stats.draws], [t('Losses'), stats.losses]], ([label, value]) => <div className={Styles.statTile} key={label}>
                <span className={Styles.statValue}>{value}</span>
                <span className={Styles.statLabel}>{label}</span>
            </div>)}
            <div className={Styles.statTile}>
                <span className={Styles.statValue}>{stats.avgFor} : {stats.avgAgainst}</span>
                <span className={Styles.statLabel}>{t('Average VP')}</span>
            </div>
        </div>
        {renderGroups(t('By army'), stats.byArmy)}
        {renderGroups(t('Against'), stats.byOpponent)}
        <p className={Styles.muted}>{t('Statistics count the first player of each battle as you.')}</p>
    </div>

    return <div className={Styles.page}>
        <div className={Styles.tabs}>
            <button type='button' className={`${Styles.tab} ${tab === TAB_HISTORY ? Styles.tabActive : ''}`} onClick={() => setTab(TAB_HISTORY)}>{t('History')}</button>
            <button type='button' className={`${Styles.tab} ${tab === TAB_STATS ? Styles.tabActive : ''}`} onClick={() => setTab(TAB_STATS)}>{t('Statistics')}</button>
        </div>
        {hasFilter
            ? <div className={Styles.chips} style={{marginBottom: 12}}>
                {map([[ALL, t('All')], [MODE_STANDARD, t('Matched Play')], [MODE_COMBAT_PATROL, 'Combat Patrol']], ([value, label]) => <button
                    key={value}
                    type='button'
                    className={`${Styles.chip} ${activeMode === value ? Styles.chipActive : ''}`}
                    onClick={() => setMode(value)}
                >{label}</button>)}
            </div>
            : null
        }
        {!finished.length
            ? <p className={Styles.muted}>{t('No finished battles yet')}</p>
            : tab === TAB_HISTORY
                ? <div className={Styles.gap}>{map(finished, game => <GameCard key={game.id} game={game} onDelete={setToDelete} />)}</div>
                : renderStats()
        }
        <Modal visible={Boolean(toDelete)} title={t('Delete battle?')} onClose={() => setToDelete(null)}>
            <p className={Styles.text}>{toDelete ? `${toDelete.players[0].name} ${t('vs')} ${toDelete.players[1].name}` : ''}</p>
            <div className={Styles.gap}>
                <Button type='danger' onClick={handleDelete}>{t('Delete')}</Button>
                <Button type='secondary' onClick={() => setToDelete(null)}>{t('Cancel')}</Button>
            </div>
        </Modal>
    </div>
}

export default GameHistory
