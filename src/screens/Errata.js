import React from 'react';
import {useLocation} from 'react-router-dom'
import {replaceAsterisks} from '../utilities/utils'

import map from 'lodash/map'

import Styles from './styles/Errata.module.css'

const Errata = () => {
    const {data, codexInfo} = useLocation().state

    const renderErrata = (item) => <div id={Styles.container} key={item.id}>
        <p id={Styles.title}>{replaceAsterisks(item.title)}</p>
        <p id={Styles.text}>{replaceAsterisks(item.text)}</p>
    </div>

    return <div id='column' className='Chapter'>
        {codexInfo.errataDate ? <p id={Styles.errataDate} >Last Updated: {codexInfo.errataDate}</p> : null}
        {map(data, renderErrata)}
    </div>
}

export default Errata