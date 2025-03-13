import React from 'react'
import {singlePlayer} from '../utilities/appState'

import Styles from './styles/GameResult.module.css'

const GameResultPlayer = ({player, gameResult}) => {

    return <div id={Styles.content}>
        <div id={Styles.titleContainer}>
            <p id={Styles.title}>{player === 'firstPlayer' ? '1st' : '2nd'} Player's Army</p>
            <p id={Styles.playerArmy}>{singlePlayer[player].allegiance?.name}</p>
        </div>
        <p id={Styles.playerText}>Score</p>
        <div id={Styles.playerScoreContainer}>
            <p id={gameResult === 'WINNER' ? Styles.playerWinnerScoreText : Styles.playerScoreText}>{singlePlayer[player].vp}</p>
        </div>
        <p id={Styles.playerResult}>{gameResult}</p>
    </div>
}

export default GameResultPlayer