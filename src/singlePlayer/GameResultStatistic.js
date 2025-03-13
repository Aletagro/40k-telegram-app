import React from 'react'
import {singlePlayer} from '../utilities/appState'

import Styles from './styles/GameResult.module.css'

const GameResultStatistic = ({player}) => {

    const renderRound = (round, index) => <div id={Styles.statisticRound}>
        <p id={Styles.statisticText}>{index + 1} turn</p>
        <b id={Styles.tatisticText}>{round[player].vp}</b>
    </div>

    return <div id={Styles.content}>
        <div id={Styles.titleContainer}>
            <p id={Styles.title}>{player === 'firstPlayer' ? '1st' : '2nd'} Player VP</p>
        </div>
        {singlePlayer.rounds.map(renderRound)}
    </div>
}

export default GameResultStatistic