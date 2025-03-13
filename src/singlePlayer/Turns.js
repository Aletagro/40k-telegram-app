import React from 'react'
import {singlePlayer} from '../utilities/appState'
import Turn from './Turn'

const Turns = ({round, onUpdate}) => {
    const roundCount = singlePlayer.rounds.length
    const array = Array.from(Array(roundCount).keys()).reverse()

    const renderTurn = (count) => <Turn key={count} round={count + 1} onUpdate={onUpdate} />

    return array.map(renderTurn)
}

export default Turns