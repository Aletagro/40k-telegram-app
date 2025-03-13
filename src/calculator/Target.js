import React from 'react';

import Styles from './styles/Target.module.css'

const wards = [3, 4, 5, 6]

const Target = ({target, onChange}) => {

    const handleChangeSave = (value) => () => {
        onChange('ward', target.ward === value ? '' : value)
    }

    const handleClickIsEthereal = () => {
        onChange('isEthereal')
    }

    const renderButton = (value) => <button
        key={value}
        onClick={handleChangeSave(value)}
        id={target.ward === value ? Styles.checkedAbilities : Styles.abilities}
    >
        {value}
    </button>

    return  <div id={Styles.container}>
        <b id={Styles.title}>Target Ward</b>
        <div id={Styles.characteristicsContainer}>
            {wards.map(renderButton)}
            <button onClick={handleClickIsEthereal} id={target.isEthereal ? Styles.checkedAbilities : Styles.abilities} style={{flex: 2}}>
                is Ethereal
            </button>
        </div>
    </div>
}

export default Target