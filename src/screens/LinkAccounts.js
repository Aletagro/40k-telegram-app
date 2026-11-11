import {t} from '../utilities/i18n'
import React, {useCallback, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'
import Constants from '../Constants'
import {main} from '../utilities/appState'
import {generateLinkCode, linkAccounts, fetchUser} from '../utilities/api'
import {isVkApp} from '../utilities/linkAccounts'
import FloatingLabelInput from '../components/FloatingLabelInput'
import InfoNote from '../components/InfoNote'
import Button from '../components/Button'

import Styles from './styles/LinkAccounts.module.css'

const inputStyle = {
    width: '100%',
    marginBottom: '16px'
}

// Связка аккаунтов Telegram и VK. Если аккаунт в этом приложении уже есть - получаем код (его пришлёт бот),
// если нет - вводим код, полученный в другой соцсети
const LinkAccounts = () => {
    const navigate = useNavigate()
    const [code, setCode] = useState('')
    const [isSending, setIsSending] = useState(false)
    const hasAccount = Boolean(main.user?.id)
    const otherApp = isVkApp() ? 'Telegram' : 'VK'
    const thisApp = isVkApp() ? 'VK' : 'Telegram'

    const handleGetCode = useCallback(async () => {
        setIsSending(true)
        const ok = await generateLinkCode(main.user.id)
        if (ok) {
            toast.success(t('Code sent to you by the bot'), Constants.toastParams)
        } else {
            toast.error(t('Could not get a code, try again later'), Constants.toastParams)
        }
        setIsSending(false)
    }, [])

    const handleChangeCode = useCallback((e) => setCode(e.target.value.trim()), [])

    const handleSendCode = useCallback(async () => {
        setIsSending(true)
        const ok = await linkAccounts(code)
        if (ok) {
            const data = await fetchUser()
            if (data?.exists) main.user = data.user
            toast.success(t('Accounts linked'), Constants.toastParams)
            navigate('/')
        } else {
            toast.error(t('Invalid code'), Constants.toastParams)
        }
        setIsSending(false)
    }, [code, navigate])

    return <div id='column' className='Chapter'>
        {hasAccount
            ? <>
                <InfoNote title={t('Link accounts')}>
                    <p>{t('Use your lists in both Telegram and VK.')}</p>
                    <p>Tap "Get code": the bot will send you a short code in a private message. Then open the app in {otherApp}, choose to link an existing account and enter the code there.</p>
                </InfoNote>
                <Button className={Styles.button} disabled={isSending} onClick={handleGetCode}>{t('Get code')}</Button>
            </>
            : <>
                <InfoNote title={t('Link accounts')}>
                    <p>Already have an account in {otherApp}? Open the app there, go to "Link accounts" and tap "Get code". Then enter the code from the bot here, and this {thisApp} account will be linked to it.</p>
                </InfoNote>
                <FloatingLabelInput
                    style={inputStyle}
                    onChange={handleChangeCode}
                    label={t('Code')}
                    value={code}
                />
                <Button className={Styles.button} disabled={!code || isSending} onClick={handleSendCode}>{t('Link account')}</Button>
            </>
        }
    </div>
}

export default LinkAccounts
