import React from 'react'

import Styles from './styles/CollapseSection.module.css'

// Раздел, который сворачивается по нажатию на заголовок
const CollapseSection = ({title, expanded, onToggle, children}) => <div className={Styles.section}>
    <button type='button' className={Styles.header} onClick={() => onToggle(title)}>
        <span className={Styles.title}>{title}</span>
        <span className={`${Styles.chevron} ${expanded ? Styles.open : ''}`} aria-hidden='true' />
    </button>
    {expanded ? children : null}
</div>

export default CollapseSection
