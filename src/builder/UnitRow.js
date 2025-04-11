import React from 'react'
import {useNavigate} from 'react-router-dom'
import RowImage from '../components/RowImage'
import {roster} from '../utilities/appState'
import Copy from '../icons/copy.svg'
import Close from '../icons/close.svg'
import Plus from '../icons/plus.svg'
import Minus from '../icons/minus.svg'
import Info from '../icons/info.svg'

import map from 'lodash/map'
import find from 'lodash/find'
import isNumber from 'lodash/isNumber'

import Styles from './styles/UnitRow.module.css'

const dataBase = require('../dataBase.json')

const UnitRow = ({
    unit, unitIndex, isAddUnit, onClick, onDelete, onCopy, onReinforced, withoutMargin, withoutCopy, factionId, isLimit, onChooseWarlord
}) => {
    const isCharacter = unit.unitType === 'Character'
    const isEpicHero= unit.unitType === 'Epic Hero'
    const hasWargearOption = find(dataBase.data.wargear_option_group, wargearOptionGroup => wargearOptionGroup.datasheetId === unit.id && wargearOptionGroup.instructionText !== 'Default Wargear')

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

    const handleReinforced = () => {
        if (onReinforced) {
            onReinforced(unit, unitIndex)
        }
    }

    const handleClickInfo = () => {
        navigate('/datasheet', {state: {title: unit.name, unit}})
    }

    const handleChooseWarlord = () => {
        onChooseWarlord(unit.id)
    }

    const handleClearWarlord = () => {
        onChooseWarlord('')
    }

    const handleChooseWargearOptions = () => {
        navigate('/chooseWargear', {state: {
            title: 'Wargear Options',
            unit,
            unitIndex
        }})
    }

    const renderWargear = (wargearCount, index) => wargearCount
        ? <p id={Styles.wargearText}>{isNumber(wargearCount) ? wargearCount : 1} x {index}</p>
        : null

    const renderWargearsGroup = (wargearsGroup) => <>
        {map(wargearsGroup, renderWargear)}
    </>

    const renderWargears = (wargears, index) => <div key={index} id={Styles.wargearsContainer}>
        <b id={Styles.miniature}>{unit.models[index].select} x {index}</b>
        {map(wargears, renderWargearsGroup)}
    </div>

    return <div id={withoutMargin ? Styles.rorContainer : Styles.container}>
        <div className={Styles.row}>
            <button id={Styles.addUnitButton} onClick={handleClick}>
                <RowImage src={unit.rowImage} alt={unit.name} />
                <div id={Styles.addUnitButtonSubContainer}>
                    <p id={Styles.name}>{unit.modelCount ? `${unit.modelCount * (unit.isReinforced ? 2 : 1)} ` : ''}{unit.name}</p>
                </div>
                <p id={Styles.price}>{unit.points || unit.regimentOfRenownPointsCost || 0} pts</p>
            </button>
            {isAddUnit || isEpicHero || isCharacter
                ? null
                : unit.isReinforced
                    ? <button id={Styles.button} onClick={handleReinforced}><img src={Minus} alt="" /></button>
                    : <button id={Styles.button} onClick={handleReinforced}><img src={Plus} alt="" /></button>
            }
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
                    ? roster.warlordId === unit.id
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
            </div>
        }
    </div>
}

export default UnitRow