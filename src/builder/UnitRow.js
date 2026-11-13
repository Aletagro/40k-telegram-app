import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import {
    updateUnit, removeUnit, addUnit, createUnit, getUnitTotalPoints, getDatasheetType, isCharacterDatasheet,
    getUnitLimit, getUnitCount, getCompositions, getCompositionLabel, getCompositionModels, getModelCount, getAvailableEnhancements, getUnitAllegianceSelect
} from '../utilities/rosterModel'
import UnitStats, {getInvulSave} from '../components/UnitStats'
import {canShowAttach} from '../utilities/rosterValidation'
import {hasWargearOptions, getLoadoutChanges, sanitizeLoadouts, getUnitWargearPoints} from '../utilities/wargearModel'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import forEach from 'lodash/forEach'
import filter from 'lodash/filter'

import Styles from './styles/UnitRow.module.css'

const dataBase = require('../utilities/db')

const COMPOSITIONS_COLLAPSE_FROM = 3

const CopyIcon = () => <svg width='26' height='26' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <rect x='9' y='9' width='11' height='11' rx='2.5' /><path d='M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15' />
</svg>

const CloseIcon = () => <svg width='26' height='26' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' aria-hidden='true'>
    <path d='M6 6l12 12M18 6L6 18' />
</svg>

const LinkIcon = () => <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <path d='M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1' /><path d='M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1' />
</svg>

const ShieldIcon = () => <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinejoin='round' aria-hidden='true'>
    <path d='M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z' />
</svg>

// Картинка юнита; если не загрузилась, показываем пустую рамку, чтобы строки не прыгали
const UnitImage = ({src, alt}) => {
    const [failed, setFailed] = useState(false)
    return src && !failed
        ? <img className={Styles.image} src={src} alt={alt} loading='lazy' onError={() => setFailed(true)} />
        : <span className={`${Styles.image} ${Styles.noImage}`} aria-hidden='true' />
}

