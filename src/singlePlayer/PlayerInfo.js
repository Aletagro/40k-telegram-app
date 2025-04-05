import React from 'react'
import {useNavigate} from 'react-router-dom'
import {singlePlayer} from '../utilities/appState'
import Minus from '../icons/minus.svg'
import Plus from '../icons/plus.svg'
import Book from '../icons/book.svg'

import Styles from './styles/PlayerInfo.module.css'

const PlayerInfo = ({player, onUpdate}) => {
    const navigate = useNavigate()

    const handleClickMinusCP = () => {
        singlePlayer[player].cp = singlePlayer[player].cp - 1
        onUpdate()
    }

    const handleClickPlusCP = () => {
        singlePlayer[player].cp = singlePlayer[player].cp + 1
        onUpdate()
    }

    const handleClickAllegiance = () => {
        if (singlePlayer[player].allegiance.id) {
            navigate('/army', {state: {factionId: singlePlayer[player].allegiance.id}})
        }
    }

    return <div id={Styles.container}>
        <button id={Styles.titleContainer} onClick={handleClickAllegiance}>
            <div>
                <p id={Styles.name}>{player === 'firstPlayer' ? '1st' : '2nd'} Player</p>
                <p id={Styles.army}>{singlePlayer[player].allegiance?.name}</p>
            </div>
            <div id={Styles.armyIcon}><img src={Book} alt="" /></div>
        </button>
        <div id={Styles.content}>
            <p id={Styles.text}>Score</p>
            <div id={Styles.scoreContainer}>
                <p id={Styles.scoreText}>{singlePlayer[player].vp}</p>
            </div>
            <p id={Styles.text}>Command Points</p>
            <div id={Styles.cpContainer}>
                <div>
                    <div id={Styles.cpSubContainer}>
                        <button id={Styles.cpIcon} onClick={handleClickMinusCP}><img src={Minus} alt="" /></button>
                        <p id={Styles.cp}>{singlePlayer[player].cp}</p>
                        <button id={Styles.cpIcon} onClick={handleClickPlusCP}><img src={Plus} alt="" /></button>
                    </div>
                    {singlePlayer.underdog === player ? <p id={Styles.underdog}>Underdog</p> : null}
                </div>
            </div>
        </div>
    </div>
}

export default PlayerInfo