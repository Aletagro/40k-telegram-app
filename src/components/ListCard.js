import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'

import Styles from './styles/ListCard.module.css'

// Заголовок раздела: название и золотая линия
export const SectionTitle = ({children}) => <h4 className={Styles.sectionTitle}>{children}</h4>

// Маленькая картинка в начале пункта; если не загрузилась, не занимает места
const Thumbnail = ({src}) => {
    const [failed, setFailed] = useState(false)
    return failed
        ? null
        : <img className={Styles.thumbnail} src={src} alt='' loading='lazy' onError={() => setFailed(true)} />
}

// Один пункт списка внутри карточки
export const ListItem = ({title, subtitle, rightText, image, navigateTo, state, onClick, onInfo}) => {
    const navigate = useNavigate()

    const handleClick = () => {
        if (onClick) {
            onClick()
        }
        if (navigateTo) {
            navigate(`/${navigateTo}`, {state: {title, ...state}})
        }
    }

    const item = <button type='button' className={Styles.item} onClick={handleClick}>
        {image ? <Thumbnail src={image} /> : null}
        <span className={Styles.body}>
            <span className={Styles.title}>{title}</span>
            {subtitle ? <span className={Styles.subtitle}>{subtitle}</span> : null}
        </span>
        {rightText ? <span className={Styles.rightText}>{rightText}</span> : null}
        {onInfo ? null : <span className={Styles.chevron} aria-hidden='true' />}
    </button>

    // Кнопка инфо рядом с пунктом: открывает подробности, не выбирая сам пункт
    return onInfo
        ? <div className={Styles.rowWrap}>
            {item}
            <button type='button' className={Styles.info} onClick={onInfo} aria-label='Info'>i</button>
        </div>
        : item
}

// Карточка, в которой пункты разделены тонкими линиями
export const ListCard = ({children}) => <div className={Styles.card}>{children}</div>
