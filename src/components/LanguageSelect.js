import React, {useState} from 'react'

import Styles from './styles/LanguageSelect.module.css'

const {LANGUAGES, getLanguage, setLanguage} = require('../utilities/db')

// Строка с текущим языком; по нажатию снизу открывается список языков
const LanguageSelect = () => {
    const [isOpen, setIsOpen] = useState(false)
    const current = getLanguage()
    const currentName = LANGUAGES.find(({id}) => id === current)?.name

    const handleOpen = () => setIsOpen(true)
    const handleClose = () => setIsOpen(false)

    const handleSelect = (id) => {
        setIsOpen(false)
        if (id !== current) {
            setLanguage(id)
        }
    }

    const renderLanguage = ({id, name}) => <button
        type='button'
        key={id}
        className={`${Styles.option} ${id === current ? Styles.selected : ''}`}
        onClick={() => handleSelect(id)}
    >
        <span>{name}</span>
        {id === current ? <span className={Styles.check} aria-hidden='true' /> : null}
    </button>

    return <>
        <button type='button' className={Styles.row} onClick={handleOpen}>
            <span className={Styles.body}>
                <span className={Styles.title}>Rules language</span>
                <span className={Styles.text}>{currentName}</span>
            </span>
            <span className={Styles.chevron} aria-hidden='true' />
        </button>
        {isOpen
            ? <div className={Styles.overlay} onClick={handleClose}>
                <div className={Styles.sheet} onClick={(e) => e.stopPropagation()}>
                    <div className={Styles.handle} />
                    <p className={Styles.sheetTitle}>Rules language</p>
                    <p className={Styles.hint}>Missing translations are shown in English</p>
                    {LANGUAGES.map(renderLanguage)}
                </div>
            </div>
            : null
        }
    </>
}

export default LanguageSelect
