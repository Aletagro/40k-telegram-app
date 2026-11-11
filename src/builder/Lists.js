import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {main, navigationState} from '../utilities/appState'
import {fetchRostersByUser} from '../utilities/api'
import {hydrateRoster} from '../utilities/rosterModel'
import {ListCard, ListItem} from '../components/ListCard'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'

import Styles from './styles/Builder.module.css'

const dataBase = require('../utilities/db')

// Сохранённые списки пользователя. Данные приходят с бэкенда (rosters_db), пока он не готов - список пуст
const Lists = () => {
    const navigate = useNavigate()
    const [lists, setLists] = useState(null)

    useEffect(() => {
        let isActive = true
        fetchRostersByUser({user_id: main.user?.id, tgId: main.tgId}).then(data => {
            if (isActive) setLists(data?.rosters || data?.data || [])
        })
        return () => { isActive = false }
    }, [])

    const handleNew = () => navigate('/chooseGrandFaction')

    const handleOpen = (list) => () => {
        hydrateRoster(list)
        navigationState.isBuilder = true
        navigate('/builder', {state: {faction: {id: list.faction_id, name: list.faction}}})
    }

    const renderList = (list) => {
        const army = find(dataBase.data.faction_keyword, ['id', list.faction_id])
        return <ListItem
            key={list.id}
            title={list.name}
            subtitle={army?.name || list.faction}
            rightText={`${JSON.parse(list.points || '{}').all || 0} pts`}
            image={army?.rosterFactionImage}
            onClick={handleOpen(list)}
        />
    }

    return <div id='column' className='Chapter'>
        <div className={Styles.actions}>
            <button type='button' className={`${Styles.actionButton} ${Styles.primary}`} onClick={handleNew}>New Roster</button>
        </div>
        {lists === null
            ? <p className={Styles.empty}>Loading...</p>
            : size(lists)
                ? <ListCard>{map(lists, renderList)}</ListCard>
                : <p className={Styles.empty}>No saved rosters yet</p>
        }
    </div>
}

export default Lists
