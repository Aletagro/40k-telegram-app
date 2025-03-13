import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import Ability from '../components/Ability'
import RowImage from '../components/RowImage'

import Styles from './styles/ChooseEnhancement.module.css'

const dataBase = require('../dataBase.json')

const ChooseEnhancement = () => {
    const {
        data, type, unitIndex, regimentIndex, title, isInfo, isRosterInfo, isAuxiliary, isAdditionalOption, isRoRUnitWithKeyword
    } = useLocation().state
    const navigate = useNavigate()
    let _data = data
    let info = {}
    if (type === 'battleFormation') {
        const formationsRules = data.map(formation => dataBase.data.battle_formation_rule.filter((item) => item.battleFormationId === formation?.id))
        _data = data.map((formation, index) => {
            return {name: formation?.name, id: formation?.id, abilities: formationsRules[index]}
        })
    }
    if (type === 'spellsLore' || type === 'prayersLore') {
        const loresRules = data.map(lore => dataBase.data.lore_ability.filter((item) => item.loreId === lore?.id))
        _data = data.map((lore, index) => {
            return {name: lore?.name, id: lore?.id, abilities: loresRules[index]}
        })
        info = {
            abilityKeywordsName: 'lore_ability_keyword',
            abilityIdName: 'loreAbilityId'
        }
    }
    if (type === 'factionTerrain') {
        _data = data.map((terrain, index) => ({name: terrain?.name, id: terrain?.id}))
    }
    if (type === 'manifestationLore') {
        const lores = data.map(lore => dataBase.data.lore_ability.filter((item) => item.loreId === lore?.id))
        const units = lores.map(lore => lore.map(spell => dataBase.data.warscroll.find(warscroll => warscroll.id === spell.linkedWarscrollId)))
        _data = data.map((lore, index) => {
            return {name: lore?.name, id: lore?.id, abilities: units[index]}
        })
    }
    if (isAdditionalOption) {
        _data = dataBase.data.ability.filter(ability => ability.abilityGroupId === data.id)
    }

    const handleClickEnhancement = (enhancement) => {
        if (isRoRUnitWithKeyword) {
            const newUnit = {...roster.regimentsOfRenownUnits[unitIndex], [type]: enhancement.name}
            roster.regimentsOfRenownUnits[unitIndex] = newUnit
        } else if (isAuxiliary) {
            const newUnit = {...roster.auxiliaryUnits[unitIndex], [type]: enhancement.name}
            roster.auxiliaryUnits[unitIndex] = newUnit
        } else {
            const newUnit = {...roster.regiments[regimentIndex].units[unitIndex], [type]: enhancement.name}
            roster.regiments[regimentIndex].units[unitIndex] = newUnit
        }
        navigate(-1)
    }

    const handleClickBlock = (block) => () => {
        roster[type] = block.name
        if (type === 'manifestationLore') {
            roster.manifestationsList = block.abilities
        }
        navigate(-1)
    }

    const handleDeleteEnhancement = () => {
        if (isRosterInfo) {
            roster[type] = ''
            if (type === 'manifestationLore') {
                roster.manifestationsList = []
            }
        } else if (isRoRUnitWithKeyword) {
            const newUnit = {...roster.regimentsOfRenownUnits[unitIndex], [type]: ''}
            roster.regimentsOfRenownUnits[unitIndex] = newUnit
        } else if (isAuxiliary) {
            const newUnit = {...roster.auxiliaryUnits[unitIndex], [type]: ''}
            roster.auxiliaryUnits[unitIndex] = newUnit
        } else {
            const newUnit = {...roster.regiments[regimentIndex].units[unitIndex], [type]: ''}
            roster.regiments[regimentIndex].units[unitIndex] = newUnit
        }
        navigate(-1)
    }

    const handleGoBack = () => {
        navigate(-1)
    }

    const renderEnhancement = (enhancement) => <Ability
        key={enhancement.id}
        ability={enhancement}
        onClick={isRosterInfo ? undefined : handleClickEnhancement}
        {...info}
    />

    const renderManifestation = (manifestation) => <div key={manifestation.id} id={Styles.manifestation}>
        <RowImage src={manifestation.rowImage} alt={manifestation.name} />
        <b>{manifestation.name}</b>
    </div>

    const renderBlock = (block) => <button key={block.id} id={Styles.block} onClick={handleClickBlock(block)}>
        <p id={Styles.title}>{block.name}</p>
        {block.abilities?.map(type === 'manifestationLore' ? renderManifestation : renderEnhancement)}
    </button>

    return  <div id='column' className='Chapter'>
        {_data?.map(isRosterInfo ? renderBlock : renderEnhancement)}
        {isInfo
            ? <button id={Styles.delete} onClick={handleGoBack}>Back</button>
            : <button id={Styles.delete} onClick={handleDeleteEnhancement}>Delete {title}</button>
        }
    </div>
}

export default ChooseEnhancement