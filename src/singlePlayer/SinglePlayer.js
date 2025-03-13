import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {singlePlayer} from '../utilities/appState'
import Turns from './Turns'
import NewGame from './NewGame'
import PlayerInfo from './PlayerInfo'
import GameResult from './GameResult'
import Info from '../icons/info.svg'

import Styles from './styles/SinglePlayer.module.css'

const SinglePlayer = () => {
    const navigate = useNavigate()
    const [updateCount, setUpdateCount] = useState(0)
    
    const handleUpdate = () => {
        setUpdateCount(updateCount + 1)
    }

    const handleClickBattleplan = () => {
        navigate('/battleplan', {state: {battleplan: singlePlayer.battleplan, title: singlePlayer.battleplan.name}})
    }

    return singlePlayer.gameOver
        ? <GameResult onUpdate={handleUpdate} />
        : singlePlayer.gameStarted
            ? <div id='column' className='Chapter'>
                <button id={Styles.battleplan} onClick={handleClickBattleplan}>
                    <p>Battleplan: <b>{singlePlayer.battleplan.name}</b></p>
                    <img src={Info} alt="" />
                </button>
                <div id={Styles.infoContainer}>
                    <PlayerInfo player='firstPlayer' onUpdate={handleUpdate} />
                    <PlayerInfo player='secondPlayer' onUpdate={handleUpdate} />
                </div>
                <Turns round={singlePlayer.currentRound} onUpdate={handleUpdate} />
            </div>
            : <NewGame onUpdate={handleUpdate} />
}

export default SinglePlayer