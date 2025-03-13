import React from 'react'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Constants from '../Constants'
import Ability from './Ability'
import {replaceAsterisks, removeAsterisks} from '../utilities/utils'

import map from 'lodash/map'
import filter from 'lodash/filter'

import Styles from './styles/Rule.module.css'

const dataBase = require('../dataBase.json')

const Rule = ({rule}) => {

    const handleClickRule = () => {
        if (rule.textContent) {
            navigator.clipboard.writeText(removeAsterisks(rule.textContent))
            toast.success('Rule Copied', Constants.toastParams)
        }
    }

    const renderAbility = (ability) => <Ability key={ability.id} ability={ability} abilityKeywordsName='ability_keyword' abilityIdName='abilityId' />

    const renderBullet = (bullet) => <p key={bullet.id}>&#8226; {replaceAsterisks(bullet.text)}</p>

    const renderContent = () => {
        switch (rule.contentType) {
            case 'text':
                return <p id={Styles.text} key={rule.id}>{replaceAsterisks(rule.textContent)}</p>
            case 'header':
            case 'textBold':
                return <b id={Styles.text} key={rule.id}>{replaceAsterisks(rule.textContent)}</b>
            case 'textItalic':
                return <p id={Styles.textItalic} key={rule.id}>{replaceAsterisks(rule.textContent)}</p>
            case 'boxedText':
                return <p id={Styles.lightgreyContainer} key={rule.id}>{replaceAsterisks(rule.textContent)}</p>
            case 'accordion':
                return <div id={Styles.lightgreyContainer} key={rule.id}>
                    <h4>{rule.title}</h4>
                    <p>{replaceAsterisks(rule.textContent)}</p>
                </div>
            case 'loreAccordion':
                    return <p id={Styles.textItalic} key={rule.id}>{replaceAsterisks(rule.textContent)}</p>
            case 'image':
                return <img src={rule.imageUrl} alt={rule.altText} width='100%' />
            case 'ability':
                const abilities = filter(dataBase.data.ability, (ability) => ability.id === rule.abilityId)
                return map(abilities, renderAbility)
            case 'bullets':
                const bullets = filter(dataBase.data.bullet_point, (point) => point.ruleContainerComponentId === rule.id)
                bullets.sort((a, b) => a.displayOrder - b.displayOrder)
                return <div id={Styles.lightgreyContainer}>
                    {map(bullets, renderBullet)}
                </div>
            default:
                return null
        }
    }

    return <button id={Styles.container} onClick={handleClickRule}>
        {renderContent()}
        <ToastContainer />
    </button>
}

export default Rule