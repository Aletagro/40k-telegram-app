import React from 'react'
import {useNavigate} from 'react-router-dom'

import Styles from './styles/Tile.module.css'

// Плитка раздела: название и пояснение, справа стрелка.
// featured - яркая плитка во всю ширину, compact - низкая плитка для сетки.
const Tile = ({title, text, navigateTo, state, onClick, featured, compact, wide}) => {
    const navigate = useNavigate()

    const handleClick = () => {
        if (onClick) {
            onClick()
        }
        if (navigateTo) {
            navigate(`/${navigateTo}`, {state: {title, ...state}})
        }
    }

    const classes = [Styles.tile, featured ? Styles.featured : '', compact ? Styles.compact : '', wide ? Styles.wide : ''].join(' ')

    return <button type='button' className={classes} onClick={handleClick}>
        <span className={Styles.tileBody}>
            <span className={Styles.tileTitle}>{title}</span>
            {text ? <span className={Styles.tileText}>{text}</span> : null}
        </span>
        <span className={Styles.chevron} aria-hidden='true' />
    </button>
}

export default Tile
