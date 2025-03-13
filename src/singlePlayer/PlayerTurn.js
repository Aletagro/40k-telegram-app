import React from 'react'
import {useNavigate} from 'react-router-dom'
import {singlePlayer} from '../utilities/appState'
import Checkbox from '../components/Checkbox'

import Styles from './styles/Turn.module.css'

const PlayerTurn = ({player, round, onUpdate}) => {
    const navigate = useNavigate()
    const roundNumber = round - 1
    const disabledButton = round !== singlePlayer.currentRound
    const maxForObjectives = singlePlayer.rounds[roundNumber][player].maxForObjectives

    const handleChooseTactics = (player) => () => {
        navigate('/chooseTactics', {state: {title: 'Choose Tactics', player, alliance: singlePlayer[player].alliance.name}})
    }

    const handleChangeParam = (param, index) => () => {
        const newScore = [...singlePlayer.rounds[roundNumber][player].score]
        newScore[index] = {...newScore[index], completed: !param.completed}
        singlePlayer.rounds[roundNumber][player].score = newScore
        let value = param.value
        if (param.completed) {
            if (maxForObjectives && param.id !== 'tactics') {
                singlePlayer.rounds[roundNumber][player].objectiveVp = singlePlayer.rounds[roundNumber][player].objectiveVp - value
                if ((singlePlayer.rounds[roundNumber][player].objectiveVp + value) > maxForObjectives) {
                    value = Math.max(0, maxForObjectives - singlePlayer.rounds[roundNumber][player].objectiveVp)
                }
            }
            singlePlayer[player].vp = singlePlayer[player].vp - value
            singlePlayer.rounds[roundNumber][player].vp = singlePlayer.rounds[roundNumber][player].vp - value
        } else {
            if (maxForObjectives && param.id !== 'tactics') {
                singlePlayer.rounds[roundNumber][player].objectiveVp = singlePlayer.rounds[roundNumber][player].objectiveVp + value
                if (singlePlayer.rounds[roundNumber][player].objectiveVp > maxForObjectives) {
                    value = Math.max(0, value - (singlePlayer.rounds[roundNumber][player].objectiveVp - maxForObjectives))
                }
            }
            singlePlayer[player].vp = singlePlayer[player].vp + value
            singlePlayer.rounds[roundNumber][player].vp = singlePlayer.rounds[roundNumber][player].vp + value
        }
        onUpdate()
    }

    const renderScoreParam = (param, index) => <div key={param.id} id={Styles.scoreParamContainer}>
        <p id={Styles.scoreParamTitle}>{param.title}</p>
        <Checkbox onClick={handleChangeParam(param, index)} checked={param.completed} />
    </div>

    return <div id={Styles.currentRoundSubContainer}>
        <p id={Styles.name}>{player === 'firstPlayer' ? '1st' : '2nd'} Player</p>
        <button id={disabledButton ? Styles.tacticsDisabledButton : Styles.tacticsButton} disabled={disabledButton} onClick={handleChooseTactics(player)}>
            {singlePlayer.rounds[roundNumber][player].tactics?.name || 'Choose Tactics'}
        </button>
        <div id={Styles.subContainer}>
            {singlePlayer.rounds[roundNumber][player].score.map(renderScoreParam)}
            <div id={Styles.separator} />
            <div id={Styles.scoreParamContainer}>
                <p>This turn VP</p>
                <p>{singlePlayer.rounds[roundNumber][player].vp} VP</p>
            </div>
            {singlePlayer.rounds[roundNumber][player].objectiveVp > maxForObjectives
                ? <p id={Styles.scoreParamContainer}>VP from objectives max 6</p>
                : null
            }
        </div>
    </div>
}

export default PlayerTurn