// Один юнит в ростере: название, состав, очки, выбор размера отряда, Warlord и энхансмент.
// Снаряжение выбирается на отдельном экране, здесь показывается только то, что отличается от набора по умолчанию
const UnitRow = ({unit, issues, onChange, onLocate, readOnly = false}) => {
    const navigate = useNavigate()
    const datasheet = find(dataBase.data.datasheet, ['id', unit.datasheetId])
    const type = getDatasheetType(unit.datasheetId)
    const isCharacter = isCharacterDatasheet(unit.datasheetId, unit)
    const compositions = getCompositions(unit.datasheetId)
    // Если вариантов состава много (больше трёх), по умолчанию показан только выбранный, остальные раскрываются по нажатию
    const [isCompositionsOpen, setIsCompositionsOpen] = useState(false)
    const isCollapsible = !readOnly && size(compositions) > COMPOSITIONS_COLLAPSE_FROM
    const enhancement = unit.enhancementId ? find(dataBase.data.enhancement, ['id', unit.enhancementId]) : null
    const hasEnhancements = type !== 'Epic Hero' && size(roster.detachmentIds) > 0 && (enhancement || size(getAvailableEnhancements(unit)) > 0)
    const total = getUnitTotalPoints(unit)
    // Цена выше базовой, если сработала ступень (3-я копия и далее)
    const isRaised = total - (enhancement?.basePointsCost || 0) - getUnitWargearPoints(unit) > (find(compositions, ['id', unit.compositionId])?.points || 0)
    const hasWargear = hasWargearOptions(unit.datasheetId)
    const loadoutChanges = hasWargear ? getLoadoutChanges(unit) : []
    const leadTarget = unit.attachedToUid ? find(roster.units, ['uid', unit.attachedToUid]) : null
    const leaders = filter(roster.units, ['attachedToUid', unit.uid])
    const canAttach = isCharacter && canShowAttach(unit)
    const canCopy = getUnitCount(unit.datasheetId) < getUnitLimit(unit.datasheetId)

    const change = (patch) => {
        updateUnit(unit.uid, patch)
        onChange()
    }

    const handleInfo = () => navigate('/datasheet', {state: {title: datasheet.name, unit: datasheet}})

    const handleCopy = () => {
        addUnit(createUnit(unit.datasheetId, {compositionId: unit.compositionId, modelCounts: unit.modelCounts, loadouts: unit.loadouts, alliedFactionId: unit.alliedFactionId}))
        onChange()
    }

    const handleDelete = () => {
        removeUnit(unit.uid)
        onChange()
    }

    const handleWarlord = () => {
        forEach(roster.units, item => {
            if (item.isWarlord) updateUnit(item.uid, {isWarlord: false})
        })
        if (!unit.isWarlord) updateUnit(unit.uid, {isWarlord: true})
        onChange()
    }

    const allegianceSelect = getUnitAllegianceSelect(unit)

    const handleAllegiance = () => navigate('/chooseUnitAllegiance', {state: {title: allegianceSelect.group.name, uid: unit.uid}})

    const handleWargear = () => navigate('/chooseWargear', {state: {title: 'Wargear', uid: unit.uid}})

    const handleAttach = () => navigate('/chooseAttach', {state: {title: t('Attach to'), uid: unit.uid}})

    const handleEnhancement = () => navigate('/chooseEnhancement', {state: {title: 'Enhancement', unit}})

    const handleComposition = (composition) => () => {
        setIsCompositionsOpen(false)
        if (composition.id !== unit.compositionId) change({compositionId: composition.id, modelCounts: {}, loadouts: {}})
    }

    const handleModelCount = (miniature, min, max, delta) => () => {
        const current = unit.modelCounts?.[miniature.id] || min
        const next = Math.min(max, Math.max(min, current + delta))
        const modelCounts = {...unit.modelCounts, [miniature.id]: next}
        // Меняется размер отряда: лишние выборы снаряжения снимаются
        change({modelCounts, loadouts: sanitizeLoadouts({...unit, modelCounts})})
    }

    const renderComposition = (composition) => {
        const isActive = composition.id === unit.compositionId
        // Выбранный вариант в сворачиваемом списке работает как заголовок: нажатие раскрывает или сворачивает остальные
        const onClick = isCollapsible && isActive ? () => setIsCompositionsOpen(!isCompositionsOpen) : handleComposition(composition)
        return <button
            key={composition.id}
            type='button'
            className={`${Styles.composition} ${isActive ? Styles.active : ''}`}
            style={readOnly ? {pointerEvents: 'none'} : undefined}
            onClick={onClick}
            aria-expanded={isCollapsible && isActive ? isCompositionsOpen : undefined}
        >
            <span>{getCompositionLabel(composition.id)}</span>
            <span className={Styles.compositionPoints}>
                {composition.points ? t('{{count}} pts', {count: composition.points}) : '-'}
                {isCollapsible && isActive ? <span className={`${Styles.compositionChevron} ${isCompositionsOpen ? Styles.compositionChevronOpen : ''}`} aria-hidden='true' /> : null}
            </span>
        </button>
    }

    const visibleCompositions = readOnly || (isCollapsible && !isCompositionsOpen) ? filter(compositions, ['id', unit.compositionId]) : compositions

    // Диапазон моделей (например 5-9) выбирается шагом +/-
    const renderRange = ({miniature, min, max}) => {
        if (min === max) return null
        const value = unit.modelCounts?.[miniature.id] || min
        if (readOnly) return <div key={miniature.id} className={Styles.stepper}><span>{miniature.name}</span><span className={Styles.count}>{value}</span></div>
        return <div key={miniature.id} className={Styles.stepper}>
            <span>{miniature.name}</span>
            <span className={Styles.stepperControls}>
                <button type='button' className={Styles.stepButton} disabled={value <= min} onClick={handleModelCount(miniature, min, max, -1)}>-</button>
                <span className={Styles.count}>{value}</span>
                <button type='button' className={Styles.stepButton} disabled={value >= max} onClick={handleModelCount(miniature, min, max, 1)}>+</button>
            </span>
        </div>
    }

    // Связь героя и отряда: маленькая картинка связанного юнита и его название
    const renderLink = (title, linked) => {
        const linkedSheet = find(dataBase.data.datasheet, ['id', linked.datasheetId])
        return <button key={`${title}${linked.uid}`} type='button' className={Styles.link} onClick={() => onLocate && onLocate(linked.uid)}>
            <LinkIcon />
            <span className={Styles.linkTitle}>{title}</span>
            <span className={Styles.linkName}>{linkedSheet?.name}</span>
        </button>
    }

    const invulSave = getInvulSave(unit)

    return <div id={`unit-${unit.uid}`} className={`${Styles.row} ${unit.isWarlord ? Styles.warlord : ''}`}>
        <div className={Styles.head}>
            <button type='button' className={Styles.nameButton} onClick={handleInfo}>
                <UnitImage src={datasheet?.rowImage} alt={datasheet?.name} />
                <span className={Styles.info}>
                    <span className={Styles.name}>{datasheet?.name}</span>
                    <span className={Styles.models}>
                        {t('{{count}} model|{{count}} models', {count: getModelCount(unit)})}
                        <span className={`${Styles.points} ${isRaised ? Styles.raised : ''}`}>{t('{{count}} pts', {count: total})}</span>
                        {invulSave
                            ? <span className={Styles.invul} title={t('Invulnerable save')}><ShieldIcon />{invulSave}</span>
                            : null
                        }
                    </span>
                </span>
            </button>
            {readOnly ? null : <button type='button' className={Styles.iconButton} disabled={!canCopy} onClick={handleCopy} aria-label={t('Copy')}><CopyIcon /></button>}
            {readOnly ? null : <button type='button' className={`${Styles.iconButton} ${Styles.delete}`} onClick={handleDelete} aria-label={t('Delete')}><CloseIcon /></button>}
        </div>
        {size(compositions) > 1
            ? <div className={Styles.compositions}>{map(visibleCompositions, renderComposition)}</div>
            : null
        }
        {map(getCompositionModels(unit.compositionId), renderRange)}
        {leadTarget || size(leaders)
            ? <div className={Styles.links}>
                {leadTarget ? renderLink(t('Leads'), leadTarget) : null}
                {map(leaders, leader => renderLink(t('Led by'), leader))}
            </div>
            : null
        }
        {size(loadoutChanges)
            ? <div className={Styles.changes}>
                {map(loadoutChanges, (change, index) => <p key={index} className={Styles.change}>
                    <span className={Styles.changeCount}>{change.count}×</span>
                    {change.miniature ? <span className={Styles.changeModel}>{change.miniature}</span> : null}
                    <span>{change.label}</span>
                </p>)}
            </div>
            : null
        }
        {size(issues)
            ? <div className={Styles.issues}>{map(issues, issue => <p key={issue}>{issue}</p>)}</div>
            : null
        }
        {(readOnly ? (unit.allegianceAbilityId || unit.isWarlord || enhancement) : (isCharacter || hasWargear || allegianceSelect))
            ? <div className={Styles.chips} style={readOnly ? {pointerEvents: 'none'} : undefined}>
                {allegianceSelect && (!readOnly || unit.allegianceAbilityId)
                    ? <button type='button' className={`${Styles.chip} ${unit.allegianceAbilityId ? Styles.active : ''}`} onClick={handleAllegiance}>
                        {find(allegianceSelect.abilities, ['id', unit.allegianceAbilityId])?.name || allegianceSelect.group.name}
                    </button>
                    : null
                }
                {hasWargear && !readOnly
                    ? <button type='button' className={`${Styles.chip} ${size(loadoutChanges) ? Styles.active : ''}`} onClick={handleWargear}>{t('Wargear')}</button>
                    : null
                }
                {isCharacter && (!readOnly || unit.isWarlord) ? <button type='button' className={`${Styles.chip} ${unit.isWarlord ? Styles.active : ''}`} onClick={handleWarlord}>{t('Warlord')}</button> : null}
                {canAttach && !readOnly
                    ? <button type='button' className={`${Styles.chip} ${leadTarget ? Styles.active : ''}`} onClick={handleAttach}>{leadTarget ? t('Change unit') : t('Attach to unit')}</button>
                    : null
                }
                {hasEnhancements
                    ? <button type='button' className={`${Styles.chip} ${enhancement ? Styles.active : ''}`} onClick={handleEnhancement}>
                        {enhancement ? `${enhancement.name} (${enhancement.basePointsCost} pts)` : isCharacter ? 'Enhancement' : 'Upgrade'}
                    </button>
                    : null
                }
            </div>
            : null
        }
        <UnitStats unit={unit} />
    </div>
}

export default UnitRow
