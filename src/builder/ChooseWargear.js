import {t} from '../utilities/i18n'
import React, {useReducer, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import {updateUnit, getCompositionModels} from '../utilities/rosterModel'
import {
    getUnitSlots, getSlotCounts, getSlotTotal, getChoiceMax, setChoiceCount, selectSingleChoice, canSelectSingleChoice,
    getSlotLimitInfo, getSlotRules, getLoadoutChanges
} from '../utilities/wargearModel'
import Button from '../components/Button'
import Modal from '../components/Modal'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'

import Styles from './styles/ChooseWargear.module.css'

// "1-4 models: 1", "5-9 models: 1", "10+ models: 2"
const formatTiers = (tiers) => map(tiers, ({modelCount, choiceLimit}, index) => {
    const next = tiers[index + 1]
    const start = modelCount || 1
    const range = next ? `${start}-${next.modelCount - 1}` : `${start}+`
    return `${range} models: ${choiceLimit}`
}).join(' · ')

// Выбор снаряжения отряда: по группам миниатюр, у каждого слота - список вариантов
const ChooseWargear = () => {
    const {uid} = useLocation().state
    const navigate = useNavigate()
    const [, forceUpdate] = useReducer((x) => x + 1, 0)
    const [infoSlot, setInfoSlot] = useState(null)
    const unit = find(roster.units, ['uid', uid])

    if (!unit) return <div id='column' className='Chapter'><p className={Styles.empty}>{t('Unit not found')}</p></div>

    const slots = getUnitSlots(unit)
    const models = getCompositionModels(unit.compositionId)
    const isChanged = size(getLoadoutChanges(unit)) > 0

    const apply = (loadouts) => {
        updateUnit(uid, {loadouts})
        forceUpdate()
    }

    const handleStep = (slot, choice, delta) => () => {
        const counts = getSlotCounts(unit, slot)
        apply(setChoiceCount(unit, slot, choice.id, (counts[choice.id] || 0) + delta))
    }

    const handleSelect = (slot, choice) => () => apply(selectSingleChoice(unit, slot, choice.id))

    const handleReset = () => apply({})

    const handleDone = () => navigate(-1)

    const handleCloseInfo = () => setInfoSlot(null)

    const renderRadioRow = (slot, choice, counts) => {
        const isSelected = counts[choice.id] > 0
        const isDisabled = !isSelected && !canSelectSingleChoice(unit, slot, choice.id)
        return <button
            key={choice.id}
            type='button'
            disabled={isDisabled}
            className={`${Styles.option} ${isSelected ? Styles.selected : ''}`}
            onClick={handleSelect(slot, choice)}
        >
            <span className={Styles.radio} />
            <span className={Styles.label}>{choice.label}</span>
        </button>
    }

    const renderStepperRow = (slot, choice, counts) => {
        const value = counts[choice.id] || 0
        const isDefault = choice.id === slot.defaultId
        return <div key={choice.id} className={`${Styles.stepperRow} ${value > 0 ? Styles.selected : ''}`}>
            <span className={Styles.label}>{choice.label}{isDefault ? <span className={Styles.tag}>{t('Default')}</span> : null}</span>
            {isDefault
                ? <span className={Styles.count}>{value}</span>
                : <span className={Styles.controls}>
                    <button type='button' className={Styles.stepButton} disabled={value <= 0} onClick={handleStep(slot, choice, -1)}>-</button>
                    <span className={Styles.count}>{value}</span>
                    <button type='button' className={Styles.stepButton} disabled={value >= getChoiceMax(unit, slot, choice.id)} onClick={handleStep(slot, choice, 1)}>+</button>
                </span>
            }
        </div>
    }

    const renderSlot = (slot) => {
        const counts = getSlotCounts(unit, slot)
        const total = getSlotTotal(unit, slot)
        const defaultChoice = find(slot.choices, ['id', slot.defaultId])
        const hasLimits = size(getSlotLimitInfo(unit, slot)) > 0
        return <div key={slot.id} className={Styles.slot}>
            <div className={Styles.slotHead}>
                <p className={Styles.slotTitle}>{defaultChoice?.isEmpty ? t('Optional') : t('Default: {{name}}', {name: defaultChoice?.label})}</p>
                {hasLimits
                    ? <button type='button' className={Styles.infoButton} onClick={() => setInfoSlot(slot)} aria-label={t('Limits')}>i</button>
                    : null
                }
            </div>
            {map(slot.choices, choice => total === 1 ? renderRadioRow(slot, choice, counts) : renderStepperRow(slot, choice, counts))}
        </div>
    }

    const renderGroup = (title, groupSlots, key) => size(groupSlots)
        ? <div key={key} className={Styles.group}>
            <h4 className={Styles.groupTitle}>{title}</h4>
            {map(groupSlots, renderSlot)}
        </div>
        : null

    const groups = []
    forEach(models, ({miniature}) => {
        const groupSlots = filter(slots, ['key', miniature.id])
        if (size(groupSlots)) groups.push(renderGroup(`${miniature.name} · ${getSlotTotal(unit, groupSlots[0])}`, groupSlots, miniature.id))
    })
    groups.push(renderGroup(t('Whole unit'), filter(slots, 'isUnitLevel'), 'unit'))

    const renderRule = ({choice, isDefault, limits}) => <div key={choice.id} className={Styles.rule}>
        <p className={Styles.ruleNames}>{choice.label}</p>
        {isDefault
            ? <p>{t('Default: taken by all models that do not choose another option')}</p>
            : size(limits)
                ? map(limits, (limit, index) => <div key={index}>
                    <p>Up to {limit.allowed} now ({limit.used} taken)</p>
                    <p className={Styles.ruleNow}>{formatTiers(limit.tiers)}{limit.duplicateLimit ? ` · same option up to ${limit.duplicateLimit}` : ''}</p>
                    {size(limit.sharedWith) ? <p className={Styles.ruleNow}>Limit is shared with: {limit.sharedWith.join(', ')}</p> : null}
                </div>)
                : <p>{t('No limit: any number of models')}</p>
        }
    </div>

    const renderInfo = () => {
        if (!infoSlot) return null
        return <div className={Styles.infoContent}>
            {map(getSlotRules(unit, infoSlot), renderRule)}
            <p className={Styles.hint}>Limits depend on the size of the unit: {getSlotLimitInfo(unit, infoSlot)[0]?.totalModels} models now.</p>
        </div>
    }

    return <div id='column' className='Chapter'>
        {size(slots)
            ? <>
                <div className={Styles.topBar}>
                    <button type='button' className={Styles.resetButton} disabled={!isChanged} onClick={handleReset}>{t('Reset to default')}</button>
                </div>
                {groups}
                <div className={Styles.doneBar}><Button className={Styles.done} onClick={handleDone}>{t('Done')}</Button></div>
            </>
            : <p className={Styles.empty}>{t('This unit has no wargear options')}</p>
        }
        <Modal visible={Boolean(infoSlot)} title={t('Options')} onClose={handleCloseInfo}>{renderInfo()}</Modal>
    </div>
}

export default ChooseWargear
