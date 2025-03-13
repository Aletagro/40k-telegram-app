import React from 'react'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Constants from '../Constants'
import {replaceAsterisks, removeAsterisks} from '../utilities/utils'

import map from 'lodash/map'
import find from 'lodash/find'
import join from 'lodash/join'
import filter from 'lodash/filter'

import Styles from './styles/Ability.module.css'

const dataBase = require('../dataBase.json')

const Ability = ({ability, abilityKeywordsName, abilityIdName, isRegimentOfRenown, onClick}) => {
    const _abilityKeywordsName = abilityKeywordsName || 'warscroll_ability_keyword'
    const _abilityIdName = abilityIdName || 'warscrollAbilityId'
    const keywordsIds = map(filter(dataBase.data[_abilityKeywordsName], keyword => keyword[_abilityIdName] === ability.id), item => item.keywordId)
    const keywords = map(keywordsIds, keywordId => find(dataBase.data.keyword, keyword => keyword.id === keywordId))
    const keywordsLength = keywords.length
    const borderColor = Constants.abilitiesTypes[ability.phase]
    // У абилок, которые привязаны к Regiment Of Renown сложность каста приходит в cpCost
    const castingValue = ability.castingValue || (isRegimentOfRenown && ability.cpCost)

    const handlleClick = () => {
        if (onClick) {
            onClick(ability)
        } else {
            const abilityText = `${ability.name}
Phase: ${ability.phaseDetails}${ability.cpCost && !isRegimentOfRenown ? `\nCP Cost: ${ability.cpCost}` : ''}${castingValue ? `\nCasting Value: ${castingValue}` : ''}\n${ability.declare ? `\nDeclare: ${removeAsterisks(ability.declare)}` : ''}${ability.effect ? `\nEffect: ${removeAsterisks(ability.effect)}` : ''}
${keywords.length ? `Keywords: ${join(map(keywords, (keyword) => keyword.name), ', ')}` : ''}
`
            navigator.clipboard.writeText(abilityText)
            toast.success('Ability Copied', Constants.toastParams)
        }
    }

    const renderKeyword = (keyword, index) => <p id={Styles.keyword} key={keyword.id}>{keyword.name}{keywordsLength === index + 1 ? '' : ','}&nbsp;</p>

    return <>
        <button id={Styles.ability} onClick={handlleClick} style={{border: `1px solid ${borderColor}`}}>
            <div id={Styles.header} style={{background: borderColor}}>
                <b id={Styles.headerText}>{ability.phaseDetails}</b>
                {ability.cpCost && !isRegimentOfRenown ? <b id={Styles.cpCost}>{ability.cpCost}&nbsp;CP</b> : null}
                {castingValue
                    ? <div id={Styles.castingValueContainer}>
                        <p id={Styles.castingValue}>{isRegimentOfRenown ? ability.cpCost : ability.castingValue}</p>
                    </div>
                    : null
                }
            </div>
            <div id={Styles.container}>
                <h4 id={Styles.name}>{ability.name}</h4>
                {ability.declare ? <p id={Styles.text}><b>Declare:</b> {replaceAsterisks(ability.declare)}</p> : null}
                <p id={Styles.text}><b>Effect:</b> {replaceAsterisks(ability.effect)}</p>
                {ability.altText ? <p id={Styles.text}>{replaceAsterisks(ability.altText)}</p> : null}
                {keywordsLength
                    ? <div id={Styles.keywordsContainer}>
                        <b id={Styles.keyword}>Keywords:&nbsp;</b>
                        {map(keywords, renderKeyword)}
                    </div>
                    : null
                }
            </div>
        </button>
        <ToastContainer />
    </>
}

export default Ability