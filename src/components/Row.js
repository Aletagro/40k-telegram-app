import React from 'react';
import {useNavigate} from 'react-router-dom';
import RowImage from '../components/RowImage'

import Styles from './styles/Row.module.css'

const Row = ({title, subtitle, rightText, image, navigateTo, state, onClick}) => {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/${navigateTo}`, {state: {title, ...state}})
        if (onClick) {
            onClick()
        }
    }

    return <button  id={Styles.container} onClick={handleClick}>
        {image ?<RowImage src={image} alt={title} /> : null}
        <div id={Styles.titleContainer}>
            <b id={Styles.title}>{title}</b>
            {subtitle ? <p id={Styles.subtitle}>{subtitle}</p> : null}
        </div>
        {rightText ? <p id={Styles.rightText}>{rightText}</p> : null}
    </button>
}

export default Row