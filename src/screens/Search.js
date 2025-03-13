import React, {useState, useReducer} from 'react'
import useDebounce from '../utilities/useDebounce'
import {sortByName} from '../utilities/utils'
import {search} from '../utilities/appState'
import Row from '../components/Row'
import Accordion from '../components/Accordion'

import size from 'lodash/size'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

import Styles from './styles/Search.module.css'

const dataBase = require('../dataBase.json')

const Search = () => {
    const [value, setValue] = useState(search.value)
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)

    useDebounce(() => {
        if (value) {
            const warscrolls = filter(dataBase.data.warscroll, (warscroll) => !warscroll.isSpearhead && includes(lowerCase(warscroll.name), lowerCase(value)))
            search.Warscrolls = sortByName(warscrolls.splice(0, 20))
            const rules = filter(dataBase.data.rule_container, (rule) => includes(lowerCase(rule.title), lowerCase(value)))
            search.Rules = sortByName(rules.splice(0, 20), 'title')
            const allegiances = filter(dataBase.data.faction_keyword, (faction) => includes(lowerCase(faction.name), lowerCase(value)) && faction.name !== 'Orruk Warclans')
            search.Allegiances = sortByName(allegiances.splice(0, 20))
        } else {
            search.Warscrolls = []
            search.Rules = []
            search.Allegiances = []
        }
        forceUpdate()
      }, [value], 300
    )

    const handleChange = (e) => {
        search.value = e.target.value
        setValue(e.target.value)
    }

    const handleChangeExpand = (e) => {
        const type = e.nativeEvent.target?.innerText
        search.expand[type] = !search.expand[type]
        forceUpdate()
    }

    const renderWarscroll = (unit) => <Row
        key={unit.id}
        title={unit.name}
        rightText={unit?.points ? `${unit?.points} pts` : undefined}
        image={unit?.rowImage}
        navigateTo='warscroll'
        state={{unit}}
    />

    const renderRule = (rule) => <Row
        key={rule.id}
        title={rule.title}
        subtitle={rule.updateType || 'rule'}
        navigateTo='rules'
        state={{rules: [rule]}}
    />

    const renderAllegiance = (allegiance) => <Row
        key={allegiance.id}
        title={allegiance.name}
        navigateTo='army'
        state={{allegiance}}
    />

    const renderAccordion = (type, renderItem) => <Accordion
        title={type}
        data={search[type]}
        renderItem={renderItem}
        expanded={search.expand[type]}
        onChangeExpand={handleChangeExpand}
    />

    return <>
        <div id={Styles.container}>
            <input id={Styles.input} onChange={handleChange} autoFocus placeholder='Start Typing' type='search' name='search' size={40} />
        </div>
        <div id='column' className='Chapter'>
            {size(search.Warscrolls) ? renderAccordion('Warscrolls', renderWarscroll) : null}
            {size(search.Rules) ? renderAccordion('Rules', renderRule) : null}
            {size(search.Allegiances) ? renderAccordion('Allegiances', renderAllegiance) : null}
        </div>
    </>
}

export default Search