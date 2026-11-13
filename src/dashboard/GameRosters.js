import {t} from '../utilities/i18n'
import React from 'react'
import {useNavigate} from 'react-router-dom'
import {getArmyFactionName} from './gameSetup'
import ImageCard from '../components/ImageCard'

import map from 'lodash/map'
import find from 'lodash/find'

import Styles from './styles/GameScreen.module.css'

const dataBase = require('../utilities/db')

// Ростеры игроков партии: только полные списки (сохранённые или по коду), у введённых вручную списка нет
const GameRosters = ({game}) => {
    const navigate = useNavigate()
    const items = []
    map(game.players, (player, index) => {
        if (player.army?.snapshot) items.push({player, index})
    })
    if (!items.length) return null

    return <div className={Styles.rosters}>
        <h3 className={Styles.rostersTitle}>{t('Army lists')}</h3>
        {map(items, ({player, index}) => {
            const faction = find(dataBase.data.faction_keyword, ['id', player.army.factionId])
            return <ImageCard
                key={index}
                title={player.army.name || getArmyFactionName(player.army)}
                subtitle={`${player.name} · ${getArmyFactionName(player.army)}`}
                image={faction?.moreInfoImage}
                onClick={() => navigate('/viewRoster', {state: {title: player.army.name || t('Army lists'), gameId: game.id, playerIndex: index}})}
            />
        })}
    </div>
}

export default GameRosters
