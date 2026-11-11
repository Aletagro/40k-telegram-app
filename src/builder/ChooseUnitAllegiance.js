import React from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import {setUnitAllegiance, getUnitAllegianceSelect} from '../utilities/rosterModel'
import Button from '../components/Button'
import {replaceAsterisks} from '../utilities/utils'

import map from 'lodash/map'
import find from 'lodash/find'

import Styles from './styles/Builder.module.css'

// Выбор способности лояльности для конкретного юнита (по аналогии с выбором энхансмента)
const ChooseUnitAllegiance = () => {
    const {uid} = useLocation().state
    const navigate = useNavigate()
    const unit = find(roster.units, ['uid', uid])
    const select = unit ? getUnitAllegianceSelect(unit) : undefined

    const handleChoose = (ability) => () => {
        setUnitAllegiance(uid, ability.id)
        navigate(-1)
    }

    const handleDelete = () => {
        setUnitAllegiance(uid, '')
        navigate(-1)
    }

    return <div id='column' className='Chapter'>
        {select
            ? map(select.abilities, ability => <button
                key={ability.id}
                type='button'
                className={`${Styles.allegiance} ${unit.allegianceAbilityId === ability.id ? Styles.chosen : ''}`}
                onClick={handleChoose(ability)}
            >
                <b>{ability.name}</b>
                <span>{replaceAsterisks(ability.rules)}</span>
            </button>)
            : <p className={Styles.empty}>Nothing to choose for this unit</p>
        }
        {unit?.allegianceAbilityId
            ? <Button type='danger' className={Styles.fullButton} onClick={handleDelete}>{select?.isChoice ? 'Clear choice' : 'Remove selection'}</Button>
            : null
        }
    </div>
}

export default ChooseUnitAllegiance
