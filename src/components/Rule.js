import {t} from '../utilities/i18n'
import React from 'react'
import {toast} from 'react-toastify'
import Constants from '../Constants'
import {SectionTitle} from './ListCard'
import {replaceAsterisks, removeAsterisks} from '../utilities/utils'

import map from 'lodash/map'
import filter from 'lodash/filter'

import Styles from './styles/Rule.module.css'

const dataBase = require('../utilities/db')

// Один блок правил: текст, заголовок, цитата, раскрывающийся блок и т.д. По нажатию текст копируется
const Rule = ({rule}) => {

    const handleClickRule = () => {
        if (rule.textContent) {
            navigator.clipboard.writeText(removeAsterisks(rule.textContent))
            toast.success(t('Rule Copied'), Constants.toastParams)
        }
    }

    const renderBullet = (bullet) => <li key={bullet.id}>{replaceAsterisks(bullet.text)}</li>

    const renderContent = () => {
        switch (rule.type) {
            case 'text':
                return <p className={Styles.text}>{replaceAsterisks(rule.textContent)}</p>
            case 'header':
            case 'textBold':
                return <p className={Styles.header}>{replaceAsterisks(rule.textContent)}</p>
            case 'textItalic':
            case 'loreAccordion':
                return null // лор не показываем
            case 'boxedText':
            case 'quote':
                return <p className={Styles.quote}>{replaceAsterisks(rule.textContent)}</p>
            case 'accordion':
                return <div className={Styles.box}>
                    {rule.title ? <p className={Styles.boxTitle}>{rule.title}</p> : null}
                    <p className={Styles.boxText}>{replaceAsterisks(rule.textContent)}</p>
                </div>
            case 'triggerEffectAccordion':
                return <div className={Styles.box}>
                    {rule.title ? <p className={Styles.boxTitle}>{rule.title}</p> : null}
                    {rule.trigger ? <p className={Styles.boxText}><b>{t('Trigger:')}</b> {replaceAsterisks(rule.trigger)}</p> : null}
                    {rule.effect ? <p className={Styles.boxText}><b>{t('Effect:')}</b> {replaceAsterisks(rule.effect)}</p> : null}
                </div>
            case 'image':
                return rule.imageUrl ? <img className={Styles.image} src={rule.imageUrl} alt={rule.altText || ''} loading='lazy' /> : null
            case 'bullets':
                const bullets = filter(dataBase.data.bullet_point, (point) => point.ruleContainerComponentId === rule.id)
                bullets.sort((a, b) => a.displayOrder - b.displayOrder)
                return <ul className={Styles.bullets}>{map(bullets, renderBullet)}</ul>
            default:
                return null
        }
    }

    return <div className={Styles.rule} onClick={handleClickRule}>
        {renderContent()}
    </div>
}

// Карточка с блоками правил и заголовком раздела над ней
export const RuleCard = ({title, rules}) => <>
    {title ? <SectionTitle>{title}</SectionTitle> : null}
    <div className={Styles.card}>
        {map(rules, rule => <Rule key={rule.id} rule={rule} />)}
    </div>
</>

const BEHAVIOUR_FIELDS = [
    ['eligibleIf', 'Eligible if'],
    ['maximumDistance', 'Maximum distance'],
    ['setupDistance', 'Setup distance'],
    ['beforeMoving', 'Before moving'],
    ['whileMoving', 'While moving'],
    ['afterMoving', 'After moving'],
    ['beforeShooting', 'Before shooting'],
    ['afterShooting', 'After shooting'],
    ['beforeFighting', 'Before fighting'],
    ['whileFighting', 'While fighting'],
    ['afterFighting', 'After fighting'],
    ['effect', 'Effect']
]

// Карточка типа поведения (Normal Shooting, Surge Move и т.д.)
export const BehaviourCard = ({behaviour}) => <div className={Styles.card}>
    {map(BEHAVIOUR_FIELDS, ([key, label]) => behaviour[key]
        ? <div key={key} className={Styles.rule}>
            <p className={Styles.header}>{label}</p>
            <div className={Styles.text}>{replaceAsterisks(behaviour[key])}</div>
        </div>
        : null
    )}
</div>

export default Rule
