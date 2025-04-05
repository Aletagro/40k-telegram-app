import React, {useState} from 'react';
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Constants from '../Constants'
import {roster} from '../utilities/appState'
import {getErrors, getWarnings, getWoundsCount} from '../utilities/utils'

// import map from 'lodash/map'

import Styles from './styles/Export.module.css'

const additionalOptions = ['Ensorcelled Banners', 'First Circle Titles']

// const unitsKeys =  ['id', 'name', 'points', 'isReinforced', 'heroicTrait', 'artefact', 'marksOfChaos', 'otherWarscrollOption', 'Ensorcelled Banners'] 

// const rorKeys =  ['id', 'name', 'regimentOfRenownPointsCost']

// const manifistationsKeys =  ['id', 'name']

const Export = () => {
    const [isCopy, setIsCopy] = useState(false)
    const errors = getErrors(roster)
    const warnings = getWarnings(roster)

    const getErrorText = (error) => `- ${error}`

    const getErrorsText = (_errors) => _errors.map(getErrorText).join('\n')

    const getUnitForExport = (unit) => `${unit.modelCount ? `${unit.modelCount * (unit.isReinforced ? 2 : 1)} x` : ''} ${unit.name} (${unit.points || unit.regimentOfRenownPointsCost || 0} points)${unit.artefact ? `\n[Artefact]: ${unit.artefact}` : ''}${unit.heroicTrait ? `\n[Heroic Trait]: ${unit.heroicTrait}` : ''}${unit.weaponOptions ? `${getWeaponOptionsForExport(unit)}` : ''}${unit.marksOfChaos ? `\n• ${unit.marksOfChaos}` : ''}${unit['Ensorcelled Banners'] ? `\n• ${unit['Ensorcelled Banners']}` : ''}${unit.otherWarscrollOption ? `\n• ${unit.otherWarscrollOption}` : ''}`

    const getRoRUnitForExport = (unit) => `${unit.modelCount ? `${unit.modelCount} x` : ''} ${unit.name} ${unit.artefact ? `\n[Artefact]: ${unit.artefact}` : ''}${unit.heroicTrait ? `\n[Heroic Trait]: ${unit.heroicTrait}` : ''}${unit.weaponOptions ? `${getWeaponOptionsForExport(unit)}` : ''}${unit.marksOfChaos ? `\n• ${unit.marksOfChaos}` : ''}${unit['Ensorcelled Banners'] ? `\n• ${unit['Ensorcelled Banners']}` : ''}${unit.otherWarscrollOption ? `\n• ${unit.otherWarscrollOption}` : ''}`

    const getUnitsForExport = (units, isRoR) => units.map(isRoR ? getRoRUnitForExport : getUnitForExport).join('\n')

    const getWeaponForExport = ([key, value]) => value
        ? `\n• ${value} x ${key}`
        : ''

    const getWeaponOptionForExport = ([key, value]) => {
        return Object.entries(value).map(getWeaponForExport)
    }

    const getWeaponOptionsForExport = (unit) => {
        const text = Object.entries(unit.weaponOptions).map(getWeaponOptionForExport)
        return `${text}`.replace(/,/g, '')
    }

    const getRegimentForExport = (regiment, index) => `Regiment ${index + 1}\n${roster.warlordIndex === index ? "General's regiment\n" : ''}${regiment.units.map(getUnitForExport).join('\n')}\n----`

    const getRegimentsForExport = () => roster.regiments.map(getRegimentForExport).join('\n')

    const handleExportList = () => {
        const rosterText = `${errors.length > 0 ? `Roster errors:\n${getErrorsText(errors)}\n\n` : ''}${warnings.length > 0 ? `Roster warnings:\n${getErrorsText(warnings)}\n\n` : ''}Grand Alliance: ${roster.grandAlliance}
Faction: ${roster.allegiance}
Detachment: ${roster.detachment}
Drops: ${roster.regiments.length + roster.auxiliaryUnits.length + (roster.regimentOfRenown ? 1 : 0)}${roster.auxiliaryUnits.length > 0 ? `\nAuxiliaries: ${roster.auxiliaryUnits.length}` : ''}

${roster.spellsLore ? `Spell Lore: ${roster.spellsLore}` : ''}${roster.prayersLore ? `\nPrayer Lore: ${roster.prayersLore}` : ''}${roster.manifestationLore ? `\nManifestation Lore: ${roster.manifestationLore}` : ''}${roster.factionTerrain ? `\nFaction Terrain: ${roster.factionTerrain}` : ''}
-----
${getRegimentsForExport()}
${roster.regimentOfRenown ? `Regiment Of Renown\n${getUnitForExport(roster.regimentOfRenown)}\n` : ''}
${roster.regimentsOfRenownUnits.length > 0 ? `${getUnitsForExport(roster.regimentsOfRenownUnits, true)}\n-----` : ''}
${roster.auxiliaryUnits.length > 0 ? `Auxiliary Units\n${getUnitsForExport(roster.auxiliaryUnits)}\n-----` : ''}
Wounds: ${getWoundsCount(roster)}
${roster.points}/${roster.pointsLimit} Pts
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

    const renderWeapon = ([key, value]) => value
        ? <p>&#8226; {value} x {key}</p>
        : null

    const renderWeaponOption = ([key, value]) => {
        return Object.entries(value).map(renderWeapon)
    }

    const renderWeaponOptions = (weaponOptions) => Object.entries(weaponOptions).map(renderWeaponOption)

    const renderAdditionalOption = (unit) => (additionalOption) =>
        unit[additionalOption] ? <p>&#8226; {additionalOption}: {unit[additionalOption]}</p> : null

    const renderUnit = (unit, index) => <div key={`${unit.id}-${index}`}>
        <p><b>{unit.modelCount ? `${unit.modelCount * (unit.isReinforced ? 2 : 1)} x` : ''} {unit.name}</b> ({unit.points || unit.regimentOfRenownPointsCost || 0} points)</p>
        {unit.artefact ? <p>&#8226; {unit.artefact}</p> : null}
        {unit.heroicTrait ? <p>&#8226; {unit.heroicTrait}</p> : null}
        {unit.weaponOptions ? renderWeaponOptions(unit.weaponOptions) : null}
        {unit.marksOfChaos ? <p>&#8226; Mark Of Chaos: {unit.marksOfChaos}</p> : null}
        {additionalOptions.map(renderAdditionalOption(unit))}
        {unit.otherWarscrollOption ? <p>&#8226; {unit.otherWarscrollOption}</p> : null}
    </div>

    const renderRegimentsOfRenownUnit = (unit) => <div>
        <p>{unit.modelCount ? `${unit.modelCount} x` : ''} {unit.name}</p>
        {unit.artefact ? <p>&#8226; {unit.artefact}</p> : null}
        {unit.heroicTrait ? <p>&#8226; {unit.heroicTrait}</p> : null}
        {unit.otherWarscrollOption ? <p>&#8226; {unit.otherWarscrollOption}</p> : null}
    </div>

    const renderRegiment = (regiment, index) => <div key={index}>
        <p>Regiment {index + 1}</p>
        {regiment.units.map(renderUnit)}
    </div>

    const renderError = (error, index) => <p id={Styles.error}>&#8226; {error}</p>

    const renderWarning = (error, index) => <p  id={Styles.warning}>&#8226; {error}</p>

    return <div id={Styles.container}>
        {/* <div id={Styles.buttonContainer}>
            <button id={Styles.button} onClick={handleSaveList}>Save List</button>
        </div> */}
        <div id={Styles.buttonContainer}>
            <button id={Styles.button} onClick={handleExportList}>{isCopy ? 'List Copied' : 'Export List'}</button>
        </div>
        {errors.length > 0
            ? <div id={Styles.errorsContainer}>
                <p id={Styles.error}>Roster errors:</p>
                {errors?.map(renderError)}
            </div>
            : null
        }
        {warnings.length > 0
            ? <div id={Styles.warningsContainer}>
                <p id={Styles.warning}>Roster warnings:</p>
                {warnings?.map(renderWarning)}
            </div>
            : null
        }
        <p>Grand Alliance: {roster.grandAlliance}</p>
        <p>Faction: {roster.allegiance}</p>
        <p>Detachment: {roster.detachment}</p>
        <p>Drops: {roster.regiments.length + roster.auxiliaryUnits.length + (roster.regimentOfRenown ? 1 : 0)}</p>
        {roster.auxiliaryUnits.length > 0 ? <p>Auxiliaries: {roster.auxiliaryUnits.length}</p> : null}
        <br/>
        {roster.spellsLore ? <p>Spell Lore: {roster.spellsLore}</p> : null}
        {roster.prayersLore ? <p>Prayer Lore: {roster.prayersLore}</p> : null}
        {roster.manifestationLore ? <p>Manifestation Lore: {roster.manifestationLore}</p> : null}
        {roster.factionTerrain ? <p>Faction Terrain: {roster.factionTerrain}</p> : null}
        <hr/>
        {roster.regiments.map(renderRegiment)}
        <hr/>
        {roster.auxiliaryUnits.length > 0
            ? <div>
                <p>Auxiliary Units</p>
                {roster.auxiliaryUnits.map(renderUnit)}
                <hr/>
            </div>
            : null
        }
        {roster.regimentOfRenown
            ? <div>
                <p>Regiment Of Renown</p>
                {renderUnit(roster.regimentOfRenown)}
                {roster.regimentsOfRenownUnits?.map(renderRegimentsOfRenownUnit)}
                <hr/>
            </div>
            : null
        }
        <p>Wounds: {getWoundsCount(roster)}</p>
        {roster.regimentsOfRenownUnits?.length > 1 ? <h6 id={Styles.note}>The number of wounds may contain an error due to Regiment Of Renown</h6> : null}
        <p>{roster.points}/{roster.pointsLimit} Pts</p>
        <ToastContainer />
    </div>
}

export default Export
