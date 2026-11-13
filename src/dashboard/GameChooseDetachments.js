import {t} from '../utilities/i18n'
import React, {useReducer} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'
import Constants from '../Constants'
import Button from '../components/Button'
import ImageCard from '../components/ImageCard'
import {gameDraft} from '../utilities/appState'
import {getForceDispositionOptions, getDetachmentKeywordConflict, getDetachmentPoints, getUsedDetachmentPoints} from '../utilities/rosterModel'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import without from 'lodash/without'
import sortBy from 'lodash/sortBy'

import Styles from './styles/Dashboard.module.css'
import BuilderStyles from '../builder/styles/Builder.module.css'

const dataBase = require('../utilities/db')

// Выбор детачментов для армии "вручную": лимит DP по размеру игры, нельзя брать детачи с общим ключевым словом
const GameChooseDetachments = () => {
    const navigate = useNavigate()
    const index = useLocation().state?.index ?? 0
    const [, forceUpdate] = useReducer(x => x + 1, 0)
    const manual = gameDraft.manual[index]
    if (!manual) return null

    const battleSize = find(dataBase.data.battle_size, ['id', manual.battleSizeId])
    const limit = battleSize?.detachmentPointsLimit || 0
    const used = getUsedDetachmentPoints(manual.detachmentIds)
    const detachments = sortBy(filter(map(filter(dataBase.data.detachment_faction_keyword, ['factionKeywordId', manual.factionId]), link => find(dataBase.data.detachment, ['id', link.detachmentId])), item => item && !item.isCombatPatrol), 'name')

    const apply = (ids) => {
        manual.detachmentIds = ids
        if (!find(getForceDispositionOptions(ids), ['id', manual.dispositionId])) manual.dispositionId = ''
        forceUpdate()
    }

    const handleToggle = (detachment) => () => {
        if (includes(manual.detachmentIds, detachment.id)) {
            apply(without(manual.detachmentIds, detachment.id))
            return
        }
        const conflict = getDetachmentKeywordConflict(detachment.id, manual.detachmentIds)
        if (conflict) {
            toast.warn(t('A detachment with the "{{keyword}}" keyword is already chosen: {{name}}', {keyword: conflict.keyword, name: conflict.detachment.name}), Constants.toastParams)
        } else if (used + getDetachmentPoints(detachment.id) > limit) {
            toast.warn(t('Not enough detachment points: {{count}} DP left', {count: limit - used}), Constants.toastParams)
        } else {
            apply([...manual.detachmentIds, detachment.id])
        }
    }

    return <div className={Styles.page}>
        <div className={BuilderStyles.dpInfo}>
            <span>{t('Detachment points')}</span>
            <b className={used > limit ? BuilderStyles.over : ''}>{used} / {limit} DP</b>
        </div>
        {map(detachments, detachment => {
            const isSelected = includes(manual.detachmentIds, detachment.id)
            const cost = getDetachmentPoints(detachment.id)
            return <ImageCard
                key={detachment.id}
                title={detachment.name}
                image={detachment.bannerImage || detachment.rowImage}
                badge={cost ? `${cost} DP` : undefined}
                selected={isSelected}
                disabled={!isSelected && (used + cost > limit || Boolean(getDetachmentKeywordConflict(detachment.id, manual.detachmentIds)))}
                onClick={handleToggle(detachment)}
                onAction={() => navigate('/detachment', {state: {title: detachment.name, detachment}})}
            />
        })}
        <div className={Styles.bottomBar}>
            <Button onClick={() => navigate(-1)}>{t('Done')}</Button>
        </div>
    </div>
}

export default GameChooseDetachments
