import React, {useReducer} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import {syncRosterWithDetachment, getDetachmentKeywordConflict, getDetachmentPoints, getDetachmentPointsLimit, getUsedDetachmentPoints} from '../utilities/rosterModel'
import {toast} from 'react-toastify'
import Constants from '../Constants'
import ImageCard from '../components/ImageCard'
import Button from '../components/Button'

import map from 'lodash/map'
import without from 'lodash/without'
import includes from 'lodash/includes'

import Styles from './styles/Builder.module.css'

// Выбор детачментов. Размер игры задаёт лимит Detachment Points (DP), больше лимита выбрать нельзя
const ChooseDetachment = () => {
    const {detachments} = useLocation().state
    const navigate = useNavigate()
    const [, forceUpdate] = useReducer((x) => x + 1, 0)
    const limit = getDetachmentPointsLimit()
    const used = getUsedDetachmentPoints()

    const notifyRemoved = (removed) => {
        if (removed.length) toast.info(`Removed (not available in the chosen detachments): ${removed.join(', ')}`, {...Constants.toastParams, autoClose: 5000})
    }

    const apply = (ids) => {
        roster.detachmentIds = ids
        notifyRemoved(syncRosterWithDetachment())
        forceUpdate()
    }

    const handleToggle = (detachment) => () => {
        if (includes(roster.detachmentIds, detachment.id)) {
            apply(without(roster.detachmentIds, detachment.id))
        } else if (getDetachmentKeywordConflict(detachment.id)) {
            const {keyword, detachment: other} = getDetachmentKeywordConflict(detachment.id)
            toast.warn(`A detachment with the "${keyword}" keyword is already chosen: ${other.name}`, Constants.toastParams)
        } else if (used + getDetachmentPoints(detachment.id) > limit) {
            toast.warn(`Not enough detachment points: ${limit - used} DP left`, Constants.toastParams)
        } else {
            apply([...roster.detachmentIds, detachment.id])
        }
    }

    const handleClear = () => apply([])

    const handleInfo = (detachment) => () => navigate('/detachment', {state: {title: detachment.name, detachment}})

    return <div id='column' className='Chapter'>
        <div className={Styles.dpInfo}>
            <span>Detachment points</span>
            <b className={used > limit ? Styles.over : ''}>{used} / {limit} DP · {Math.max(limit - used, 0)} left</b>
        </div>
        {map(detachments, detachment => {
            const isSelected = includes(roster.detachmentIds, detachment.id)
            const cost = getDetachmentPoints(detachment.id)
            return <ImageCard
                key={detachment.id}
                title={detachment.name}
                image={detachment.bannerImage || detachment.rowImage}
                badge={cost ? `${cost} DP` : undefined}
                selected={isSelected}
                disabled={!isSelected && (used + cost > limit || Boolean(getDetachmentKeywordConflict(detachment.id)))}
                onClick={handleToggle(detachment)}
                onAction={handleInfo(detachment)}
            />
        })}
        {roster.detachmentIds.length
            ? <Button type='secondary' className={Styles.fullButton} onClick={handleClear}>Remove all detachments</Button>
            : null
        }
        {roster.detachmentIds.length
            ? <div className={Styles.doneBar}>
                <Button className={Styles.fullButton} onClick={() => navigate(-1)}>Done</Button>
            </div>
            : null
        }
    </div>
}

export default ChooseDetachment
