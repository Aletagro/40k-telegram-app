import React from 'react'
import Button from './Button'
import {main} from '../utilities/appState'
import {getSupportUntil, isSupporter, formatSupportDate, openSupportPage} from '../utilities/support'

import Styles from './styles/SupportCard.module.css'

// Карточка поддержки проекта. Для подписчика показывает благодарность и срок, для остальных - что даёт поддержка
const SupportCard = () => {
    if (isSupporter(main.user)) {
        return <div className={`${Styles.card} ${Styles.thanks}`}>
            <p className={Styles.title}>Thank you for your support!</p>
            <p className={Styles.text}>No limit on saved lists until {formatSupportDate(getSupportUntil(main.user))}.</p>
            <Button className={Styles.button} type='secondary' onClick={openSupportPage}>Support again</Button>
        </div>
    }

    return <div className={Styles.card}>
        <p className={Styles.title}>Support the project</p>
        <p className={Styles.text}>The app is free and runs on donations. Any donation from 1 EUR removes the limit on saved lists for a month.</p>
        <Button className={Styles.button} onClick={openSupportPage}>Support the app</Button>
    </div>
}

export default SupportCard
