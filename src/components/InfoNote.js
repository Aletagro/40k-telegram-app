import React from 'react'

import Styles from './styles/InfoNote.module.css'

// Информационная плашка с золотой полосой слева. Для пояснений и сроков на экранах игрока
const InfoNote = ({children, title}) => <div className={Styles.note}>
    {title ? <p className={Styles.title}>{title}</p> : null}
    <div className={Styles.text}>{children}</div>
</div>

export default InfoNote
