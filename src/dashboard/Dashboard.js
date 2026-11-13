import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import ImageCard from '../components/ImageCard'
import Modal from '../components/Modal'
import Button from '../components/Button'
import {resetGameDraft} from './gameSetup'
import {loadGames, deleteGame} from './gameStorage'
import {getTurnInfo, getResult, STATUS_PLAYING} from './gameModel'
import {MODE_STANDARD, MODE_COMBAT_PATROL, getScoreLimits} from './missionData'
import spaceMarine from '../images/spaceMarine.jpeg'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'

import Styles from './styles/Dashboard.module.css'

const dataBase = require('../utilities/db')

const COMBAT_PATROL_IMAGE = 'https://d3ocysny7bghv8.cloudfront.net/32b1eeca-ff43-4747-baba-b51d308504d8'

const getImage = (player) => {
    const faction = find(dataBase.data.faction_keyword, ['id', player.army?.factionId])
    return faction?.moreInfoImage || faction?.armySelectionImage
}

// Вход в дашборд: выбор режима новой партии и все недоигранные партии
const Dashboard = () => {
    const navigate = useNavigate()
    const [games, setGames] = useState(() => filter(loadGames(), ['status', STATUS_PLAYING]))
    const [toDelete, setToDelete] = useState(null)

    const start = (mode, title) => () => {
        resetGameDraft(mode)
        navigate('/gameArmies', {state: {title}})
    }

    const handleDelete = () => {
        deleteGame(toDelete.id)
        setGames(current => filter(current, game => game.id !== toDelete.id))
        setToDelete(null)
    }

    const renderGame = (game) => {
        const turn = getTurnInfo(game)
        const score = getResult(game, getScoreLimits(game.mode)).players
        const progress = turn.isEnd ? t('End of battle') : t('Round {{round}} of {{max}}', {round: turn.round, max: 5})
        return <div className={Styles.gameCard} key={game.id}>
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
            <button type='button' className={Styles.gameDelete} onClick={() => setToDelete(game)} aria-label={t('Delete battle')}>×</button>
        </div>
    }

    return <div className={Styles.page}>
        <ImageCard size='lg' title='Warhammer 40,000' subtitle={t('Matched Play')} image={spaceMarine} onClick={start(MODE_STANDARD, 'Warhammer 40,000')} />
        <ImageCard size='lg' title='Combat Patrol' subtitle={t('Quick action')} image={COMBAT_PATROL_IMAGE} onClick={start(MODE_COMBAT_PATROL, 'Combat Patrol')} />
        {games.length ? <>
            <p className={Styles.sectionTitle}>{t('Unfinished battles')}</p>
            <div className={Styles.gap}>{map(games, renderGame)}</div>
        </> : null}
        <Modal visible={Boolean(toDelete)} title={t('Delete battle?')} onClose={() => setToDelete(null)}>
            <p className={Styles.text}>{toDelete ? `${toDelete.players[0].name} ${t('vs')} ${toDelete.players[1].name}` : ''}</p>
            <div className={Styles.gap}>
                <Button type='danger' onClick={handleDelete}>{t('Delete')}</Button>
                <Button type='secondary' onClick={() => setToDelete(null)}>{t('Cancel')}</Button>
            </div>
        </Modal>
    </div>
}

export default Dashboard
