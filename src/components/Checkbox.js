import React from 'react'
import GoldCheckmark from '../icons/goldCheckmark.svg'
import Checkmark from '../icons/checkmark.svg'

import Styles from './styles/Checkbox.module.css'

const Checkbox = ({onClick, checked, isGold}) => {   
    
    const handleClick = () => {
        onClick(!checked)
    }

    return <button id={Styles.checkbox} onClick={handleClick}>
        {checked
            ? <div id={Styles.checkmarkIcon}>
                <img src={isGold ? GoldCheckmark : Checkmark} alt="" />
            </div>
            : <div id={Styles.uncheckedCheckbox} />
        }
    </button>
}

export default Checkbox