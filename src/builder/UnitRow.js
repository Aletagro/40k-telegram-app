import React from 'react'
import {useNavigate} from 'react-router-dom'
import RowImage from '../components/RowImage'
import {roster} from '../utilities/appState'
import {getUnitPounts} from '../utilities/utils'
import Copy from '../icons/copy.svg'
import Close from '../icons/close.svg'
import Info from '../icons/info.svg'

import map from 'lodash/map'
import find from 'lodash/find'
import isNumber from 'lodash/isNumber'

import Styles from './styles/UnitRow.module.css'

const dataBase = require('../dataBase.json')

const UnitRow = ({
    unit, unitIndex, isAddUnit, onClick, onDelete, onCopy, withoutMargin, withoutCopy, factionId, isLimit, onChooseWarlord, onClearWarlord, isAllied
}) => {
    const isCharacter = unit.unitType === 'Character'
    const isEpicHero= unit.unitType === 'Epic Hero'
    const hasWargearOption = find(dataBase.data.wargear_option_group, wargearOptionGroup => wargearOptionGroup.datasheetId === unit.id && wargearOptionGroup.instructionText !== 'Default Wargear')
    const points = getUnitPounts(unit)

    const navigate = useNavigate()

    const handleClick = () => {
        if (onClick) {
            onClick(unit)
        }
    }

    const handleDelete = () => {
        if (onDelete) {
            onDelete(unit, unitIndex)
        }
    }

    const handleCopy = () => {
        if (onCopy) {
            onCopy(unit)
        }
    }

    const handleClickInfo = () => {
        navigate('/datasheet', {state: {title: unit.name, unit}})
    }

    const handleChooseWarlord = () => {
        onChooseWarlord(unit.unitType, unitIndex)
    }

    const handleClearWarlord = () => {
        onClearWarlord(unit.unitType, unitIndex)
    }

    const handleChooseWargearOptions = () => {
        navigate('/chooseWargear', {state: {title: 'Wargear Options', unit, unitIndex, isAllied}})
    }

    const handleChooseEnhancement = () => {
        navigate('/chooseEnhancement', {state: {title: 'Enhancement', unit, unitIndex}})
    }

    const renderWargear = (wargearCount, index) => wargearCount
        ? <p key={index} id={Styles.wargearText}>{isNumber(wargearCount) ? wargearCount : 1} x {index}</p>
        : null

    const renderWargearsGroup = (wargearsGroup, index) => <div key={index}>
        {map(wargearsGroup, renderWargear)}
    </div>

    const renderWargears = (wargears, index) => <div key={index} id={Styles.wargearsContainer}>
        <b id={Styles.miniature}>{unit.models[index]?.select} x {index}</b>
        {map(wargears, renderWargearsGroup)}
    </div>

    return <div id={withoutMargin ? Styles.rorContainer : Styles.container}>
        <div className={Styles.row}>
            <button id={Styles.addUnitButton} onClick={handleClick}>
                <RowImage src={unit.rowImage} alt={unit.name} />
                <div id={Styles.addUnitButtonSubContainer}>
                    <p id={Styles.name}>{unit.modelCount ? `${unit.modelCount * (unit.isReinforced ? 2 : 1)} ` : ''}{unit.name}</p>
                </div>
                <p id={Styles.price}>{points} pts</p>
            </button>
            {isAddUnit || isEpicHero || isLimit
                ? null
                : <button id={Styles.button} onClick={handleCopy}><img src={Copy} alt="" /></button>
            }
            {onDelete ? <button id={Styles.button} onClick={handleDelete}><img src={Close} alt="" /></button> : null}
            {isAddUnit ? <button id={Styles.infoButton} onClick={handleClickInfo}><img src={Info} alt="" /></button> : null}
        </div>
        {unit.wargears && !isAddUnit
            ? map(unit.wargears, renderWargears)
            : null
        }
        {isAddUnit
            ? null
            : <div id={Styles.wargearsContainer}>
                {isEpicHero || isCharacter
                    ? unit.isWarlord
                        ? <button id={Styles.warlordButton} onClick={handleClearWarlord}>
                            Warlord
                        </button>
                        : <button id={Styles.chooseWargearButton} onClick={handleChooseWarlord}>
                            Choose Warlord
                        </button>
                    : null
                }
                {hasWargearOption
                    ? <button id={Styles.chooseWargearButton} onClick={handleChooseWargearOptions}>
                        Wargear Options
                    </button>
                    : null
                }
                {isCharacter && roster.detachmentId
                    ? <button id={Styles.chooseWargearButton} onClick={handleChooseEnhancement}>
                        {unit.enhancement || 'Choose Enhancement'}
                    </button>
                    : null
                }
            </div>
        }
    </div>
}

export default UnitRow