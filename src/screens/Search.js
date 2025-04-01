import React, {useState, useReducer} from 'react'
import useDebounce from '../utilities/useDebounce'
import {sortByName} from '../utilities/utils'
import {search} from '../utilities/appState'
import Row from '../components/Row'
import Ability from '../components/Ability'
import Accordion from '../components/Accordion'

import size from 'lodash/size'
import find from 'lodash/find'
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
            const datasheets = filter(dataBase.data.datasheet, (warscroll) => !warscroll.isSpearhead && includes(lowerCase(warscroll.name), lowerCase(value)))
            search.Datasheets = sortByName(datasheets.splice(0, 20))
            const rules = filter(dataBase.data.rule_container, (rule) => includes(lowerCase(rule.title), lowerCase(value)))
            search.Rules = sortByName(rules.splice(0, 20), 'displayOrder')
            const detachments = filter(dataBase.data.detachment, (detachment) => includes(lowerCase(detachment.name), lowerCase(value)))
            search.Detachments = sortByName(detachments.splice(0, 20), 'displayOrder')
            const stratagems = filter(dataBase.data.stratagem, (stratagem) => includes(lowerCase(stratagem.name), lowerCase(value)))
            search.Stratagems = sortByName(stratagems.splice(0, 20))
        } else {
            search.Datasheets = []
            search.Rules = []
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
        navigateTo='datasheet'
        state={{unit}}
    />

    const renderRule = (rule) => <Row
        key={rule.id}
        title={rule.title}
        subtitle={rule.subtitle || 'rule'}
        navigateTo='rules'
        state={{paragraph: rule}}
    />

    const renderDetachment = (detachment) => {
        const faction = find(dataBase.data.publication, ['id', detachment.publicationId])
        return <Row
            key={detachment.id}
            title={detachment.name}
            subtitle={faction.name}
            navigateTo='detachment'
            state={{detachment}}
        />
    }

    const renderStratagem = (stratagem) => <Ability
        key={stratagem.id}
        ability={stratagem}
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
            {size(search.Datasheets) ? renderAccordion('Datasheets', renderWarscroll) : null}
            {size(search.Rules) ? renderAccordion('Rules', renderRule) : null}
            {size(search.Detachments) ? renderAccordion('Detachments', renderDetachment) : null}
            {size(search.Stratagems) ? renderAccordion('Stratagems', renderStratagem) : null}
        </div>
    </>
}

export default Search