import React from 'react';
import {useLocation} from 'react-router-dom'
import {replaceAsterisks, sortByName} from '../utilities/utils'

import map from 'lodash/map'

import Styles from './styles/Errata.module.css'

const Errata = () => {
    const {data, codexInfo} = useLocation().state

    const renderErrata = (item) => <div className={Styles.card} key={item.id}>
        <p className={Styles.title}>{replaceAsterisks(item.errataHeader)}</p>
        <p className={Styles.text}>{replaceAsterisks(item.errataText)}</p>
    </div>

    return <div id='column' className='Chapter'>
        {codexInfo.errataDate ? <p className={Styles.date}>Last Updated: {codexInfo.errataDate}</p> : null}
        {map(sortByName([...data], 'displayOrder'), renderErrata)}
    </div>
}

export default Errata
