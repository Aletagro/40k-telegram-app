import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Button from '../components/Button'
import {gameDraft} from '../utilities/appState'
import {getArmyFactionName, getArmyDetachmentNames, getArmyForceDispositionName, hasChosenBothArmies} from './gameSetup'
import {MODE_COMBAT_PATROL} from './missionData'

import find from 'lodash/find'

import Styles from './styles/Dashboard.module.css'

const dataBase = require('../utilities/db')

// Шаг 1: армии обоих игроков
const GameArmies = () => {
    const navigate = useNavigate()
    const [, setVersion] = useState(0)

    const setName = (index, name) => {
        gameDraft.players[index].name = name
        setVersion(v => v + 1)
    }

    const renderPlayer = (player, index) => {
        const army = player.army
        const faction = find(dataBase.data.faction_keyword, ['id', army?.factionId])
        const image = faction?.moreInfoImage || faction?.armySelectionImage
        const details = army ? [...getArmyDetachmentNames(army), getArmyForceDispositionName(army)].filter(Boolean).join(' · ') : ''
        return <div className={Styles.armyCard} key={index}>
            {image ? <img className={Styles.armyImage} src={image} alt='' /> : null}
            {image ? <span className={Styles.armyShade} /> : null}
            <div className={Styles.armyContent}>
                <h3 className={Styles.cardTitle}>{t('Player {{number}}', {number: index + 1})}</h3>
                <input className={Styles.input} value={player.name} placeholder={t('Player name')} onChange={event => setName(index, event.target.value)} />
                {army
                    ? <>
                        <p className={Styles.armyName}>{army.name || getArmyFactionName(army)}</p>
                        <p className={Styles.armyDetails}>{[getArmyFactionName(army), details].filter(Boolean).join(' · ')}</p>
                        {army.ownerName ? <p className={Styles.armyOwner}>{army.ownerName}</p> : null}
                    </>
                    : <p className={Styles.muted}>{t('Army is not chosen')}</p>}
                <Button type='secondary' onClick={() => navigate('/gameChooseArmy', {state: {title: t('Army'), index}})}>
                    {army ? t('Change army') : t('Choose army')}
                </Button>
            </div>
        </div>
    }

    if (!gameDraft.players.length) {
        return <div className={Styles.page}><p className={Styles.muted}>{t('Choose a mode on the previous screen')}</p></div>
    }

    return <div className={Styles.page}>
        <p className={Styles.muted}>{gameDraft.mode === MODE_COMBAT_PATROL ? t('Choose a Combat Patrol for each player') : t('Choose the army of each player')}</p>
        <div className={Styles.stack}>{gameDraft.players.map(renderPlayer)}</div>
        <div className={Styles.bottomBar}>
            <Button disabled={!hasChosenBothArmies()} onClick={() => navigate('/gameMission', {state: {title: t('Mission')}})}>{t('Next')}</Button>
        </div>
    </div>
}

export default GameArmies
