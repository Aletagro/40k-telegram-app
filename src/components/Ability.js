import React from 'react'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Constants from '../Constants'
import {replaceAsterisks, removeAsterisks} from '../utilities/utils'

import includes from 'lodash/includes'
import startCase from 'lodash/startCase'

import Styles from './styles/Ability.module.css'

const Ability = ({ability, keyword, onClick, isEnchancement}) => {

    const borderColor = ability.isPsychic
        ? '#323282'
        : ability.isAura || includes(ability.name, '(Aura)')  || ability.key === 'opponentsTurn'
            ? '#962424'
            : ability.isBondsman || ability.key === 'eitherPlayer'
                ? '#166a25'
                : isEnchancement || ability.key === 'yourTurn'
                    ? '#184b72'
                    : 'black'

    const handlleClick = () => {
        if (onClick) {
            onClick(ability)
        } else {
            const abilityText = `${ability.name}
${ability.cpCost ? `\nCP Cost: ${ability.cpCost}` : ''}${ability.invul ? `\nInvulnerable Save: ${ability.invul}` : ''}\n${ability.rules ? `\nRule: ${removeAsterisks(ability.rules)}` : ''}
`
            navigator.clipboard.writeText(abilityText)
            toast.success('Ability Copied', Constants.toastParams)
        }
    }

    return <>
        <button id={Styles.ability} onClick={handlleClick} style={{border: `1px solid ${borderColor}`}}>
            <div id={ability.name ? Styles.header : Styles.onlyHeader} style={{background: borderColor}}>
                <b id={Styles.headerText}>{ability.name}</b>
                {ability.basePointsCost ? <b id={Styles.cpCost}>{ability.basePointsCost}&nbsp;Pts</b> : null}
                {ability.cpCost ? <b id={Styles.cpCost}>{ability.cpCost}&nbsp;CP</b> : null}
                {ability.invul
                    ? <div id={Styles.invulContainer}>
                        <p id={Styles.invul}>{ability.invul}</p>
                    </div>
                    : null
                }
            </div>
            {ability.category
                ? <div id={Styles.container}>
                    <p id={Styles.text}>{startCase(ability.category)}</p>
                </div>
                : null
            }
            {ability.whenRules
                ? <div id={Styles.container}>
                    <p id={Styles.text}><b>When:</b> {replaceAsterisks(ability.whenRules)}</p>
                </div>
                : null
            }
            {ability.targetRules
                ? <div id={Styles.container}>
                    <p id={Styles.text}><b>Target:</b> {replaceAsterisks(ability.targetRules)}</p>
                </div>
                : null
            }
            {ability.effectRules
                ? <div id={Styles.container}>
                    <p id={Styles.text}><b>Effect:</b> {replaceAsterisks(ability.effectRules)}</p>
                </div>
                : null
            }
            {ability.rules
                ? <div id={Styles.container}>
                    <p id={Styles.text}>{replaceAsterisks(ability.rules)}</p>
                </div>
                : null
            }
            {keyword
                ? <p id={Styles.keyword}><b>Keyword:</b> {keyword}</p>
                : null
            }
        </button>
        <ToastContainer />
    </>
}

export default Ability