import React from 'react'
import PlayerTurn from './PlayerTurn'
import {singlePlayer} from '../utilities/appState'
import {getNewRound} from '../utilities/utils'

import Styles from './styles/Turn.module.css'

const Turn = ({round, onUpdate}) => {

    const getUnderdogCP = (player) => singlePlayer.underdog === player ? 5 : 4

    const handleClickNextRound = () => {
        if (singlePlayer.currentRound === 5) {
            singlePlayer.gameOver = true
        } else {
            singlePlayer.underdog = singlePlayer.firstPlayer.vp < singlePlayer.secondPlayer.vp ? 'firstPlayer' : 'secondPlayer'
            singlePlayer.rounds.push(getNewRound(singlePlayer.battleplan))
            singlePlayer.currentRound = singlePlayer.currentRound + 1
            singlePlayer.firstPlayer.cp = getUnderdogCP('firstPlayer')
            singlePlayer.secondPlayer.cp = getUnderdogCP('secondPlayer')
        }
        onUpdate()
    }

    return <div>
        <p id={Styles.title}>Round {round}</p>
        <div id={Styles.roundContainer}>
            <PlayerTurn player='firstPlayer' round={round} onUpdate={onUpdate} />
            <PlayerTurn player='secondPlayer' round={round} onUpdate={onUpdate} />
        </div>
        {singlePlayer.currentRound === round
            ? <button id={Styles.bottomButton} onClick={handleClickNextRound}>{singlePlayer.currentRound === 5 ? 'Finish game' : 'Start Next Round'}</button>
            : null
        }
    </div>
}

export default Turn