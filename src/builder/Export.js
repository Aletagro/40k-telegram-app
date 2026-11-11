import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import {toast} from 'react-toastify'
import Constants from '../Constants'
import {getRosterIssues, findAttachGroup} from '../utilities/rosterValidation'
import {getUnitWargearByModel} from '../utilities/wargearModel'
import {roster} from '../utilities/appState'
import {getUsedDetachmentPoints, getRosterPoints, getUnitTotalPoints, getDatasheetType} from '../utilities/rosterModel'

import map from 'lodash/map'
import compact from 'lodash/compact'
import find from 'lodash/find'
import size from 'lodash/size'
import filter from 'lodash/filter'
import includes from 'lodash/includes'

import {getCodexInfo} from '../utilities/utils'
import Button from '../components/Button'
import useSaveList from './useSaveList'

import Styles from './styles/Builder.module.css'

const dataBase = require('../utilities/db')

// Формат повторяет экспорт официального приложения Warhammer 40,000, чтобы список читали и другие сервисы

const formatPoints = (points) => Number(points).toLocaleString('en-US')

const SECTION_BY_TYPE = {
    'Epic Hero': 'CHARACTERS',
    'Character': 'CHARACTERS',
    'Battleline': 'BATTLELINE',
    'Dedicated Transport': 'DEDICATED TRANSPORTS'
}
const SECTION_ORDER = ['CHARACTERS', 'BATTLELINE', 'DEDICATED TRANSPORTS', 'OTHER DATASHEETS', 'ALLIED UNITS']
const ROLE_NAMES = {leader: 'Leader', support: 'Support'}

const getTypeLabel = (unit) => {
    const type = getDatasheetType(unit.datasheetId)
    if (type === 'Epic Hero' || type === 'Character') return 'Character'
    return type === 'Battleline' ? 'Battleline' : ''
}

// Блок юнита: {name, points, lines: [{text, sub}]}
const getUnitBlock = (unit, role) => {
    const datasheet = find(dataBase.data.datasheet, ['id', unit.datasheetId])
    const enhancement = find(dataBase.data.enhancement, ['id', unit.enhancementId])
    const lines = []
    if (role) {
        const label = getTypeLabel(unit)
        lines.push({text: `Attached as: ${role}${label ? ` (${label})` : ''}`})
    }
    if (unit.isWarlord) lines.push({text: 'Warlord'})
    const models = getUnitWargearByModel(unit)
    const isFlat = size(filter(models, 'count')) === 1 && find(models, 'count')?.count === 1
    models.forEach(model => {
        if (!model.count) {
            model.items.forEach(item => lines.push({text: `${item.count}x ${item.name}`}))
        } else if (isFlat) {
            model.items.forEach(item => lines.push({text: `${item.count}x ${item.name}`}))
        } else {
            lines.push({text: `${model.count}x ${model.name}`})
            model.items.forEach(item => lines.push({text: `${item.count}x ${item.name}`, sub: true}))
        }
    })
    if (enhancement) lines.push({text: `Enhancements: ${enhancement.name}`})
    return {name: datasheet?.name || '', points: getUnitTotalPoints(unit), lines}
}

// Название родительской армии как в официальном экспорте (Space Marines, а не Adeptus Astartes)
const getParentArmyName = (parent) => {
    const codex = getCodexInfo(parent.id)
    const name = codex?.name?.split(':')[1]?.trim()
    return name || parent.name
}

// Структура списка для показа и копирования: шапка и разделы с блоками юнитов
export const getExportModel = () => {
    const faction = find(dataBase.data.faction_keyword, ['id', roster.factionId])
    const parent = find(dataBase.data.faction_keyword, ['id', faction?.parentFactionKeywordId])
    const detachments = compact(map(roster.detachmentIds, id => find(dataBase.data.detachment, ['id', id])))
    const forceDisposition = find(dataBase.data.force_disposition, ['id', roster.forceDispositionId])
    const battleSize = find(dataBase.data.battle_size, ['id', roster.battleSizeId])
    const names = map(detachments, 'name')
    const detachmentNames = names.length > 1 ? `${names.slice(0, -1).join(', ')}${names.length > 2 ? ',' : ''} and ${names[names.length - 1]}` : names[0]
    const header = compact([
        parent ? getParentArmyName(parent) : '',
        roster.faction,
        detachmentNames ? `${detachmentNames} (${getUsedDetachmentPoints()} Detachment Points)` : '',
        forceDisposition?.name,
        `${battleSize?.name || ''} (${formatPoints(roster.pointsLimit)} Points)`
    ])

    const sections = []
    const used = new Set()
    // Присоединённые отряды: лидеры, поддержка и сам отряд
    const attachedUnits = []
    const targets = filter(roster.units, target => find(roster.units, ['attachedToUid', target.uid]))
    targets.forEach((target, index) => {
        const leaders = filter(roster.units, ['attachedToUid', target.uid])
        const blocks = map(leaders, leader => {
            used.add(leader.uid)
            return getUnitBlock(leader, ROLE_NAMES[findAttachGroup(leader, target)?.bodyguardType || 'leader'] || 'Leader')
        })
        used.add(target.uid)
        blocks.push(getUnitBlock(target, 'Bodyguard'))
        attachedUnits.push({title: `Attached unit ${index + 1}`, units: blocks})
    })
    if (attachedUnits.length) sections.push({title: 'ATTACHED UNITS', groups: attachedUnits})

    const rest = {}
    roster.units.forEach(unit => {
        if (used.has(unit.uid)) return
        const title = unit.alliedFactionId ? 'ALLIED UNITS' : SECTION_BY_TYPE[getDatasheetType(unit.datasheetId)] || 'OTHER DATASHEETS'
        rest[title] = [...(rest[title] || []), {title: '', units: [getUnitBlock(unit)]}]
    })
    SECTION_ORDER.forEach(title => {
        if (rest[title]) sections.push({title, groups: rest[title]})
    })
    // Те же данные для карточки на экране: подпись и значение
    const info = compact([
        {label: 'Army', value: compact([parent ? getParentArmyName(parent) : '', roster.faction]).join(' · ')},
        detachmentNames ? {label: `Detachments · ${getUsedDetachmentPoints()} DP`, value: names.join('\n')} : null,
        forceDisposition ? {label: 'Force Disposition', value: forceDisposition.name} : null,
        {label: 'Battle size', value: `${battleSize?.name || ''} · ${formatPoints(roster.pointsLimit)} pts`}
    ])
    return {info, limit: roster.pointsLimit, name: roster.name || roster.faction, points: getRosterPoints(), header, sections}
}

