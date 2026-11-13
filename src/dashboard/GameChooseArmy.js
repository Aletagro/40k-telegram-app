import {t} from '../utilities/i18n'
import React, {useEffect, useReducer, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import Constants from '../Constants'
import Button from '../components/Button'
import Modal from '../components/Modal'
import ImageCard from '../components/ImageCard'
import {gameDraft, main} from '../utilities/appState'
import {fetchRostersByUser, fetchRoster} from '../utilities/api'
import {getCombatPatrols} from '../utilities/utils'
import {getForceDispositionOptions, getUsedDetachmentPoints} from '../utilities/rosterModel'
import {listToArmy} from './gameSetup'
import {MODE_COMBAT_PATROL} from './missionData'

import map from 'lodash/map'
import find from 'lodash/find'
import flatMap from 'lodash/flatMap'
import includes from 'lodash/includes'
import compact from 'lodash/compact'
import sortBy from 'lodash/sortBy'

import Styles from './styles/Dashboard.module.css'
import BuilderStyles from '../builder/styles/Builder.module.css'
import ListStyles from '../builder/styles/UserLists.module.css'
import FilterStyles from '../builder/styles/CommunityLists.module.css'

const dataBase = require('../utilities/db')

const TAB_MINE = 'mine'
const TAB_LINK = 'link'
const TAB_MANUAL = 'manual'

// Из ссылки или текста достаём id списка: UUID, параметр startapp или весь текст
export const parseRosterId = (text) => {
    const value = (text || '').trim()
    const uuid = value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
    if (uuid) return uuid[0]
    const param = value.match(/(?:startapp|start_param|roster)=([^&#\s]+)/i)
    return (param ? param[1] : value).replace(/^roster[_-]?/i, '')
}

const getDefaultBattleSize = () => find(dataBase.data.battle_size, ['pointsLimit', 2000])

// Шаг 1: выбор армии одного игрока. В Combat Patrol это один из готовых патрулей
const GameChooseArmy = () => {
    const navigate = useNavigate()
    const index = useLocation().state?.index ?? 0
    const player = gameDraft.players[index]
    const [tab, setTab] = useState(gameDraft.manual[index]?.factionId ? TAB_MANUAL : TAB_MINE)
    const [lists, setLists] = useState(main.rosters)
    const [linkText, setLinkText] = useState('')
    const [linkError, setLinkError] = useState('')
    const [loading, setLoading] = useState(false)
    const [factionModal, setFactionModal] = useState(false)
    const [dispositionModal, setDispositionModal] = useState(false)
    const [, forceUpdate] = useReducer(x => x + 1, 0)

    useEffect(() => {
        if (gameDraft.mode === MODE_COMBAT_PATROL || tab !== TAB_MINE) return
        let active = true
        fetchRostersByUser().then(data => {
            if (!active || !data) return
            main.rosters = data.rosters || []
            setLists(main.rosters)
        })
        return () => { active = false }
    }, [tab])

    if (!player) return null

    // Выбор вручную хранится в черновике, чтобы пережить переход на экран детачмента
    const manual = gameDraft.manual[index] || (gameDraft.manual[index] = {factionId: '', detachmentIds: [], dispositionId: '', battleSizeId: getDefaultBattleSize()?.id})

    const choose = (army) => {
        player.army = army
        player.primaryMissionId = null
        navigate(-1)
    }

    const handleLink = async () => {
        const id = parseRosterId(linkText)
        if (!id) return
        setLoading(true)
        setLinkError('')
        const data = await fetchRoster(id)
        setLoading(false)
        const list = data?.roster || data
        if (!list?.id) {
            setLinkError(t('List not found. Check the link or ID'))
            return
        }
        choose(listToArmy(list, 'link'))
    }

    if (gameDraft.mode === MODE_COMBAT_PATROL) {
        return <div className={Styles.page}>
            {map(getCombatPatrols(), patrol => <ImageCard key={patrol.id} title={patrol.name} image={patrol.faction.moreInfoImage || patrol.detachment.bannerImage}
                selected={includes(player.army?.detachmentIds, patrol.detachment.id)}
                onClick={() => choose({source: 'patrol', name: patrol.name, factionId: patrol.faction.id, detachmentIds: [patrol.detachment.id], forceDispositionId: '', ownerName: ''})} />)}
        </div>
    }

    const renderList = (list) => {
        const faction = find(dataBase.data.faction_keyword, ['id', list.faction_id])
        return <div className={ListStyles.listContainer} key={list.id}>
            <button type='button' className={ListStyles.button} onClick={() => choose(listToArmy(list, 'saved'))}>
                {faction?.moreInfoImage ? <img src={faction.moreInfoImage} alt={faction?.name} className={ListStyles.image} /> : <span className={ListStyles.image} />}
                <span className={ListStyles.textContainer}>
                    <span className={ListStyles.text}>{list.name}</span>
                    <span className={ListStyles.armyText}>{faction?.name || list.faction}</span>
                </span>
            </button>
        </div>
    }

    const renderMine = () => lists.length
        ? <div className={ListStyles.buttonContainer}>{map(lists, renderList)}</div>
        : <p className={Styles.muted}>{t('You have no saved lists yet')}</p>

    const renderLink = () => <div className={Styles.gap}>
        <div className={Styles.card}>
            <h3 className={Styles.cardTitle}>{t('How to share a list')}</h3>
            <p className={Styles.muted}>{t('Your opponent opens the list in the app, taps Share and sends you the link. Paste it here, or just the list ID.')}</p>
            <p className={Styles.muted}>{t('The list is only read: it is not copied to your saved lists.')}</p>
        </div>
        <input className={Styles.input} value={linkText} placeholder={t('Link or list ID')} onChange={event => setLinkText(event.target.value)} />
        {linkError ? <p className={Styles.errorText}>{linkError}</p> : null}
        <Button disabled={!linkText.trim() || loading} onClick={handleLink}>{loading ? t('Loading...') : t('Find list')}</Button>
    </div>

    const faction = find(flatMap(Constants.grandFactions, 'factions'), ['id', manual.factionId])
    const battleSize = find(dataBase.data.battle_size, ['id', manual.battleSizeId]) || getDefaultBattleSize()
    const dispositions = getForceDispositionOptions(manual.detachmentIds)
    const dispositionId = manual.dispositionId || (dispositions.length === 1 ? dispositions[0].id : '')
    const detachments = compact(map(manual.detachmentIds, id => find(dataBase.data.detachment, ['id', id])))
    const chosenDisposition = find(dispositions, ['id', dispositionId])
    const dpLimit = battleSize?.detachmentPointsLimit || 0
    const usedDp = getUsedDetachmentPoints(manual.detachmentIds)
    const openDetachments = () => navigate('/gameChooseDetachments', {state: {title: t('Detachments'), index}})
    const needsDisposition = dispositions.length > 1 && !manual.dispositionId

    const handleManual = () => choose({
        source: 'manual',
        name: faction?.name || '',
        factionId: manual.factionId,
        detachmentIds: manual.detachmentIds,
        forceDispositionId: dispositionId,
        pointsLimit: battleSize?.pointsLimit,
        ownerName: ''
    })

    const renderManual = () => <div className={Styles.gap}>
        <span className={Styles.label}>{t('Faction')}</span>
        <button type='button' className={Styles.selectButton} onClick={() => setFactionModal(true)}><span className={Styles.selectLabel}>{faction?.name || t('Choose faction')}</span></button>
        <span className={Styles.label}>{t('Game size')}</span>
        <div className={Styles.chips}>{map(sortBy(dataBase.data.battle_size, 'pointsLimit'), size => <button type='button' key={size.id}
            className={`${Styles.chip} ${battleSize?.id === size.id ? Styles.chipActive : ''}`}
            onClick={() => { manual.battleSizeId = size.id; manual.detachmentIds = []; manual.dispositionId = ''; forceUpdate() }}>{t('{{count}} points', {count: size.pointsLimit})}</button>)}</div>
        {faction ? <>
            {map(detachments, detachment => <ImageCard
                key={detachment.id}
                title={detachment.name}
                image={detachment.bannerImage || detachment.rowImage}
                badge={detachment.detachmentPointsCost ? `${detachment.detachmentPointsCost} DP` : undefined}
                onClick={openDetachments}
                onAction={() => navigate('/detachment', {state: {title: detachment.name, detachment}})}
            />)}
            <button type='button' className={BuilderStyles.detachment} onClick={openDetachments}>
                <span className={BuilderStyles.detachmentBody}>
                    <span className={BuilderStyles.detachmentLabel}>{t('Detachments')}</span>
                    <span className={BuilderStyles.detachmentName}>{detachments.length ? t('Edit Detachments') : t('Choose Detachments')}</span>
                </span>
                <span className={BuilderStyles.detachmentName}>{usedDp} / {dpLimit} DP</span>
            </button>
        </> : null}
        {detachments.length && dispositions.length ? <div className={BuilderStyles.dispositionRow}>
            <button type='button' className={BuilderStyles.detachment} onClick={() => dispositions.length > 1 && setDispositionModal(true)}>
                <span className={BuilderStyles.detachmentBody}>
                    <span className={BuilderStyles.detachmentLabel}>{t('Force Disposition')}</span>
                    <span className={BuilderStyles.detachmentName}>{chosenDisposition?.name || t('Choose Force Disposition')}</span>
                </span>
            </button>
            {chosenDisposition ? <button type='button' className={`${BuilderStyles.infoButton} ${BuilderStyles.dispositionInfo}`} aria-label={t('Force Disposition info')}
                onClick={() => navigate('/forceDispositionInfo', {state: {title: chosenDisposition.name, forceDispositionId: chosenDisposition.id}})}>i</button> : null}
        </div> : null}
        <Button disabled={!faction || !manual.detachmentIds.length || needsDisposition} onClick={handleManual}>{t('Choose')}</Button>
    </div>

    const renderFactionOptions = () => map(Constants.grandFactions, grand => <div key={grand.name}>
        <p className={FilterStyles.groupTitle}>{t(grand.name)}</p>
        {map(grand.factions, item => <button type='button' key={item.id}
            className={manual.factionId === item.id ? FilterStyles.selectedOption : FilterStyles.option}
            onClick={() => { manual.factionId = item.id; manual.detachmentIds = []; manual.dispositionId = ''; setFactionModal(false) }}>{item.name}</button>)}
    </div>)

    return <div className={Styles.page}>
        <div className={Styles.tabs}>
            {map([[TAB_MINE, t('My lists')], [TAB_LINK, t('By link or ID')], [TAB_MANUAL, t('Manually')]], ([id, label]) =>
                <button type='button' key={id} className={`${Styles.tab} ${tab === id ? Styles.tabActive : ''}`} onClick={() => setTab(id)}>{label}</button>)}
        </div>
        {tab === TAB_MINE ? renderMine() : tab === TAB_LINK ? renderLink() : renderManual()}
        <Modal visible={dispositionModal} title={t('Force Disposition')} onClose={() => setDispositionModal(false)}>
            <div className={FilterStyles.options}>{map(getForceDispositionOptions(manual.detachmentIds), option => <button type='button' key={option.id}
                className={manual.dispositionId === option.id ? FilterStyles.selectedOption : FilterStyles.option}
                onClick={() => { manual.dispositionId = option.id; setDispositionModal(false) }}>{option.name}</button>)}</div>
        </Modal>
        <Modal visible={factionModal} title={t('Faction')} onClose={() => setFactionModal(false)}>
            <div className={FilterStyles.options}>{renderFactionOptions()}</div>
        </Modal>
    </div>
}

export default GameChooseArmy
