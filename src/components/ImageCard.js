import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'

import Styles from './styles/ImageCard.module.css'

// Карточка с картинкой на фоне: название поверх тёмного градиента.
// size: 'md' (армии) | 'lg' (группы армий). badge - небольшая метка рядом с названием.
const ImageCard = ({title, subtitle, image, badge, size = 'md', navigateTo, state, onClick, onAction, actionLabel = 'i', selected, disabled}) => {
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

    const card = <button type='button' className={`${Styles.card} ${Styles[size]} ${selected ? Styles.selected : ''} ${disabled ? Styles.disabled : ''} ${onAction ? Styles.withAction : ''}`} onClick={handleClick}>
        {image && !failed
            ? <img className={Styles.image} src={image} alt='' loading='lazy' onError={() => setFailed(true)} />
            : null
        }
        <span className={Styles.shade} />
        <span className={Styles.content}>
            <span className={Styles.titleBox}><span className={Styles.title}>{title}</span>{subtitle ? <span className={Styles.subtitle}>{subtitle}</span> : null}</span>
            {badge ? <span className={Styles.badge}>{badge}</span> : null}
            {onAction ? null : <span className={Styles.chevron} aria-hidden='true' />}
        </span>
    </button>

    if (!onAction) {
        return card
    }
    // Дополнительная кнопка (например, инфо) лежит поверх карточки, а не внутри кнопки
    return <div className={Styles.wrap}>
        {card}
        <button type='button' className={`${Styles.action} ${Styles[`action_${size}`]}`} onClick={onAction} aria-label={t('Info')}>{actionLabel}</button>
    </div>
}

export default ImageCard
