import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'

import Styles from './styles/ImageCard.module.css'

// Карточка с картинкой на фоне: название поверх тёмного градиента.
// size: 'md' (армии) | 'lg' (группы армий). badge - небольшая метка рядом с названием.
const ImageCard = ({title, image, badge, size = 'md', navigateTo, state, onClick}) => {
    const navigate = useNavigate()
    const [failed, setFailed] = useState(false)

    const handleClick = () => {
        if (onClick) {
            onClick(state)
        }
        if (navigateTo) {
            navigate(`/${navigateTo}`, {state: {title, ...state}})
        }
    }

    return <button type='button' className={`${Styles.card} ${Styles[size]}`} onClick={handleClick}>
        {image && !failed
            ? <img className={Styles.image} src={image} alt='' loading='lazy' onError={() => setFailed(true)} />
            : null
        }
        <span className={Styles.shade} />
        <span className={Styles.content}>
            <span className={Styles.title}>{title}</span>
            {badge ? <span className={Styles.badge}>{badge}</span> : null}
            <span className={Styles.chevron} aria-hidden='true' />
        </span>
    </button>
}

export default ImageCard
