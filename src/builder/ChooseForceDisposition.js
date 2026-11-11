import {t} from '../utilities/i18n'
import React from 'react'
import {useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import {getForceDispositionOptions} from '../utilities/rosterModel'
import Button from '../components/Button'

import map from 'lodash/map'
import size from 'lodash/size'

import Styles from './styles/Builder.module.css'

// Выбор доктрины (Force Disposition) из тех, что дают выбранные детачменты
const ChooseForceDisposition = () => {
    const navigate = useNavigate()
    const options = getForceDispositionOptions()

    const handleChoose = (id) => () => {
        roster.forceDispositionId = id
        navigate(-1)
    }

    return <div id='column' className='Chapter'>
        {size(options)
            ? map(options, option => <button
                key={option.id}
                type='button'
                className={`${Styles.detachment} ${option.id === roster.forceDispositionId ? Styles.chosen : ''}`}
                onClick={handleChoose(option.id)}
            >
                <span className={Styles.detachmentBody}><span className={Styles.detachmentName}>{option.name}</span></span>
            </button>)
            : <p className={Styles.empty}>{t('Choose detachments first')}</p>
        }
        {roster.forceDispositionId
            ? <Button type='secondary' className={Styles.fullButton} onClick={handleChoose('')}>{t('Clear')}</Button>
            : null
        }
    </div>
}

export default ChooseForceDisposition
