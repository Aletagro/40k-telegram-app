import React, {useState} from 'react';
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Constants from '../Constants'
import {roster} from '../utilities/appState'
import {getErrors, getWarnings, getWoundsCount} from '../utilities/utils'

import map from 'lodash/map'
import size from 'lodash/size'
import isNumber from 'lodash/isNumber'

import Styles from './styles/Export.module.css'

// const unitsKeys =  ['id', 'name', 'points', 'isReinforced', 'heroicTrait', 'artefact', 'marksOfChaos', 'otherWarscrollOption', 'Ensorcelled Banners'] 

// const rorKeys =  ['id', 'name', 'regimentOfRenownPointsCost']

// const manifistationsKeys =  ['id', 'name']

const Export = () => {
    const [isCopy, setIsCopy] = useState(false)
    const errors = getErrors(roster)
    const warnings = getWarnings(roster)

    const getErrorText = (error) => `- ${error}`

    const getErrorsText = (_errors) => _errors.map(getErrorText).join('\n')

    const getWargearForExport = (wargearCount, index) => ` ${isNumber(wargearCount) ? wargearCount : 1} x ${index}`

    const getWargearsGroupForExport = (wargearsGroup) => `   ${map(wargearsGroup, getWargearForExport)}`

    const getWargearsForExport = (unit) => (wargears, index) => `  ${unit.models[index].select} x ${index}\n${map(wargears, getWargearsGroupForExport)}`

    const getUnitForExport = (unit) => `${unit.name} (${unit.points} points)\n${map(unit.wargears, getWargearsForExport(unit))}`

    const getUnitsTypeForExport = (units, index) => `${index}\n${map(units, getUnitForExport).join('\n')}\n----`

    const getUnitsTypesForExport = () => map(roster.units, getUnitsTypeForExport).join('\n')

    const handleExportList = () => {
        const rosterText = `${size(errors) ? `Roster errors:\n${getErrorsText(errors)}\n\n` : ''}${size(warnings) ? `Roster warnings:\n${getErrorsText(warnings)}\n\n` : ''}Grand Faction: ${roster.grandFaction}
Faction: ${roster.faction}
Detachment: ${roster.detachment}

-----
${getUnitsTypesForExport()}

Wounds: ${getWoundsCount(roster)}
${roster.points.all}/${roster.pointsLimit} Pts
`
        navigator.clipboard.writeText(rosterText)
        toast.success('List Copied', Constants.toastParams)
        setIsCopy(true)
    }

    // const pickKeys = (unit, keys) => {
    //     return keys.reduce((acc, key) => {
    //         if (unit.hasOwnProperty(key)) {
    //             acc[key] = unit[key];
    //         }
    //         return acc;
    //     }, {});
    // }

    // const getShortUnits = (units, keys) => map(units, (unit) => {
    //     return pickKeys(unit, keys)
    // })

    // const handleSaveList = () => {
    //     let newRosier = {...roster}
    //     const shortRegiments = map(newRosier.regiments, (regiment) => {
    //         const units = getShortUnits(regiment.units, unitsKeys)
    //         return {...regiment, units}
    //     })
    //     const shortAuxiliaries = getShortUnits(newRosier.auxiliaryUnits, unitsKeys)
    //     const shortRoRUnits = getShortUnits(newRosier.regimentsOfRenownUnits, unitsKeys)
    //     const shortRoR = newRosier.regimentOfRenown ? pickKeys(newRosier.regimentOfRenown, rorKeys) : null
    //     const shortManifestationsList = newRosier.manifestationsList ? getShortUnits(newRosier.manifestationsList, manifistationsKeys) : []
    //     const shortRoster = {
    //         ...roster,
    //         regiments: shortRegiments,
    //         auxiliaryUnits: shortAuxiliaries,
    //         regimentsOfRenownUnits: shortRoRUnits,
    //         regimentOfRenown: shortRoR,
    //         manifestationsList: shortManifestationsList,
    //         name: 'test name',
    //         isPublic: true
    //     }
    //     console.log(shortRoster)
    // }

    const renderWargear = (wargearCount, index) => wargearCount
        ? <div id={Styles.textContainer}>
            <p id={Styles.text}>{isNumber(wargearCount) ? wargearCount : 1} x {index}</p>
        </div>
        : null

    const renderWargearsGroup = (wargearsGroup) => <>
        {map(wargearsGroup, renderWargear)}
    </>

    const renderWargears = (unit) => (wargears, index) => <div id={Styles.textContainer}>
        <b id={Styles.text}>{unit.models[index].select} x {index}</b>
        {map(wargears, renderWargearsGroup)}
    </div>

    const renderUnit = (unit, index) => <div key={`${unit.id}-${index}`}>
        <p id={Styles.text}><b id={Styles.text}>{unit.modelCount ? `${unit.modelCount * (unit.isReinforced ? 2 : 1)} x` : ''} {unit.name}</b> ({unit.points || unit.regimentOfRenownPointsCost || 0} points)</p>
        {map(unit.wargears, renderWargears(unit))}
    </div>

    const renderUnitsType = (unitsType, index) => size(unitsType)
        ? <div key={index}>
            <p id={Styles.unitsType}>{index}</p>
            {map(unitsType, renderUnit)}
            <hr/>
        </div>
        : null

    // const renderError = (error, index) => <p id={Styles.error}>&#8226; {error}</p>

    // const renderWarning = (error, index) => <p  id={Styles.warning}>&#8226; {error}</p>

    return <div id={Styles.container}>
        {/* <div id={Styles.buttonContainer}>
            <button id={Styles.button} onClick={handleSaveList}>Save List</button>
        </div> */}
        <div id={Styles.buttonContainer}>
            <button id={Styles.button} onClick={handleExportList}>{isCopy ? 'List Copied' : 'Export List'}</button>
        </div>
        {/* {size(errors)
            ? <div id={Styles.errorsContainer}>
                <p id={Styles.error}>Roster errors:</p>
                {errors?.map(renderError)}
            </div>
            : null
        }
        {size(warnings)
            ? <div id={Styles.warningsContainer}>
                <p id={Styles.warning}>Roster warnings:</p>
                {warnings?.map(renderWarning)}
            </div>
            : null
        } */}
        <p id={Styles.text}>Grand Faction: {roster.grandFaction}</p>
        <p id={Styles.text}>Faction: {roster.faction}</p>
        <p id={Styles.text}>Detachment: {roster.detachment}</p>
        <hr/>
        {map(roster.units, renderUnitsType)}
        <p id={Styles.text}>Wounds: {getWoundsCount(roster)}</p>
        <p id={Styles.text}>{roster.points.all}/{roster.pointsLimit} Pts</p>
        <ToastContainer />
    </div>
}

export default Export
