import React, {useReducer} from 'react'
import WargearOptionGroup from './WargearOptionGroup'
import {roster} from '../utilities/appState'
import Plus from '../icons/whitePlus.svg'
import Minus from '../icons/whiteMinus.svg'
import WinterPlus from '../icons/winterPlus.svg'
import WinterMinus from '../icons/winterMinus.svg'

import map from 'lodash/map'
import forEach from 'lodash/forEach'
import isNumber from 'lodash/isNumber'

import Styles from './styles/MiniatureWargearOptions.module.css'

const MiniatureWargearOptions = ({wargearOptionGroup, unitData}) => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const models = roster.units[unitData.unitType][unitData.unitIndex].models[wargearOptionGroup.miniature.name]

    const handleClickMinus = () => {
        roster.units[unitData.unitType][unitData.unitIndex].models[wargearOptionGroup.miniature.name].select = roster.units[unitData.unitType][unitData.unitIndex].models[wargearOptionGroup.miniature.name].select - 1
        const wargears = roster.units[unitData.unitType][unitData.unitIndex].wargears[wargearOptionGroup.miniature.name].default
        forEach(wargears, (wargear, index) => {
            if (isNumber(wargear) && wargear > models.min) {
                roster.units[unitData.unitType][unitData.unitIndex].wargears[wargearOptionGroup.miniature.name].default[index] = wargear - 1
            }
        })
        forceUpdate()
    }

    const handleClickPlus = () => {
        roster.units[unitData.unitType][unitData.unitIndex].models[wargearOptionGroup.miniature.name].select = roster.units[unitData.unitType][unitData.unitIndex].models[wargearOptionGroup.miniature.name].select + 1
        const wargears = roster.units[unitData.unitType][unitData.unitIndex].wargears[wargearOptionGroup.miniature.name].default
        forEach(wargears, (wargear, index) => {
            if (isNumber(wargear)) {
                roster.units[unitData.unitType][unitData.unitIndex].wargears[wargearOptionGroup.miniature.name].default[index] = wargear + 1
            }
        })
        forceUpdate()
    }

    const renderWargearOptions = (wargearOption) => <WargearOptionGroup
        key={wargearOption.id}
        wargearOptionGroup={wargearOption}
        unitData={{...unitData, miniatureName: wargearOptionGroup.miniature.name}}
    />

    const renderStepper = () => {
        const disabledMinus = models.select === models.min
        const disabledPlus = models.select === models.max
        return <div id={Styles.countContainer}>
            {disabledMinus
                ? <button id={Styles.disabledButton} disabled={disabledMinus} onClick={handleClickMinus}><img src={WinterMinus} alt="" /></button>
                : <button id={Styles.button} onClick={handleClickMinus}><img src={Minus} alt="" /></button>
            }
            <p id={Styles.count}>{models.select}</p>
            {disabledPlus
                ? <button id={Styles.disabledButton} disabled={disabledPlus} onClick={handleClickPlus}><img src={WinterPlus} alt="" /></button>
                : <button id={Styles.button} onClick={handleClickPlus}><img src={Plus} alt="" /></button>
            }
        </div>
    }

    return <div>
        <div id={Styles.miniatureRow}>
            <p id={Styles.miniatureName}>{wargearOptionGroup.miniature.name}</p>
            {models.max > 1 ? renderStepper() : null}
        </div>
        {map(wargearOptionGroup.wargearOptions, renderWargearOptions)}
    </div>
}

export default MiniatureWargearOptions