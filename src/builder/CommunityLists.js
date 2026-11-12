import {t} from '../utilities/i18n'
import React, {useCallback, useEffect, useMemo, useReducer, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {lists, main, roster, navigationState} from '../utilities/appState'
import {fetchRosters} from '../utilities/api'
import {hydrateRoster} from '../utilities/rosterModel'
import {notifyHydrateReport} from './hydrateNotice'
import {getExportModel} from './Export'
import Constants from '../Constants'
import Button from '../components/Button'
import Modal from '../components/Modal'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import compact from 'lodash/compact'
import filter from 'lodash/filter'
import some from 'lodash/some'
import includes from 'lodash/includes'
import flatMap from 'lodash/flatMap'

import Styles from './styles/CommunityLists.module.css'

const dataBase = require('../utilities/db')

const POINTS_LIMITS = [1000, 2000, 3000]
const DEFAULT_FILTERS = {points_limit: 2000}

const parseJson = (value, fallback) => {
    try {
        return JSON.parse(value) ?? fallback
    } catch (error) {
        return fallback
    }
}

// Состав списка текстом по разделам, как в экспорте, но без снаряжения. Модель экспорта строится по общему roster,
// поэтому список временно загружается в него, а затем roster возвращается как был
const getListSections = (list) => {
    const snapshot = {...roster}
    try {
        hydrateRoster(list)
        return map(getExportModel().sections, section => ({
            title: section.title,
            groups: map(section.groups, group => {
                // В группе присоединённых отрядов: лидеры ведут отряд (Bodyguard), а у него перечисляются лидеры
                const isRole = (unit, role) => some(unit.lines, line => line.text.startsWith(`Attached as: ${role}`))
                const bodyguard = find(group.units, unit => isRole(unit, 'Bodyguard'))
                const leaders = filter(group.units, unit => bodyguard && unit !== bodyguard && some(unit.lines, line => line.text.startsWith('Attached as:')))
                return {
                    title: group.title,
                    units: map(group.units, unit => {
                        const rest = filter(unit.lines, line => !line.text.startsWith('Attached as:'))
                        const attach = unit === bodyguard
                            ? [`${t('Led by')}: ${map(leaders, 'name').join(', ')}`]
                            : (bodyguard && includes(leaders, unit) ? [`${t('Leads')}: ${bodyguard.name}`] : [])
                        return {
                            name: unit.name,
                            points: unit.points,
                            lines: [
                                ...map(attach, text => ({text})),
                                ...filter(rest, line => line.text === 'Warlord'),
                                ...filter(rest, line => line.text.startsWith('Enhancements:')),
                                ...filter(rest, line => line.text !== 'Warlord' && !line.text.startsWith('Enhancements:'))
                            ]
                        }
                    })
                }
            })
        }))
    } catch (error) {
        return []
    } finally {
        Object.keys(roster).forEach(key => { if (!(key in snapshot)) delete roster[key] })
        Object.assign(roster, snapshot)
    }
}

const renderUnit = (unit, index) => <span key={index} className={Styles.unitRow}>
    <span className={Styles.unitName}>{unit.name}{map(unit.lines, (line, lineIndex) => <span key={lineIndex} className={`${Styles.unitTags} ${line.sub ? Styles.unitSub : ''}`}>{line.text}</span>)}</span>
    <span className={Styles.unitPoints}>{unit.points}</span>
</span>

const renderSection = (section) => <span key={section.title} className={Styles.section}>
    <span className={Styles.sectionTitle}>{section.title}</span>
    {map(section.groups, (group, index) => <span key={index} className={Styles.group}>
        {group.title ? <span className={Styles.groupLabel}>{group.title}</span> : null}
        {map(group.units, renderUnit)}
    </span>)}
</span>

// Плашка чужого списка: игрок, армия, детачменты, очки и состав
const CommunityListCard = ({list, onClick}) => {
    const army = find(dataBase.data.faction_keyword, ['id', list.faction_id])
    const detachments = compact(map(parseJson(list.detachment_ids, list.detachment_id ? [list.detachment_id] : []), id => find(dataBase.data.detachment, ['id', id])?.name))
    const forceDisposition = find(dataBase.data.force_disposition, ['id', list.force_disposition_id])?.name
    const sections = useMemo(() => getListSections(list), [list])
    const points = parseJson(list.points, {})?.all
    const player = [list.lastname, list.firstname].filter(Boolean).join(' ')

    return <button type='button' className={Styles.card} onClick={() => onClick(list)}>
        <span className={Styles.cardHead}>
            <span className={Styles.cardName}>{list.name}</span>
            <span className={Styles.cardPoints}>{points ? `${points} / ` : ''}{list.points_limit} pts</span>
        </span>
        <span className={Styles.cardArmy}>{army?.name || list.faction}</span>
        {player ? <span className={Styles.cardRow}><b>{t('Player')}</b> {player}</span> : null}
        {size(detachments) ? <span className={Styles.cardRow}><b>{t('Detachments')}</b> {detachments.join(', ')}</span> : null}
        {forceDisposition ? <span className={Styles.cardRow}><b>{t('Force Disposition')}</b> {forceDisposition}</span> : null}
        {size(sections) ? <span className={Styles.cardUnits}>{map(sections, renderSection)}</span> : null}
    </button>
}

// Списки других игроков с фильтрами по армии и размеру игры
const CommunityLists = () => {
    const navigate = useNavigate()
    const [modal, setModal] = useState(null)
    const [, forceUpdate] = useReducer((x) => x + 1, 0)

    const handleGetLists = useCallback(async (page = 1, withReset) => {
        const data = await fetchRosters(lists.filters, page)
        if (!data) return
        lists.data = withReset || page === 1 ? data.rosters : [...lists.data, ...data.rosters]
        lists.meta = data.meta
        forceUpdate()
    }, [])

    useEffect(() => {
        if (lists.isFirstReq) {
            lists.isFirstReq = false
            handleGetLists()
        }
    }, [handleGetLists])

    const setFilters = (filters) => {
        lists.filters = filters
        handleGetLists(1, true)
        setModal(null)
    }

    const handleToggleFilter = (key, value) => () => {
        const next = {...lists.filters}
        if (next[key] === value) delete next[key]
        else next[key] = value
        delete next.all
        setFilters(size(Object.keys(next)) ? next : {...DEFAULT_FILTERS})
    }

    const handleAll = () => setFilters({...DEFAULT_FILTERS})

    const handleOpen = (list) => {
        hydrateRoster(list)
        notifyHydrateReport()
        // Чужой список открывается как копия: без id сохранение создаст новый список
        if (!main.user?.id || list.user_id !== main.user.id) roster.id = undefined
        navigationState.isBuilder = true
        navigate('/builder', {state: {faction: {id: list.faction_id, name: list.faction}}})
    }

    const renderOption = (key, value, label) => <button
        type='button'
        key={`${key}${value}`}
        className={lists.filters[key] === value ? Styles.selectedOption : Styles.option}
        onClick={handleToggleFilter(key, value)}
    >
        {label || value}
    </button>

    const renderArmies = () => <div>
        {map(Constants.grandFactions, grand => <div key={grand.name}>
            <p className={Styles.groupTitle}>{t(grand.name)}</p>
            {map(grand.factions, faction => renderOption('faction_id', faction.id, faction.name))}
        </div>)}
    </div>

    const filters = [
        {id: 'faction_id', label: find(flatMap(Constants.grandFactions, 'factions'), ['id', lists.filters.faction_id])?.name || t('Army'), content: renderArmies},
        {id: 'points_limit', label: lists.filters.points_limit ? t('{{count}} pts', {count: lists.filters.points_limit}) : t('Points'), content: () => map(POINTS_LIMITS, value => renderOption('points_limit', value, t('{{count}} points', {count: value})))}
    ]

    const renderFilter = (filter) => <button
        type='button'
        key={filter.id}
        className={lists.filters[filter.id] && !(filter.id === 'points_limit' && lists.filters.all) ? Styles.selectedFilter : Styles.filter}
        onClick={() => setModal(filter)}
    >
        {filter.label}
    </button>

    return <>
        <div className={Styles.filters}>
            <button type='button' className={lists.filters.all ? Styles.selectedFilter : Styles.filter} onClick={handleAll}>{t('All')}</button>
            {map(filters, renderFilter)}
        </div>
        <div id='column' className='Chapter'>
            {size(lists.data) > 0
                ? <>
                    {map(lists.data, list => <CommunityListCard key={list.id} list={list} onClick={handleOpen} />)}
                    {lists.meta?.total_pages === lists.meta?.page
                        ? null
                        : <Button className={Styles.nextPage} type='secondary' onClick={() => handleGetLists(lists.meta?.page + 1)}>{t('Show Next Page')}</Button>
                    }
                </>
                : <p className={Styles.empty}>{t('Nobody plays this army yet, you can be the first!')}</p>
            }
        </div>
        <Modal visible={Boolean(modal)} title={modal?.label} onClose={() => setModal(null)}>
            <div className={Styles.options}>{modal ? modal.content() : null}</div>
        </Modal>
    </>
}

export default CommunityLists
