import React from 'react'
import {useNavigate} from 'react-router-dom'
import RowImage from '../components/RowImage'
import Copy from '../icons/copy.svg'
import Close from '../icons/close.svg'
import Plus from '../icons/plus.svg'
import Minus from '../icons/minus.svg'
import DarkGeneral from '../icons/darkGeneral.svg'
import Info from '../icons/info.svg'

import Styles from './styles/UnitRow.module.css'

const UnitRow = ({
    unit, unitIndex, isCharacter, isEpicHero, isAddUnit, onClick, onDelete, onCopy, onReinforced, withoutMargin, withoutCopy, isGeneral, factionId, isLimit
}) => {
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

    return <div id={withoutMargin ? Styles.rorContainer : Styles.container}>
        <div className={Styles.row}>
            <button id={Styles.addUnitButton} onClick={handleClick}>
                <RowImage src={unit.rowImage} alt={unit.name} />
                <div id={Styles.addUnitButtonSubContainer}>
                    {isGeneral ? <img id={Styles.generalIcon} src={DarkGeneral} alt=''/> : null}
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
    </div>
}

export default UnitRow