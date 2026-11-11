import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Autocomplete from '@mui/joy/Autocomplete'
import {main} from '../utilities/appState'
import {registerUser} from '../utilities/api'
import countries from '../utilities/countries'
import FloatingLabelInput from '../components/FloatingLabelInput'
import Button from '../components/Button'

import Styles from '../builder/styles/Builder.module.css'

const user = window.Telegram?.WebApp?.initDataUnsafe?.user

const inputStyle = {
    marginBottom: '16px',
    '--Input-minHeight': '52px',
    '--Input-focusedHighlight': 'var(--gold)',
    borderRadius: '14px',
    borderColor: 'var(--gold)',
    background: 'var(--bg)',
    color: 'var(--text)',
    boxShadow: 'none',
    fontFamily: 'Minion Pro Regular',
    // Подписи и плейсхолдеры одного цвета, фокус золотой (по умолчанию Joy красит его в синий)
    '& label, & input::placeholder': {color: 'var(--muted)', opacity: 1},
    '&:hover': {borderColor: 'var(--gold)'},
    '&:focus-within': {borderColor: 'var(--gold)', '--Input-focusedHighlight': 'var(--gold)'},
    '&:focus-within::before': {boxShadow: 'inset 0 0 0 2px var(--gold)'},
    '&:focus-within label': {color: 'var(--gold-light)'}
}

// Выпадающий список стран в тёмном стиле приложения
const listboxSx = {
    mt: '4px',
    p: '6px',
    border: '1.5px solid var(--gold)',
    borderRadius: '16px',
    background: 'var(--card)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
    fontFamily: 'Minion Pro Regular',
    '--ListItem-radius': '10px',
    '& .MuiAutocomplete-option': {color: 'var(--text)', fontSize: '16px'},
    '& .MuiAutocomplete-option[aria-selected="true"]': {background: 'var(--card-active)', fontFamily: 'Minion Pro Bold'},
    '& .MuiAutocomplete-option:hover, & .MuiAutocomplete-option.Mui-focused': {background: 'var(--card-active)'}
}

// Регистрация нужна, чтобы сохранять списки. Пользователи общие с AoS: кто там уже зарегистрирован, повторно регистрироваться не должен
const Registration = () => {
    const navigate = useNavigate()
    const [firstname, setFirstname] = useState(user?.first_name || '')
    const [lastname, setLastname] = useState(user?.last_name || '')
    const [country, setCountry] = useState('')
    const [city, setCity] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [hasError, setHasError] = useState(false)

    const isDisabled = !firstname || !lastname || !country || !city || isSending

    const handleRegister = async () => {
        setIsSending(true)
        setHasError(false)
        const data = await registerUser({firstname, lastname, country, city})
        setIsSending(false)
        if (!data?.user_info) {
            setHasError(true)
            return
        }
        main.user = data.user_info
        main.showSaveListModal = true
        navigate(-1)
    }

    return <div id='column' className='Chapter'>
        <h2 className={Styles.regTitle}>To save the list, please register</h2>
        <FloatingLabelInput style={inputStyle} onChange={e => setFirstname(e.target.value)} label='Name' value={firstname} />
        <FloatingLabelInput style={inputStyle} onChange={e => setLastname(e.target.value)} label='Surname' value={lastname} />
        <Autocomplete
            placeholder='Country'
            onInputChange={(e, value) => setCountry(value || e?.target?.value || '')}
            options={countries}
            sx={inputStyle}
            slotProps={{listbox: {sx: listboxSx}}}
            value={country}
            autoComplete
            autoSelect
            freeSolo
        />
        <FloatingLabelInput style={inputStyle} onChange={e => setCity(e.target.value)} label='City' value={city} />
        {hasError ? <p className={Styles.regError}>Could not sign up. Please try again.</p> : null}
        <Button className={Styles.fullButton} disabled={isDisabled} onClick={handleRegister}>Sign up</Button>
    </div>
}

export default Registration
