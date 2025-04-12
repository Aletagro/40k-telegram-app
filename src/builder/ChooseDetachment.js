import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import Info from '../icons/whiteInfo.svg'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'

import Styles from './styles/ChooseEnhancement.module.css'

const dataBase = require('../dataBase.json')

const ChooseDetachment = () => {
    const {detachments} = useLocation().state
    const navigate = useNavigate()

    const cleanEnhancements = (detachmentId) => {
        const enhancements = filter(dataBase.data.enhancement, ['detachmentId', detachmentId])
        forEach(roster.units['Character'], (unit, index) => {
            if (unit.enhancement) {
                const enhancementPoins = find(enhancements, ['name', roster.units[unit.unitType][index].enhancement])?.basePointsCost
                roster.units[unit.unitType][index].enhancement = ''
                roster.units[unit.unitType][index].points = roster.units[unit.unitType][index].points - enhancementPoins
                roster.points[unit.unitType] = roster.points[unit.unitType] - enhancementPoins
                roster.points.all = roster.points.all - enhancementPoins
            }
        })
    }

    const handleClickBlock = (detachment) => () => {
        if (roster.detachmentId && detachment.id !== roster.detachmentId) {
            cleanEnhancements(roster.detachmentId)
        }
        roster.detachmentId = detachment.id
        roster.detachment = detachment.name
        navigate(-1)
    }

    const handleDeleteDetachment = () => {
        if (roster.detachmentId) {
            cleanEnhancements(roster.detachmentId)
        }
        roster.detachmentId = ''
        roster.detachment = ''
        navigate(-1)
    }

    const handleClickEnhancementInfo = (detachment) => () => {
        navigate('/detachment', {state: {title: detachment.name, detachment}})
    }

    const handleGoBack = () => {
        navigate(-1)
    }

    const renderDetachment = (detachment) => <div key={detachment.id} id={Styles.block}>
        <button id={Styles.blockTitle} onClick={handleClickBlock(detachment)}>
            <p id={Styles.title}>{detachment.name}</p>
        </button>
        <img onClick={handleClickEnhancementInfo(detachment)} id={Styles.infoIcon} src={Info} alt="" />
    </div>

    return  <div id='column' className='Chapter'>
        {map(detachments, renderDetachment)}
        {roster.detachmentId
            ? <button id={Styles.delete} onClick={handleDeleteDetachment}>Delete Detachment</button>
            : <button id={Styles.delete} onClick={handleGoBack}>Back</button>
        }
    </div>
}

export default ChooseDetachment