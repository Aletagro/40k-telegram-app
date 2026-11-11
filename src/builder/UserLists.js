import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'
import Constants from '../Constants'
import {main, navigationState} from '../utilities/appState'
import {fetchRostersByUser, deleteRoster} from '../utilities/api'
import {hydrateRoster} from '../utilities/rosterModel'
import {notifyHydrateReport} from './hydrateNotice'
import {isSupporter, getSupportUntil, formatSupportDate, openSupportPage} from '../utilities/support'
import Modal from '../components/Modal'
import Button from '../components/Button'
import InfoNote from '../components/InfoNote'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'
import includes from 'lodash/includes'

import Styles from './styles/UserLists.module.css'

const dataBase = require('../utilities/db')

// Сохранённые списки пользователя (rosters_db): создать новый, вставить, плашки со списками
const UserLists = () => {
    const navigate = useNavigate()
    const [lists, setLists] = useState(main.rosters)
    const [toDelete, setToDelete] = useState(null)

    useEffect(() => {
        let isActive = true
        fetchRostersByUser().then(data => {
            if (!isActive || !data) return
            main.rosters = data.rosters || []
            setLists(main.rosters)
        })
        return () => { isActive = false }
    }, [])

    const handleNew = () => navigate('/chooseGrandFaction')

    const handlePaste = () => navigate('/pasteList')

    const handleOpen = (list) => () => {
        hydrateRoster(list)
        notifyHydrateReport()
        navigationState.isBuilder = true
        navigate('/builder', {state: {faction: {id: list.faction_id, name: list.faction}}})
    }

    const handleDelete = async () => {
        const list = toDelete
        setToDelete(null)
        const response = await deleteRoster(list.id, main.user?.id)
        if (!response) {
            toast.error('Could not delete the list', Constants.toastParams)
            return
        }
        main.rosters = filter(main.rosters, item => item.id !== list.id)
        setLists(main.rosters)
        toast.success('List deleted', Constants.toastParams)
    }

    const renderList = (list) => {
        const army = find(dataBase.data.faction_keyword, ['id', list.faction_id])
        return <div className={Styles.listContainer} key={list.id}>
            <button type='button' className={Styles.closeIcon} onClick={() => setToDelete(list)} aria-label='Delete list'>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' aria-hidden='true'><path d='M6 6l12 12M18 6L6 18' /></svg>
            </button>
            <button type='button' className={Styles.button} onClick={handleOpen(list)}>
                {army?.moreInfoImage ? <img src={army.moreInfoImage} alt={army?.name} className={Styles.image} /> : <span className={Styles.image} />}
                <span className={Styles.textContainer}>
                    <span className={Styles.text}>{list.name}</span>
                    <span className={Styles.armyText}>{army?.name || list.faction}</span>
                </span>
            </button>
        </div>
    }

    const renderLimitNote = () => {
        if (includes(Constants.developersIds, main.tgId)) return null
        if (isSupporter(main.user)) {
            return <InfoNote title='Thank you for your support!'>No limit on saved lists until {formatSupportDate(getSupportUntil(main.user))}.</InfoNote>
        }
        return <InfoNote title={`You can save up to ${Constants.listsMax} army lists`}>
            <p className={Styles.limitText}>Support the app with any donation from 1 EUR and the limit is removed for a month.</p>
            <Button className={Styles.limitButton} onClick={openSupportPage}>Support the app</Button>
        </InfoNote>
    }

    return <div id='column' className='Chapter'>
        <Button className={Styles.newRosterButton} onClick={handleNew}>New List</Button>
        <Button className={Styles.newRosterButton} type='secondary' onClick={handlePaste}>Paste List</Button>
        {renderLimitNote()}
        <div className={Styles.buttonContainer}>{map(lists, renderList)}</div>
        <Modal visible={Boolean(toDelete)} title='Delete roster?' onClose={() => setToDelete(null)}>
            <p className={Styles.modalText}>{toDelete?.name}</p>
            <Button type='danger' className={Styles.newRosterButton} onClick={handleDelete}>Delete</Button>
            <Button type='secondary' className={Styles.newRosterButton} onClick={() => setToDelete(null)}>Cancel</Button>
        </Modal>
    </div>
}

export default UserLists
