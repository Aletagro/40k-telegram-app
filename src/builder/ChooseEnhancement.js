import React from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import {updateUnit, getAvailableEnhancements} from '../utilities/rosterModel'
import {toast} from 'react-toastify'
import Constants from '../Constants'
import Ability from '../components/Ability'
import Button from '../components/Button'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import forEach from 'lodash/forEach'
import filter from 'lodash/filter'

import Styles from './styles/Builder.module.css'

// Выбор энхансмента для персонажа
const ChooseEnhancement = () => {
    const {unit} = useLocation().state
    const navigate = useNavigate()
    const enhancements = getAvailableEnhancements(unit)
    const current = find(roster.units, ['uid', unit.uid])

    const handleChoose = (enhancement) => {
        const limit = enhancement.limit || 1
        const others = filter(roster.units, item => item.enhancementId === enhancement.id && item.uid !== unit.uid)
        if (limit === 1) {
            // Энхансмент с лимитом 1 переходит от прежнего владельца
            forEach(others, item => updateUnit(item.uid, {enhancementId: ''}))
        } else if (size(others) >= limit) {
            toast.warn(`${enhancement.name} can be taken only ${limit} times`, Constants.toastParams)
            return
        }
        updateUnit(unit.uid, {enhancementId: enhancement.id})
        navigate(-1)
    }

    const handleDelete = () => {
        updateUnit(unit.uid, {enhancementId: ''})
        navigate(-1)
    }

    return <div id='column' className='Chapter'>
        {size(enhancements)
            ? map(enhancements, enhancement => <Ability key={enhancement.id} ability={enhancement} isEnchancement onClick={handleChoose} />)
            : <p className={Styles.empty}>No enhancements available for this unit in the chosen detachment</p>
        }
        {current?.enhancementId
            ? <Button type='danger' className={Styles.fullButton} onClick={handleDelete}>Remove Enhancement</Button>
            : null
        }
    </div>
}

export default ChooseEnhancement
