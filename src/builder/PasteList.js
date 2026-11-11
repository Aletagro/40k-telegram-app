import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {roster, navigationState} from '../utilities/appState'
import {importRoster} from '../utilities/rosterImport'
import Button from '../components/Button'
import InfoNote from '../components/InfoNote'

import map from 'lodash/map'
import size from 'lodash/size'
import trim from 'lodash/trim'

import Styles from './styles/PasteList.module.css'

// Вставка списка текстом (формат официального приложения Warhammer 40,000 и экспорта этого приложения)
const PasteList = () => {
    const navigate = useNavigate()
    const [text, setText] = useState('')
    const [error, setError] = useState('')
    const [warnings, setWarnings] = useState(null)

    const openBuilder = () => {
        navigationState.isBuilder = true
        navigate('/builder', {state: {faction: {id: roster.factionId, name: roster.faction}}})
    }

    const handleImport = () => {
        const result = importRoster(text)
        if (!result.ok) {
            setError(result.error)
            setWarnings(null)
            return
        }
        setError('')
        if (size(result.warnings)) setWarnings(result.warnings)
        else openBuilder()
    }

    const handleChange = (e) => {
        setText(e.target.value)
        setError('')
        setWarnings(null)
    }

    return <div id='column' className='Chapter'>
        <InfoNote title={t('Paste your army list')}>
            <p>{t('Copy a list from the official Warhammer 40,000 app, Listhammer or from this app (Export → Copy List) and paste it below.')}</p>
        </InfoNote>
        <textarea
            className={Styles.textarea}
            value={text}
            onChange={handleChange}
            placeholder={'My list (2,000 Points)\nSpace Marines\nBlack Templars\n...'}
            rows={12}
            spellCheck={false}
        />
        {error ? <p className={Styles.error}>{error}</p> : null}
        {warnings
            ? <div className={Styles.warnings}>
                <b>List imported with {size(warnings)} {size(warnings) === 1 ? 'note' : 'notes'}</b>
                <ul>{map(warnings, (warning, index) => <li key={index}>{warning}</li>)}</ul>
            </div>
            : null
        }
        {warnings
            ? <Button className={Styles.button} onClick={openBuilder}>{t('Open list')}</Button>
            : <Button className={Styles.button} disabled={!trim(text)} onClick={handleImport}>{t('Import list')}</Button>
        }
    </div>
}

export default PasteList
