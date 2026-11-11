import React from 'react'

import Styles from './styles/ToggleRow.module.css'

// Строка с переключателем и пояснением
const ToggleRow = ({label, hint, checked, onChange}) => <button type='button' className={Styles.row} onClick={onChange} role='switch' aria-checked={checked}>
    <span className={Styles.text}>
        <span className={Styles.label}>{label}</span>
        {hint ? <span className={Styles.hint}>{hint}</span> : null}
    </span>
    <span className={`${Styles.track} ${checked ? Styles.on : ''}`}><span className={Styles.thumb} /></span>
</button>

export default ToggleRow
