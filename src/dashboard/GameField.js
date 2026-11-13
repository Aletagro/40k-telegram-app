import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import {getPreset, getPresetLabel} from './gameSetup'
import {getLayoutImage, getTwists} from './missionData'
import {TwistInfoModal} from './MissionPick'
import Button from '../components/Button'

import find from 'lodash/find'

import Styles from './styles/GameScreen.module.css'

// Вкладка поля боя: карта с разметкой и размерами (по нажатию на весь экран с увеличением), поворот
const GameField = ({game}) => {
    const [zoom, setZoom] = useState(false)
    const [big, setBig] = useState(true)
    const [twistInfo, setTwistInfo] = useState(null)
    const preset = getPreset(game.setup.presetId)
    const label = getPresetLabel(preset)
    const image = preset ? getLayoutImage(preset.missionLayoutId) : null
    const twist = find(getTwists(game.mode), ['id', game.setup.twistId])

    return <>
        <div className={Styles.card}>
            <h4 className={Styles.cardTitle}>{label || t('Battlefield')}</h4>
            {image
                ? <img className={Styles.mapImage} src={image} alt={label} onClick={() => setZoom(true)} />
                : <p className={Styles.muted}>{t('No map for this battlefield')}</p>}
            {image ? <p className={Styles.muted}>{t('Tap the map to open it full screen')}</p> : null}
        </div>
        {twist ? <div className={Styles.card}>
            <h4 className={Styles.cardTitle}>{t('Twist')}: {twist.name}</h4>
            <Button type='secondary' onClick={() => setTwistInfo(twist)}>{t('Show twist rules')}</Button>
        </div> : null}
        {zoom ? <div className={Styles.zoom}>
            <div className={Styles.zoomBar}>
                <span className={Styles.zoomTitle}>{label}</span>
                <button type='button' className={Styles.zoomClose} onClick={() => setBig(!big)}>{big ? t('Fit') : t('Zoom in')}</button>
                <button type='button' className={Styles.zoomClose} onClick={() => setZoom(false)}>{t('Close')}</button>
            </div>
            <div className={Styles.zoomScroll}>
                <img className={Styles.zoomImage} style={{width: big ? '260%' : '100%'}} src={image} alt={label} />
            </div>
        </div> : null}
        <TwistInfoModal twist={twistInfo} onClose={() => setTwistInfo(null)} />
    </>
}

export default GameField
