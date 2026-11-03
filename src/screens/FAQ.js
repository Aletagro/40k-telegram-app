import React from 'react';
import {useLocation} from 'react-router-dom'
import {replaceAsterisks, sortByName} from '../utilities/utils'

import map from 'lodash/map'

import Styles from './styles/FAQ.module.css'

const FAQ = () => {
    const {data, codexInfo} = useLocation().state

    const renderQuestion = (item) => <div className={Styles.card} key={item.id}>
        <p className={Styles.question}>{replaceAsterisks(item.question)}</p>
        <p className={Styles.answer}>{replaceAsterisks(item.answer)}</p>
    </div>

    return <div id='column' className='Chapter'>
        {codexInfo.errataDate ? <p className={Styles.date}>Last Updated: {codexInfo.errataDate}</p> : null}
        {map(sortByName([...data], 'displayOrder'), renderQuestion)}
    </div>
}

export default FAQ
