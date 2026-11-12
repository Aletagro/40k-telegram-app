import React from 'react'
import {t} from '../utilities/i18n'

import Styles from './styles/Splash.module.css'

// Экран загрузки базы данных: индикатор по доле скачанного, при ошибке - кнопка повтора
const Splash = ({progress, hasError, onRetry}) => <div className={Styles.splash}>
    <p className={Styles.title}>Warhammer 40K</p>
    {hasError
        ? <>
            <p className={Styles.text}>{t('Could not load the game data. Check your connection and try again.')}</p>
            <button type='button' className={Styles.button} onClick={onRetry}>{t('Try again')}</button>
        </>
        : <>
            <p className={Styles.text}>{t('Loading game data…')} {Math.round(progress * 100)}%</p>
            <div className={Styles.bar}><div className={Styles.fill} style={{width: `${Math.round(progress * 100)}%`}} /></div>
        </>
    }
</div>

export default Splash
