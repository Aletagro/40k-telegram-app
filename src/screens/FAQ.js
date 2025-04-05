import React from 'react';
import {useLocation} from 'react-router-dom'
import {replaceAsterisks} from '../utilities/utils'

import map from 'lodash/map'

import Styles from './styles/FAQ.module.css'

const FAQ = () => {
    const {data, codexInfo} = useLocation().state

    const renderQuestion = (item) => <div id={Styles.container} key={item.id}>
        <p id={Styles.question}>Q: {replaceAsterisks(item.question)}</p>
        <p id={Styles.answer}>A: {replaceAsterisks(item.answer)}</p>
    </div>

    return <div id='column' className='Chapter'>
        {codexInfo.errataDate ? <p id={Styles.errataDate} >Last Updated: {codexInfo.errataDate}</p> : null}
        {map(data, renderQuestion)}
    </div>
}

export default FAQ