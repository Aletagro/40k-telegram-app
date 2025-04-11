import React from 'react'
import Wargear from './Wargear'

import map from 'lodash/map'
import filter from 'lodash/filter'

import Styles from './styles/WargearOptionGroup.module.css'

const dataBase = require('../dataBase.json')

const WargearOptionGroup = ({wargearOptionGroup, unitData}) => {
    const wargearOptions = filter(dataBase.data.wargear_option, ['wargearOptionGroupId', wargearOptionGroup.id])

    const renderWargear = (wargear, index) => <Wargear
        key={wargear.id}
        index={index}
        wargear={wargear}
        unitData={{...unitData, wargearOptionGroupId: wargearOptionGroup.id}}
    />

    return <div>
        <div id={Styles.instructionTextContainer}>
            <p id={Styles.instructionText}>{wargearOptionGroup.instructionText}</p>
        </div>
        {map(wargearOptions, renderWargear)}
    </div>
}

export default WargearOptionGroup