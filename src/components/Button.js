import React from 'react'

import Styles from './styles/Button.module.css'

// Общая кнопка. type: 'primary' (золотая), 'secondary' (с обводкой), 'danger'
const Button = ({children, onClick, type = 'primary', disabled = false, className}) => <button
    type='button'
    disabled={disabled}
    onClick={onClick}
    className={[Styles.button, Styles[type], className].filter(Boolean).join(' ')}
>
    {children}
</button>

export default Button
