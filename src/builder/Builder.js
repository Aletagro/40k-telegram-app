import React, {useReducer, useMemo} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import UnitRow from './UnitRow'
import {getRosterIssues, getAlliedUsage, canBeWarlord} from '../utilities/rosterValidation'
import ImageCard from '../components/ImageCard'
import ListStatus from './ListStatus'
import Button from '../components/Button'
import useSaveList from './useSaveList'
import CollapseSection from '../components/CollapseSection'
import {sortByName, getUnitsSortesByType, getCodexInfo, getParentCodexId} from '../utilities/utils'
import {getRosterPoints, setBattleSize, getDatasheetType, getUnitTotalPoints, getUsedDetachmentPoints, getDetachmentPointsLimit, getForceDispositionOptions} from '../utilities/rosterModel'

import map from 'lodash/map'
import size from 'lodash/size'
import find from 'lodash/find'
import sumBy from 'lodash/sumBy'
import filter from 'lodash/filter'
import replace from 'lodash/replace'
import compact from 'lodash/compact'

import Styles from './styles/Builder.module.css'

const dataBase = require('../utilities/db')

const ALLIED_TITLE = 'Allied Units'

const Builder = () => {
    const {faction} = useLocation().state
    const navigate = useNavigate()
    const [, forceUpdate] = useReducer((x) => x + 1, 0)
    const [collapsed, setCollapsed] = React.useState({})
    const summaryRef = React.useRef(null)
    const statusRef = React.useRef(null)
    const [showIssues, setShowIssues] = React.useState(true)
    const {handleClickSaveButton, saveModal} = useSaveList()
    const codexInfo = getCodexInfo(faction.id)
    const detachmentsIds = filter(dataBase.data.detachment_faction_keyword, ['factionKeywordId', faction.id])
    const detachments = sortByName(map(detachmentsIds, item => find(dataBase.data.detachment, ['id', item.detachmentId])))
    const chosenDetachments = compact(map(roster.detachmentIds, id => find(dataBase.data.detachment, ['id', id])))
    const forceDisposition = find(dataBase.data.force_disposition, ['id', roster.forceDispositionId])
    const parentCodexId = getParentCodexId(faction)
    const detachmentKey = (roster.detachmentIds || []).join(',')
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const unitsTypes = useMemo(() => getUnitsSortesByType(faction, codexInfo, roster.detachmentIds, parentCodexId), [faction, codexInfo, detachmentKey, parentCodexId])
    let alliedFactionIds = filter(dataBase.data.faction_keyword_allied_faction, ['factionKeywordId', faction.id])
    if (size(alliedFactionIds)) {
        alliedFactionIds = filter(alliedFactionIds, item => !find(dataBase.data.allied_faction_required_detachment, ['alliedFactionId', item.alliedFactionId]))
    }

    const points = getRosterPoints()
    const isOver = points > roster.pointsLimit
    const issues = getRosterIssues()
    const errors = map(issues, 'message')

    const handleBattleSize = (battleSizeId) => () => {
        setBattleSize(battleSizeId)
        forceUpdate()
    }

    const handleChooseDetachment = () => navigate('/chooseDetachment', {state: {title: 'Detachments', detachments}})

    const handleDetachmentInfo = (detachment) => () => {
        navigate('/detachment', {state: {title: detachment.name, detachment}})
    }

    const handleDispositionInfo = () => navigate('/forceDispositionInfo', {state: {title: forceDisposition.name, forceDispositionId: forceDisposition.id}})

    const handleForceDisposition = () => navigate('/chooseForceDisposition', {state: {title: 'Force Disposition'}})

    const handleArmyRules = () => {
        let data = []
        if (codexInfo?.id) {
            data = filter(dataBase.data.army_rule, ['publicationId', codexInfo.id])
        } else {
            data = map(filter(dataBase.data.army_rule_faction_keyword, ['factionKeywordId', faction.id]), rule => find(dataBase.data.army_rule, ['id', rule.armyRuleId]))
        }
        if (size(data)) navigate('/armyRules', {state: {title: 'Army Rules', faction, data}})
    }

    const handleAdd = (unitsType, isAllied) => () => navigate('/addUnit', {state: {
        unitsType, factionId: faction.id, isAllied, alliedFactionIds, title: `Add ${unitsType.title}`
    }})

    // Переход к юниту списка: раскрываем его группу, прокручиваем экран и подсвечиваем карточку
    const handleLocate = (uid) => {
        const unit = find(roster.units, ['uid', uid])
        if (!unit) return
        const title = unit.alliedFactionId ? ALLIED_TITLE : replace(getDatasheetType(unit.datasheetId), /,/g, '')
        setCollapsed(state => ({...state, [title]: false}))
        setTimeout(() => {
            const element = document.getElementById(`unit-${uid}`)
            if (!element) return
            element.scrollIntoView({behavior: 'smooth', block: 'center'})
            element.dataset.flash = 'true'
            setTimeout(() => { delete element.dataset.flash }, 1300)
        }, 60)
    }

    const handleToggle = (title) => setCollapsed(state => ({...state, [title]: !state[title]}))

    const getGroupUnits = (title) => filter(roster.units, unit => title === ALLIED_TITLE
        ? Boolean(unit.alliedFactionId)
        : !unit.alliedFactionId && replace(getDatasheetType(unit.datasheetId), /,/g, '') === title)

    const renderGroup = (unitsType, isAllied) => {
        const units = getGroupUnits(unitsType.title)
        const addButton = <button type='button' className={size(units) ? Styles.addButton : Styles.addButtonAlone} onClick={handleAdd(unitsType, isAllied)}>
            + Add {unitsType.title}
        </button>
        return <CollapseSection key={unitsType.title} title={`${unitsType.title}${size(units) ? ` (${size(units)})` : ''}`} meta={size(units) ? `${sumBy(units, getUnitTotalPoints)} pts` : ''} expanded={!collapsed[unitsType.title]} onToggle={() => handleToggle(unitsType.title)}>
            {unitsType.title === ALLIED_TITLE && size(getAlliedUsage())
                ? <div className={Styles.allyUsage}>
                    {map(getAlliedUsage(), ally => <p key={ally.id} className={ally.limit !== null && ally.points > ally.limit ? Styles.over : ''}>
                        <span>{ally.name}</span>
                        <span>{ally.points}{ally.limit !== null ? ` / ${ally.limit}` : ''} pts</span>
                    </p>)}
                </div>
                : null
            }
            {size(units)
                ? <div className={Styles.units}>
                    {map(units, unit => <UnitRow key={unit.uid} unit={unit} issues={map(filter(issues, ['uid', unit.uid]), 'message')} onChange={forceUpdate} onLocate={handleLocate} />)}
                    {addButton}
                </div>
                : addButton
            }
        </CollapseSection>
    }

    const handleReview = () => {
        setShowIssues(true)
        statusRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'})
    }

    // Куда ведёт Fix: экран выбора, либо сам юнит, к которому относится проблема
    const getIssueAction = (issue) => {
        if (issue.fix === 'detachments') return handleChooseDetachment
        if (issue.fix === 'forceDisposition') return handleForceDisposition
        if (issue.fix === 'warlord') {
            const candidate = find(roster.units, unit => canBeWarlord(unit)) || roster.units[0]
            return candidate ? () => handleLocate(candidate.uid) : null
        }
        if (issue.uid) return () => handleLocate(issue.uid)
        return null
    }

    return <div id='column' className='Chapter'>
        <div className={Styles.summary} ref={summaryRef}>
            <div className={Styles.faction}>
                <span className={Styles.factionName}>{roster.faction}</span>
                <button type='button' className={Styles.infoButton} onClick={handleArmyRules} aria-label='Army rules'>i</button>
            </div>
            <span className={Styles.muted}>{roster.grandFaction}</span>
            <div className={Styles.pointsRow}>
                <span className={`${Styles.points} ${isOver ? Styles.over : ''}`}>{points} / {roster.pointsLimit} pts</span>
            </div>
            <div className={Styles.bar}><div className={`${Styles.barFill} ${isOver ? Styles.over : ''}`} style={{width: `${Math.min(100, points / roster.pointsLimit * 100)}%`}} /></div>
            <div className={Styles.sizes}>
                {map(dataBase.data.battle_size, battleSize => <button
                    key={battleSize.id}
                    type='button'
                    className={`${Styles.size} ${battleSize.id === roster.battleSizeId ? Styles.active : ''}`}
                    onClick={handleBattleSize(battleSize.id)}
                >{battleSize.name}<br />{battleSize.pointsLimit}</button>)}
            </div>
        </div>
        <ListStatus issues={issues} expanded={showIssues} onToggle={() => setShowIssues(value => !value)} statusRef={statusRef} getAction={getIssueAction} />
        {size(detachments)
            ? <>
                {map(chosenDetachments, detachment => <ImageCard
                    key={detachment.id}
                    title={detachment.name}
                    image={detachment.bannerImage || detachment.rowImage}
                    badge={detachment.detachmentPointsCost ? `${detachment.detachmentPointsCost} DP` : undefined}
                    onClick={handleChooseDetachment}
                    onAction={handleDetachmentInfo(detachment)}
                />)}
                <button type='button' className={Styles.detachment} onClick={handleChooseDetachment}>
                    <span className={Styles.detachmentBody}>
                        <span className={Styles.detachmentLabel}>Detachments</span>
                        <span className={Styles.detachmentName}>{size(chosenDetachments) ? 'Edit Detachments' : 'Choose Detachments'}</span>
                    </span>
                    <span className={`${Styles.detachmentName} ${getUsedDetachmentPoints() > getDetachmentPointsLimit() ? Styles.over : ''}`}>{getUsedDetachmentPoints()} / {getDetachmentPointsLimit()} DP</span>
                </button>
                {size(chosenDetachments) && size(getForceDispositionOptions())
                    ? <div className={Styles.dispositionRow}>
                        <button type='button' className={Styles.detachment} onClick={handleForceDisposition}>
                            <span className={Styles.detachmentBody}>
                                <span className={Styles.detachmentLabel}>Force Disposition</span>
                                <span className={Styles.detachmentName}>{forceDisposition?.name || 'Choose Force Disposition'}</span>
                            </span>
                        </button>
                        {forceDisposition
                            ? <button type='button' className={`${Styles.infoButton} ${Styles.dispositionInfo}`} onClick={handleDispositionInfo} aria-label='Force Disposition info'>i</button>
                            : null
                        }
                    </div>
                    : null
                }
            </>
            : null
        }
        {map(unitsTypes, unitsType => renderGroup(unitsType, false))}
        {size(alliedFactionIds) ? renderGroup({title: ALLIED_TITLE}, true) : null}
        <Button type='secondary' className={Styles.fullButton} onClick={() => navigate('/export', {state: {title: 'Export List'}})}>Export</Button>
        <div className={Styles.saveBar}>
            <div className={Styles.saveInfo}>
                <span className={`${Styles.savePoints} ${isOver ? Styles.over : ''}`}>{points} / {roster.pointsLimit} pts</span>
                <span className={Styles.saveHint}>{size(errors) ? `${size(errors)} ${size(errors) === 1 ? 'issue' : 'issues'} to fix` : 'List is ready'}</span>
            </div>
            <Button type={size(errors) ? 'secondary' : 'primary'} className={Styles.saveButton} onClick={size(errors) ? handleReview : handleClickSaveButton}>
                {size(errors) ? 'Review' : 'Save'}
            </Button>
        </div>
        {saveModal}
    </div>
}

export default Builder
