import React, {useState} from 'react'
import {toast} from 'react-toastify'
import Constants from '../Constants'
import {main, roster} from '../utilities/appState'
import {serializeRoster} from '../utilities/rosterModel'
import {createRoster, updateRoster} from '../utilities/api'
import Modal from '../components/Modal'
import Button from '../components/Button'
import ToggleRow from '../components/ToggleRow'

import get from 'lodash/get'

import Styles from './styles/Builder.module.css'

// Сохранение списка на сервер: окно с названием и публичностью. Общее для билдера и экспорта.
// Возвращает обработчик кнопки «Save» и окно, которое нужно вывести на экране
const useSaveList = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState(roster.name || '')
    const [isPublic, setIsPublic] = useState(roster.isPublic !== false)
    const [saveAsNew, setSaveAsNew] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handleOpen = () => {
        setName(roster.name || `${roster.faction} ${roster.pointsLimit}`)
        setIsOpen(true)
    }

    const handleClose = () => setIsOpen(false)

    const handleSave = async () => {
        setIsSaving(true)
        const data = serializeRoster({userId: main.user?.id, tgId: main.tgId, name, isPublic})
        const response = roster.id && !saveAsNew
            ? await updateRoster(roster.id, data)
            : await createRoster(data)
        setIsSaving(false)
        if (!response) {
            toast.error('Could not save the list', Constants.toastParams)
            return
        }
        roster.id = get(response, 'roster_id', roster.id)
        roster.name = name
        roster.isPublic = isPublic
        setIsOpen(false)
        toast.success('List Saved', Constants.toastParams)
    }

    const saveModal = <Modal visible={isOpen} title='Save Roster' onClose={handleClose}>
        <input className={Styles.field} value={name} onChange={event => setName(event.target.value)} placeholder='List Name' />
        <ToggleRow label='Save as public' hint='Other users will be able to see this list.' checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
        {roster.id ? <ToggleRow label='Save as new list' checked={saveAsNew} onChange={() => setSaveAsNew(!saveAsNew)} /> : null}
        <Button className={Styles.fullButton} disabled={!name || isSaving} onClick={handleSave}>Save</Button>
    </Modal>

    return {handleClickSaveButton: handleOpen, saveModal}
}

export default useSaveList
