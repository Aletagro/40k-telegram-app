import {t} from '../utilities/i18n'
import React, {useEffect, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import {getGame} from '../dashboard/gameStorage'
import UnitRow from './UnitRow'
import ImageCard from '../components/ImageCard'
import CollapseSection from '../components/CollapseSection'
import {getUnitsSortesByType, getCodexInfo, getParentCodexId, getFactionLabel} from '../utilities/utils'
import {getRosterPoints, hydrateRoster, getDatasheetType, getUnitTotalPoints} from '../utilities/rosterModel'

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

// Ростер игрока партии только для чтения: тот же вид, что в билдере, без кнопок правки. Правила и датащиты открываются.
// Модель билдера работает с общим roster, поэтому список временно загружается в него, а при выходе roster возвращается как был
const ViewRoster = () => {
    const {gameId, playerIndex} = useLocation().state
    const navigate = useNavigate()
    const [ready, setReady] = useState(false)
    const [collapsed, setCollapsed] = useState({})
    const list = getGame(gameId)?.players?.[playerIndex]?.army?.snapshot

    useEffect(() => {
        const saved = JSON.parse(JSON.stringify(roster))
        if (list) hydrateRoster(list)
        setReady(true)
        return () => {
            Object.keys(roster).forEach(key => { if (!(key in saved)) delete roster[key] })
            Object.assign(roster, saved)
        }
    }, [list])

    if (!list) return <div id='column' className='Chapter'><p className={Styles.empty}>{t('List not found')}</p></div>
    if (!ready) return null

    const faction = find(dataBase.data.faction_keyword, ['id', roster.factionId]) || {id: roster.factionId, name: roster.faction}
    const codexInfo = getCodexInfo(faction.id)
    const unitsTypes = getUnitsSortesByType(faction, codexInfo, roster.detachmentIds, getParentCodexId(faction))
    const chosenDetachments = compact(map(roster.detachmentIds, id => find(dataBase.data.detachment, ['id', id])))
    const forceDisposition = find(dataBase.data.force_disposition, ['id', roster.forceDispositionId])
    const points = getRosterPoints()
    const groupTypes = [...unitsTypes, ...(find(roster.units, 'alliedFactionId') ? [{title: ALLIED_TITLE}] : [])]

    const getGroupUnits = (title) => filter(roster.units, unit => title === ALLIED_TITLE
        ? Boolean(unit.alliedFactionId)
        : !unit.alliedFactionId && replace(getDatasheetType(unit.datasheetId), /,/g, '') === title)

    const handleArmyRules = () => {
        let data = []
        if (codexInfo?.id) {
            data = filter(dataBase.data.army_rule, ['publicationId', codexInfo.id])
        } else {
            data = map(filter(dataBase.data.army_rule_faction_keyword, ['factionKeywordId', faction.id]), rule => find(dataBase.data.army_rule, ['id', rule.armyRuleId]))
        }
        if (size(data)) navigate('/armyRules', {state: {title: t('Army Rules'), faction, data}})
    }

    const handleLocate = (uid) => {
        const element = document.getElementById(`unit-${uid}`)
        if (element) element.scrollIntoView({behavior: 'smooth', block: 'center'})
    }

    const renderGroup = (unitsType) => {
        const units = getGroupUnits(unitsType.title)
        if (!size(units)) return null
        return <CollapseSection key={unitsType.title} title={`${unitsType.label || t(unitsType.title)} (${size(units)})`} meta={t('{{count}} pts', {count: sumBy(units, getUnitTotalPoints)})} expanded={!collapsed[unitsType.title]} onToggle={() => setCollapsed(state => ({...state, [unitsType.title]: !state[unitsType.title]}))}>
            <div className={Styles.units}>
                {map(units, unit => <UnitRow key={unit.uid} unit={unit} readOnly issues={[]} onChange={() => {}} onLocate={handleLocate} />)}
            </div>
        </CollapseSection>
    }

    return <div id='column' className='Chapter'>
        <div className={Styles.summary}>
            <div className={Styles.faction}>
                <span className={Styles.factionName}>{getFactionLabel(roster.factionId, roster.faction)}</span>
                <button type='button' className={Styles.infoButton} onClick={handleArmyRules} aria-label={t('Army rules')}>i</button>
            </div>
            <span className={Styles.muted}>{roster.grandFaction}</span>
            <div className={Styles.pointsRow}>
                <span className={Styles.points}>{points} / {roster.pointsLimit} pts</span>
            </div>
        </div>
        {map(chosenDetachments, detachment => <ImageCard
            key={detachment.id}
            title={detachment.name}
            image={detachment.bannerImage || detachment.rowImage}
            badge={detachment.detachmentPointsCost ? `${detachment.detachmentPointsCost} DP` : undefined}
            onClick={() => navigate('/detachment', {state: {title: detachment.name, detachment}})}
        />)}
        {forceDisposition
            ? <button type='button' className={Styles.detachment} onClick={() => navigate('/forceDispositionInfo', {state: {title: forceDisposition.name, forceDispositionId: forceDisposition.id}})}>
                <span className={Styles.detachmentBody}>
                    <span className={Styles.detachmentLabel}>{t('Force Disposition')}</span>
                    <span className={Styles.detachmentName}>{forceDisposition.name}</span>
                </span>
            </button>
            : null
        }
        {map(groupTypes, renderGroup)}
    </div>
}

export default ViewRoster