// Блоки разделены пустой строкой: шапка, раздел, группа присоединённых отрядов, юнит
export const getRosterText = (model = getExportModel()) => {
    const blocks = [[`${model.name} (${formatPoints(model.points)} Points)`, ...model.header]]
    model.sections.forEach(section => {
        blocks.push([section.title])
        section.groups.forEach(group => {
            if (group.title) blocks.push([group.title])
            group.units.forEach(unit => blocks.push([
                `${unit.name} ${unit.points} Points`,
                ...map(unit.lines, line => `${line.sub ? '◦' : '•'} ${line.text}`)
            ]))
        })
    })
    return map(blocks, block => block.join('\n')).join('\n\n')
}

const Export = () => {
    const [isCopy, setIsCopy] = useState(false)
    const {handleClickSaveButton, saveModal} = useSaveList()
    const issues = getRosterIssues()
    const model = getExportModel()

    const handleCopy = () => {
        navigator.clipboard.writeText(`${size(issues) ? `Roster errors:\n${map(issues, issue => `- ${issue.message}`).join('\n')}\n\n` : ''}${getRosterText(model)}`)
        toast.success(t('List Copied'), Constants.toastParams)
        setIsCopy(true)
    }

    const renderUnit = (unit, index) => <div key={`${unit.name}${index}`} className={Styles.exportUnit}>
        <p className={Styles.exportUnitHead}><span>{unit.name}</span><b>{unit.points} pts</b></p>
        {map(unit.lines, (line, lineIndex) => <p key={lineIndex} className={`${Styles.exportLine} ${line.sub ? Styles.exportSub : ''} ${includes(['Warlord'], line.text) || line.text.startsWith('Attached as') || line.text.startsWith('Enhancements') ? Styles.exportTag : ''}`}>{line.text}</p>)}
    </div>

    const renderGroup = (group, index) => <div key={index} className={Styles.exportGroup}>
        {group.title ? <p className={Styles.exportGroupTitle}>{group.title}</p> : null}
        {map(group.units, renderUnit)}
    </div>

    return <div id='column' className='Chapter'>
        <Button className={Styles.fullButton} onClick={handleCopy}>{isCopy ? t('Copied') : t('Copy List')}</Button>
        <Button type='secondary' className={Styles.fullButton} onClick={handleClickSaveButton}>{t('Save List')}</Button>
        {size(issues)
            ? <div className={Styles.exportWarn}>
                <b>{size(issues)} {size(issues) === 1 ? 'issue' : 'issues'} in the list</b>
                <ul className={Styles.errors}>{map(issues, (issue, index) => <li key={index}>{issue.message}</li>)}</ul>
            </div>
            : null
        }
        <div className={Styles.exportHead}>
            <p className={Styles.exportTitle}>{model.name}</p>
            <p className={`${Styles.exportTotal} ${model.points > model.limit ? Styles.exportOver : ''}`}>{formatPoints(model.points)} <span>/ {formatPoints(model.limit)} pts</span></p>
            <div className={Styles.exportBar}><div style={{width: `${Math.min(100, model.points / model.limit * 100)}%`}} className={model.points > model.limit ? Styles.exportOver : ''} /></div>
            {map(model.info, item => <div key={item.label} className={Styles.exportInfo}>
                <span className={Styles.exportInfoLabel}>{item.label}</span>
                <span className={Styles.exportInfoValue}>{item.value}</span>
            </div>)}
        </div>
        {map(model.sections, section => <div key={section.title}>
            <h4 className={Styles.exportSection}>{section.title}</h4>
            {map(section.groups, renderGroup)}
        </div>)}
        {saveModal}
    </div>
}

export default Export
