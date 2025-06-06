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
    const detachmentsIds = filter(dataBase.data.detachment_faction_keyword, ['factionKeywordId', faction.id])
    const detachments = sortByName(map(detachmentsIds, item => find(dataBase.data.detachment, ['id', item.detachmentId])))
    const detachementCondition = find(dataBase.data.conditional_keyword, ['requiredDetachmentId', roster.detachmentId])
    const parentFactionId = find(dataBase.data.faction_keyword, ['id', faction.id])?.parentFactionKeywordId
    const parentCodexId = find(dataBase.data.publication, ['factionKeywordId', parentFactionId])?.id
    const unitsTypes = useMemo(() => getUnitsSortesByType(faction, codexInfo, detachementCondition, parentCodexId), [faction, codexInfo, detachementCondition, parentCodexId])
    let alliedFactionIds = filter(dataBase.data.faction_keyword_allied_faction, ['factionKeywordId', faction.id])
    if (size(alliedFactionIds)) {
        alliedFactionIds = filter(alliedFactionIds, item => !find(dataBase.data.allied_faction_required_detachment, ['alliedFactionId', item.alliedFactionId]))
    }

    const handleChooseDetachment = () => {
        navigate('/chooseDetachment', {state: {title: 'Detachments', detachments}})
    }

    const handleClickFaction = () => {
        let data = []
        if (codexInfo?.id) {
            data = filter(dataBase.data.army_rule, ['publicationId', codexInfo?.id])
        } else {
            const armyRulesIds = filter(dataBase.data.army_rule_faction_keyword, ['factionKeywordId', faction.id])
            data = map(armyRulesIds, rule => find(dataBase.data.army_rule, ['id', rule.armyRuleId]))
        }
        if (size(data)) {
            navigate('/armyRules', {state: {title: 'Army Rules', faction, data}})
        }
    }

    const handleOpenModal = () => {setOpen(true)}

    const handleCloseModal = () => {setOpen(false)}

    const handleClickPointsLimitButton = (limit) => () => {
        roster.pointsLimit = limit
        handleCloseModal()
    }

    const handleClickDetachmentInfo = () => {
        navigate('/detachment', {state: {title: roster.detachment, detachmentId: roster.detachmentId}})
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
                    <button id={Styles.detachmentButtonText} onClick={handleChooseDetachment}>
                        Detachment: {roster.detachment}
                    </button>
                    <img onClick={handleClickDetachmentInfo} id={Styles.detachmentInfoIcon} src={WhiteInfo} alt="" />
                </div>
                : <button id={Styles.detachmentButton} onClick={handleChooseDetachment}>
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