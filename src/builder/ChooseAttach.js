import {t} from '../utilities/i18n'
import React from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import {updateUnit, addUnit, createUnit, getModelCount} from '../utilities/rosterModel'
import {getAttachTargets, findAttachGroup, getPossibleAttachDatasheets} from '../utilities/rosterValidation'
import {ListCard, ListItem, SectionTitle} from '../components/ListCard'
import Button from '../components/Button'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import sortBy from 'lodash/sortBy'
import compact from 'lodash/compact'

import Styles from './styles/Builder.module.css'

const dataBase = require('../utilities/db')

// Выбор отряда, к которому присоединяется лидер. Если подходящих отрядов в списке нет,
// предлагаем те, к которым лидер может присоединиться: выбранный отряд сразу добавляется в список
const ChooseAttach = () => {
    const {uid} = useLocation().state
    const navigate = useNavigate()
    const leader = find(roster.units, ['uid', uid])
    const targets = leader ? getAttachTargets(leader) : []
    const possible = leader && !size(targets)
        ? sortBy(compact(map(getPossibleAttachDatasheets(leader), id => find(dataBase.data.datasheet, ['id', id]))), 'name')
        : []

    const handleChoose = (target) => () => {
        updateUnit(uid, {attachedToUid: target.uid})
        navigate(-1)
    }

    const handleAddAndChoose = (datasheet) => () => {
        const unit = createUnit(datasheet.id)
        addUnit(unit)
        updateUnit(uid, {attachedToUid: unit.uid})
        navigate(-1)
    }

    const handleDetach = () => {
        updateUnit(uid, {attachedToUid: ''})
        navigate(-1)
    }

    const renderTarget = (target) => {
        const datasheet = find(dataBase.data.datasheet, ['id', target.datasheetId])
        const type = findAttachGroup(leader, target)?.bodyguardType
        const isCurrent = leader.attachedToUid === target.uid
        return <ListItem
            key={target.uid}
            title={datasheet?.name}
            subtitle={`${t('{{count}} model|{{count}} models', {count: getModelCount(target)})}${type === 'support' ? ` · ${t('support')}` : ''}${isCurrent ? ` · ${t('attached')}` : ''}`}
            image={datasheet?.rowImage}
            onClick={handleChoose(target)}
        />
    }

    const renderPossible = (datasheet) => <ListItem
        key={datasheet.id}
        title={datasheet.name}
        subtitle={t('Will be added to the list')}
        image={datasheet.rowImage}
        onClick={handleAddAndChoose(datasheet)}
    />

    return <div id='column' className='Chapter'>
        {size(targets)
            ? <ListCard>{map(targets, renderTarget)}</ListCard>
            : <>
                <p className={Styles.empty}>{t('There are no suitable units in the list yet. Choose one to add it and attach this character')}</p>
                {size(possible)
                    ? <>
                        <SectionTitle>{t('Can lead')}</SectionTitle>
                        <ListCard>{map(possible, renderPossible)}</ListCard>
                    </>
                    : null
                }
            </>
        }
        {leader?.attachedToUid
            ? <Button type='danger' className={Styles.fullButton} onClick={handleDetach}>{t('Detach')}</Button>
            : null
        }
    </div>
}

export default ChooseAttach
