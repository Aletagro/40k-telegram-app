import React from 'react'
import {useNavigate} from 'react-router-dom'

import Styles from './styles/MenuRow.module.css'

// Пункт меню: название, пояснение и стрелка
const MenuRow = ({title, text, navigateTo, state}) => {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/${navigateTo}`, {state: {title, ...state}})
    }

    return <button type='button' className={Styles.row} onClick={handleClick}>
        <span className={Styles.body}>
            <span className={Styles.title}>{title}</span>
            {text ? <span className={Styles.text}>{text}</span> : null}
        </span>
        <span className={Styles.chevron} aria-hidden='true' />
    </button>
}

export default MenuRow
