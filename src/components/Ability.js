import {t} from '../utilities/i18n'
import React from 'react'
import {toast} from 'react-toastify'
import Constants from '../Constants'
import {replaceAsterisks, removeAsterisks} from '../utilities/utils'

import join from 'lodash/join'
import size from 'lodash/size'
import includes from 'lodash/includes'
import startCase from 'lodash/startCase'

import Styles from './styles/Ability.module.css'

// Тип способности задаёт цвет шапки и метку справа: аура, психика, бондсмен, боль, способность армии.
// kind можно передать явно (например, 'rule' для дополнительных правил и 'damaged' для сниженных характеристик)
const KIND_LABELS = {aura: 'Aura', psychic: 'Psychic', bondsman: 'Bondsman', pain: 'Pain', faction: 'Faction'}

const getKind = ({ability, isEnchancement, kind}) => {
    if (kind) {
        return kind
    }
    // Стратагемы: цвет по тому, чей это ход
    if (ability.key === 'yourTurn' || ability.key === 'opponentsTurn' || ability.key === 'eitherPlayer') {
        return ability.key
    }
    if (ability.isAura || includes(ability.nameEn || ability.name, '(Aura)')) {
        return 'aura'
    }
    if (ability.isPsychic) {
        return 'psychic'
    }
    if (ability.isBondsman) {
        return 'bondsman'
    }
    if (ability.isPain) {
        return 'pain'
    }
    if (ability.abilityType === 'faction' || ability.armyRuleId) {
        return 'faction'
    }
    if (isEnchancement) {
        return 'enhancement'
    }
    return 'default'
}

// Метки в шапке: у способности может быть сразу несколько признаков (например, аура и психика)
const getLabels = (ability) => [
    ability.isAura || includes(ability.nameEn || ability.name, '(Aura)') ? KIND_LABELS.aura : null,
    ability.isPsychic ? KIND_LABELS.psychic : null,
    ability.isBondsman ? KIND_LABELS.bondsman : null,
    ability.isPain ? KIND_LABELS.pain : null,
    ability.abilityType === 'faction' || ability.armyRuleId ? KIND_LABELS.faction : null
].filter(Boolean)

const Ability = ({ability, keyword, phases, onClick, isEnchancement, kind: kindProp}) => {
    const kind = getKind({ability, isEnchancement, kind: kindProp})
    const labels = getLabels(ability)

    const handlleClick = () => {
        if (onClick) {
            onClick(ability)
        } else {
            const abilityText = `${ability.name}
${ability.cpCost ? `\nCP Cost: ${ability.cpCost}` : ''}${ability.invul ? `\nInvulnerable Save: ${ability.invul}` : ''}\n${ability.rules ? `\nRule: ${removeAsterisks(ability.rules)}` : ''}
`
            navigator.clipboard.writeText(abilityText)
            toast.success(t('Ability Copied'), Constants.toastParams)
        }
    }

    return <>
        <button type='button' className={`${Styles.ability} ${Styles[kind]}`} onClick={handlleClick}>
            <div className={ability.name ? Styles.header : Styles.onlyHeader}>
                <b className={Styles.headerText}>{ability.name}</b>
                <div className={Styles.badges}>
                    {labels.map(label => <span key={label} className={Styles.badge}>{label}</span>)}
                    {ability.basePointsCost ? <b className={Styles.badge}>{ability.basePointsCost}&nbsp;Pts</b> : null}
                    {ability.cpCost ? <b className={Styles.badge}>{ability.cpCost}&nbsp;CP</b> : null}
                    {ability.invul ? <span className={Styles.invul}>{ability.invul}</span> : null}
                </div>
            </div>
            {ability.category || size(phases)
                ? <p className={Styles.meta}>{[startCase(ability.category), size(phases) ? `${join(phases, ', ')} phase` : ''].filter(Boolean).join(' · ')}</p>
                : null
            }
            {ability.whenRules ? <p className={Styles.text}><b>{t('When:')}</b> {replaceAsterisks(ability.whenRules)}</p> : null}
            {ability.targetRules ? <p className={Styles.text}><b>{t('Target:')}</b> {replaceAsterisks(ability.targetRules)}</p> : null}
            {ability.effectRules ? <p className={Styles.text}><b>{t('Effect:')}</b> {replaceAsterisks(ability.effectRules)}</p> : null}
            {ability.restrictionRules ? <p className={Styles.text}><b>{t('Restrictions:')}</b> {replaceAsterisks(ability.restrictionRules)}</p> : null}
            {ability.secondaryEffect
                ? <p className={Styles.text}><b>Secondary effect{ability.secondaryEffectAdditionalCPCost ? ` (+${ability.secondaryEffectAdditionalCPCost}CP)` : ''}:</b> {replaceAsterisks(ability.secondaryEffect)}</p>
                : null
            }
            {ability.rules ? <p className={Styles.text}>{replaceAsterisks(ability.rules)}</p> : null}
            {keyword ? <p className={Styles.keyword}><b>{t('Keyword:')}</b> {keyword}</p> : null}
        </button>
    </>
}

export default Ability
