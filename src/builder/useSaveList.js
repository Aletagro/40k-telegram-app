import {t} from '../utilities/i18n'
import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'
import Constants from '../Constants'
import {main, roster} from '../utilities/appState'
import {serializeRoster} from '../utilities/rosterModel'
import {createRoster, updateRoster, fetchRostersByUser, deleteRoster} from '../utilities/api'
import {hasListsLimit, openSupportPage} from '../utilities/support'
import Modal from '../components/Modal'
import Button from '../components/Button'
import ToggleRow from '../components/ToggleRow'

import get from 'lodash/get'
import map from 'lodash/map'
import size from 'lodash/size'
import filter from 'lodash/filter'

import Styles from './styles/Builder.module.css'

// Сохранение списка на сервер: окно с названием и публичностью. Общее для билдера и экспорта.
// Возвращает обработчик кнопки «Save» и окно, которое нужно вывести на экране
const useSaveList = () => {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState(roster.name || '')
    const [isPublic, setIsPublic] = useState(roster.isPublic !== false)
    const [saveAsNew, setSaveAsNew] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [rostersCount, setRostersCount] = useState(size(main.rosters))

    const openModal = () => {
        setName(roster.name || `${roster.faction} ${roster.pointsLimit}`)
        setIsOpen(true)
    }

    // Сохранять списки могут только зарегистрированные: сначала регистрация, после неё окно открывается само
    const handleOpen = () => {
        if (!main.user?.id) {
            navigate('/registration')
            return
        }
        openModal()
    }

    // Свежий список сохранённых нужен для лимита
    useEffect(() => {
        fetchRostersByUser().then(data => {
            if (data?.rosters) {
                main.rosters = data.rosters
                setRostersCount(size(data.rosters))
            }
        })
    }, [])

    useEffect(() => {
        if (main.showSaveListModal) {
            main.showSaveListModal = false
            openModal()
        }
    // eslint-disable-next-line
    }, [])

    const handleClose = () => setIsOpen(false)

    const handleSave = async () => {
        setIsSaving(true)
        const data = serializeRoster({userId: main.user?.id, name, isPublic})
        const response = roster.id && !saveAsNew
            ? await updateRoster(roster.id, data)
            : await createRoster(data)
        setIsSaving(false)
        if (!response) {
            toast.error(t('Could not save the list'), Constants.toastParams)
            return
        }
        roster.id = get(response, 'roster_id', roster.id)
        roster.name = name
        roster.isPublic = isPublic
        setIsOpen(false)
        toast.success(t('List Saved'), Constants.toastParams)
    }

    const isListsLimit = rostersCount >= Constants.listsMax && !roster.id && hasListsLimit(main.user, main.tgId)

    const handleDeleteList = (list) => async () => {
        const response = await deleteRoster(list.id, main.user?.id)
        if (!response) {
            toast.error(t('Could not delete the list'), Constants.toastParams)
            return
        }
        main.rosters = filter(main.rosters, item => item.id !== list.id)
        setRostersCount(size(main.rosters))
        toast.success(t('List deleted'), Constants.toastParams)
    }

    const limitContent = <>
        <p className={Styles.hint}>{t('You can delete one of your lists or support the app from 1 EUR to remove the limit for a month.')}</p>
        <Button className={Styles.fullButton} onClick={openSupportPage}>{t('Support the app')}</Button>
        {map(main.rosters, list => <Button key={list.id} type='secondary' className={Styles.fullButton} onClick={handleDeleteList(list)}>Delete: {list.name}</Button>)}
    </>

    const saveModal = <Modal visible={isOpen} title={isListsLimit ? t('You have reached limit of saved lists') : t('Save Roster')} onClose={handleClose}>
        {isListsLimit
            ? limitContent
            : <>
                <input className={Styles.field} value={name} onChange={event => setName(event.target.value)} placeholder={t('List Name')} />
                <ToggleRow label={t('Save as public')} hint={t('Other users will be able to see this list.')} checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
                {roster.id ? <ToggleRow label={t('Save as new list')} checked={saveAsNew} onChange={() => setSaveAsNew(!saveAsNew)} /> : null}
                <Button className={Styles.fullButton} disabled={!name || isSaving} onClick={handleSave}>{t('Save')}</Button>
            </>
        }
    </Modal>

    return {handleClickSaveButton: handleOpen, saveModal}
}

export default useSaveList
