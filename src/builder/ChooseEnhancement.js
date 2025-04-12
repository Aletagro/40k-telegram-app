import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import {sortByName} from '../utilities/utils'
import Ability from '../components/Ability'

import Styles from './styles/ChooseEnhancement.module.css'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'
import includes from 'lodash/includes'

const dataBase = require('../dataBase.json')

const ChooseEnhancement = () => {
    const {unit, unitIndex} = useLocation().state
    const navigate = useNavigate()
    const unitType = unit.unitType
    const enhancements = sortByName(filter(dataBase.data.enhancement, ['detachmentId', roster.detachmentId]), 'displayOrder')
    const miniature = sortByName(filter(dataBase.data.miniature, ['datasheetId', unit.id]), 'displayOrder')[0]
    const miniatureKeywords = sortByName(filter(dataBase.data.miniature_keyword, ['miniatureId', miniature.id]), 'displayOrder')
    const keywords = map(miniatureKeywords, keyword => find(dataBase.data.keyword, ['id', keyword.keywordId])?.id)

    const handleClickEnhancement = (enhancement) => {
        roster.units[unitType][unitIndex].enhancement = enhancement.name
        roster.units[unitType][unitIndex].points = roster.units[unitType][unitIndex].points + enhancement.basePointsCost
        roster.points[unitType] = roster.points[unitType] + enhancement.basePointsCost
        roster.points.all = roster.points.all + enhancement.basePointsCost
        navigate(-1)
    }

    const handleDeleteEnhancement = () => {
        const enhancementPoins = find(enhancements, ['name', roster.units[unitType][unitIndex].enhancement])?.basePointsCost
        roster.units[unitType][unitIndex].enhancement = ''
        roster.units[unitType][unitIndex].points = roster.units[unitType][unitIndex].points - enhancementPoins
        roster.points[unitType] = roster.points[unitType] - enhancementPoins
        roster.points.all = roster.points.all - enhancementPoins
        navigate(-1)
    }

    const handleGoBack = () => {
        navigate(-1)
    }

    const renderEnhancement = (enhancement) => {
        const excludedKeywordsGroups = filter(dataBase.data.enhancement_required_keyword_group, ['enhancementId', enhancement.id])
        const enhancementRequiredKeywordGroupKeywords = map(excludedKeywordsGroups, enhancementKeyword => filter(dataBase.data.enhancement_required_keyword_group_keyword, ['enhancementRequiredKeywordGroupId', enhancementKeyword.id]))
        const excludedKeywords = map(enhancementRequiredKeywordGroupKeywords, data => map(data, item => find(dataBase.data.keyword, ['id', item.keywordId])?.id))
        let isShow = false
        if (size(excludedKeywords) === 1) {
            if (size(excludedKeywords[0])) {
                // Проверяем что у юнита есть все нужные кейворды, ищем тот, которого нет
                const withoutKeyword = find(excludedKeywords[0], item => !includes(keywords, item))
                // Если все кейворды есть, то показываем
                if (!withoutKeyword) {
                    isShow = true
                }
            // Если нет запрещающих кейвордов, то показываем
            } else {
                isShow = true
            }
        // Проверяем, что есть хотя бы один из нужных кейвордов
        } else {
            let withKeyword = false
            forEach(excludedKeywords, data => {
                if (includes(keywords, data[0])) {
                    withKeyword = true
                }
            })
            // Если кейворд есть, то показываем
            if (withKeyword) {
                isShow = true
            }
        }
        if (isShow) {
            return <Ability
                key={enhancement.id}
                ability={enhancement}
                isEnchancement
                onClick={handleClickEnhancement}
            />
        }
        return null
    }

    return  <div id='column' className='Chapter'>
        {map(enhancements, renderEnhancement)}
        {roster.units[unitType][unitIndex].enhancement
            ? <button id={Styles.delete} onClick={handleDeleteEnhancement}>Delete Enhancement</button>
            : <button id={Styles.delete} onClick={handleGoBack}>Back</button>
        }
    </div>
}

export default ChooseEnhancement