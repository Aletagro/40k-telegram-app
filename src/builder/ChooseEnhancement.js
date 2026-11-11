import React from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import {updateUnit, getAvailableEnhancements} from '../utilities/rosterModel'
import Ability from '../components/Ability'
import Button from '../components/Button'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import forEach from 'lodash/forEach'

import Styles from './styles/Builder.module.css'

// Выбор энхансмента для персонажа
const ChooseEnhancement = () => {
    const {unit} = useLocation().state
    const navigate = useNavigate()
    const enhancements = getAvailableEnhancements(unit)
    const current = find(roster.units, ['uid', unit.uid])

    const handleChoose = (enhancement) => {
        // Один энхансмент нельзя взять дважды
        forEach(roster.units, item => {
            if (item.enhancementId === enhancement.id) updateUnit(item.uid, {enhancementId: ''})
        })
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
