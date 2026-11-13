import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import ImageCard from '../components/ImageCard'
import Modal from '../components/Modal'
import Button from '../components/Button'
import {resetGameDraft} from './gameSetup'
import {loadGames, deleteGame} from './gameStorage'
import GameCard from './GameCard'
import {STATUS_PLAYING, STATUS_FINISHED} from './gameModel'
import {MODE_STANDARD, MODE_COMBAT_PATROL} from './missionData'
import spaceMarine from '../images/spaceMarine.jpeg'

import map from 'lodash/map'
import filter from 'lodash/filter'

import Styles from './styles/Dashboard.module.css'

const COMBAT_PATROL_IMAGE = 'https://d3ocysny7bghv8.cloudfront.net/32b1eeca-ff43-4747-baba-b51d308504d8'

// Вход в дашборд: выбор режима новой партии и все недоигранные партии
const Dashboard = () => {
    const navigate = useNavigate()
    const [games, setGames] = useState(() => filter(loadGames(), ['status', STATUS_PLAYING]))
    const [toDelete, setToDelete] = useState(null)
    const finishedCount = filter(loadGames(), ['status', STATUS_FINISHED]).length

    const start = (mode, title) => () => {
        resetGameDraft(mode)
        navigate('/gameArmies', {state: {title}})
    }

    const handleDelete = () => {
        deleteGame(toDelete.id)
        setGames(current => filter(current, game => game.id !== toDelete.id))
        setToDelete(null)
    }

    return <div className={Styles.page}>
        <ImageCard size='lg' title='Warhammer 40,000' subtitle={t('Matched Play')} image={spaceMarine} onClick={start(MODE_STANDARD, 'Warhammer 40,000')} />
        <ImageCard size='lg' title='Combat Patrol' subtitle={t('Quick action')} image={COMBAT_PATROL_IMAGE} onClick={start(MODE_COMBAT_PATROL, 'Combat Patrol')} />
        <button type='button' className={Styles.historyLink} onClick={() => navigate('/gameHistory', {state: {title: t('History and statistics')}})}>
            <b>{t('History and statistics')}</b>
            <span className={Styles.historyCount}>{finishedCount ? t('{{count}} battle|{{count}} battles', {count: finishedCount}) : ''}</span>
        </button>
        {games.length ? <>
            <p className={Styles.sectionTitle}>{t('Unfinished battles')}</p>
            <div className={Styles.gap}>{map(games, game => <GameCard key={game.id} game={game} onDelete={setToDelete} />)}</div>
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
