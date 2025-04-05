import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import Ability from '../components/Ability'
import Info from '../icons/whiteInfo.svg'

import Styles from './styles/ChooseEnhancement.module.css'

const ChooseEnhancement = () => {
    const {data, type, title, isInfo, isRosterInfo} = useLocation().state
    const navigate = useNavigate()

    const handleClickBlock = (block) => () => {
        roster[type] = block.name
        if (type === 'detachment') {
            roster.detachmentId = block.id
        }
        navigate(-1)
    }

    const handleDeleteEnhancement = () => {
        roster[type] = ''
        if (type === 'detachment') {
            roster.detachmentId = ''
        }
        navigate(-1)
    }

    const handleClickEnhancementInfo = (data) => () => {
        if (type === 'detachment') {
            navigate('/detachment', {state: {detachment: data}})
        }
    }

    const handleGoBack = () => {
        navigate(-1)
    }

    const renderEnhancement = (enhancement) => <Ability
        key={enhancement.id}
        ability={enhancement}
    />

    const renderBlock = (block) => <div key={block.id} id={Styles.block}>
        <button id={Styles.blockTitle} onClick={handleClickBlock(block)}>
            <p id={Styles.title}>{block.name}</p>
            {/* {block.abilities?.map(renderEnhancement)} */}
        </button>
        <img onClick={handleClickEnhancementInfo(block)} id={Styles.infoIcon} src={Info} alt="" />
    </div>

    return  <div id='column' className='Chapter'>
        {data?.map(isRosterInfo ? renderBlock : renderEnhancement)}
        {isInfo
            ? <button id={Styles.delete} onClick={handleGoBack}>Back</button>
            : <button id={Styles.delete} onClick={handleDeleteEnhancement}>Delete {title}</button>
        }
    </div>
}

export default ChooseEnhancement