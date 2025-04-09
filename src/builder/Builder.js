import React, {useReducer, useState, useMemo} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import Modal from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import {roster} from '../utilities/appState'
import UnitsType from './UnitsType'
import {getWoundsCount, sortByName, getUnitsSortesByType} from '../utilities/utils'
import WhiteInfo from '../icons/whiteInfo.svg'

import map from 'lodash/map'
import size from 'lodash/size'
import find from 'lodash/find'
import filter from 'lodash/filter'
import includes from 'lodash/includes'

import Styles from './styles/Builder.module.css'

const dataBase = require('../dataBase.json')

const pointsLimits = ['1000', '2000', '3000']

const Builder = () => {
    const {faction} = useLocation().state
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const codexInfo = find(dataBase.data.publication, publication => publication.factionKeywordId === faction.id && !publication.isCombatPatrol && !includes(publication.name, 'Imperial Armour'))
    const detachments = sortByName(filter(dataBase.data.detachment, ['publicationId', codexInfo.id]))
    const detachementCondition = find(dataBase.data.conditional_keyword, ['requiredDetachmentId', roster.detachmentId])
    const unitsTypes = useMemo(() => getUnitsSortesByType(faction, codexInfo, detachementCondition), [faction, codexInfo, detachementCondition])
    const alliedFactionIds = filter(dataBase.data.faction_keyword_allied_faction, ['factionKeywordId', faction.id])

    const handleChooseEnhancement = (name, type, data, isInfo) => () => {
        navigate('/chooseEnhancement', {state: {title: name, data, type, isRosterInfo: true, isInfo}})
    }

    const handleClickFaction = () => {
        const data = filter(dataBase.data.army_rule, ['publicationId', codexInfo.id])
        navigate('/armyRules', {state: {title: 'Army Rules', faction, data}})
    }

    const handleOpenModal = () => {setOpen(true)}

    const handleCloseModal = () => {setOpen(false)}

    const handleClickPointsLimitButton = (limit) => () => {
        roster.pointsLimit = limit
        handleCloseModal()
    }

    const handleClickDetachmentInfo = () => {
        navigate('/detachment', {state: {detachmentId: roster.detachmentId}})
    }
        
    const renderPointsLimitButton = (limit) => <button key={limit} id={Styles.pointsLimitButton} onClick={handleClickPointsLimitButton(limit)}>{limit} Points</button>

    const renderModalContent = () => <>
        <b id={Styles.pointsLimitTitle}>Points Limit</b>
        {pointsLimits.map(renderPointsLimitButton)}
    </>

    const renderUnitsType = (unitsType, index) => <UnitsType
        key={index}
        unitsType={unitsType}
        factionId={faction.id}
        forceUpdate={forceUpdate}
    />

    const renderAlliedUnits = (unitsType, index) => <UnitsType
        key={index}
        unitsType={{title: 'Allied Units'}}
        factionId={faction.id}
        forceUpdate={forceUpdate}
        alliedFactionIds={alliedFactionIds}
        isAllied
    />

    return <div id='column' className='Chapter'>
        <button id={Styles.mainInfoContainer} onClick={handleClickFaction}>
            <div id={Styles.allegianceContainer}>
                <p id={Styles.text}>Grand Faction: <b id={Styles.text}>{roster.grandFaction}</b></p>
                <img id={Styles.infoIcon} src={WhiteInfo} alt="" />
            </div>
            <p id={Styles.text}>Faction: <b id={Styles.text}>{roster.faction}</b></p>
            <p id={Styles.text}>Wounds: {getWoundsCount(roster)}</p>
        </button>
        <button onClick={handleOpenModal} id={Styles.pointsContainer}>
            <p id={Styles.pointsTitle}>Army: {roster.points.all}/{roster.pointsLimit} Points</p>
            <img id={Styles.pointsTitleInfoIcon} src={WhiteInfo} alt="" />
        </button>
        {size(detachments)
            ? roster.detachment 
                ? <div id={Styles.detachmentSecondButton}>
                    <button id={Styles.detachmentButtonText} onClick={handleChooseEnhancement('Detachment', 'detachment', detachments)}>
                        Detachment: {roster.detachment}
                    </button>
                    <img onClick={handleClickDetachmentInfo} id={Styles.detachmentInfoIcon} src={WhiteInfo} alt="" />
                </div>
                : <button id={Styles.detachmentButton} onClick={handleChooseEnhancement('Detachment', 'detachment', detachments)}>
                    Choose Detachment
                </button>
            : null
        }
        <p id={Styles.unitsLabel}>Units</p>
        {map(unitsTypes, renderUnitsType)}
        {size(alliedFactionIds) && renderAlliedUnits()}
        <Modal open={open} onClose={handleCloseModal}>
            <ModalDialog layout="center">
                {renderModalContent()}
            </ModalDialog>
        </Modal>
    </div>
}

export default Builder