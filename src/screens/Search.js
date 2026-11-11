import {t} from '../utilities/i18n'
import React, {useState, useReducer} from 'react'
import useDebounce from '../utilities/useDebounce'
import {sortByName, getUnitPounts, getStratagemPhases} from '../utilities/utils'
import {search} from '../utilities/appState'
import {ListCard, ListItem} from '../components/ListCard'
import CollapseSection from '../components/CollapseSection'
import Ability from '../components/Ability'

import map from 'lodash/map'
import size from 'lodash/size'
import find from 'lodash/find'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

import Styles from './styles/Search.module.css'

const dataBase = require('../utilities/db')

const Search = () => {
    const [value, setValue] = useState(search.value)
    const [, forceUpdate] = useReducer((x) => x + 1, 0)

    useDebounce(() => {
        if (value) {
            const query = lowerCase(value)
            const find20 = (table, field, order) => sortByName(filter(dataBase.data[table], item => includes(lowerCase(item[field]), query)).slice(0, 20), order)
            search.Datasheets = find20('datasheet', 'name')
            search.Rules = find20('rule_container', 'title', 'displayOrder')
            search.Detachments = find20('detachment', 'name', 'displayOrder')
            search.Stratagems = find20('stratagem', 'name')
        } else {
            search.Datasheets = []
            search.Rules = []
            search.Detachments = []
            search.Stratagems = []
        }
        forceUpdate()
      }, [value], 300
    )

    const handleChange = (e) => {
        search.value = e.target.value
        setValue(e.target.value)
    }

    const handleToggle = (type) => {
        search.expand[type] = !search.expand[type]
        forceUpdate()
    }

    const renderDatasheet = (unit) => <ListItem
        key={unit.id}
        title={unit.name}
        rightText={getUnitPounts(unit) ? `${getUnitPounts(unit)} pts` : undefined}
        image={unit.rowImage}
        navigateTo='datasheet'
        state={{unit}}
    />

    const renderRule = (rule) => <ListItem
        key={rule.id}
        title={rule.title}
        subtitle={rule.subtitle || t('rule')}
        navigateTo='rules'
        state={{paragraph: rule}}
    />

    const renderDetachment = (detachment) => <ListItem
        key={detachment.id}
        title={detachment.name}
        subtitle={find(dataBase.data.publication, ['id', detachment.publicationId])?.name}
        navigateTo='detachment'
        state={{detachment}}
    />

    const renderStratagem = (stratagem) => <Ability
        key={stratagem.id}
        ability={stratagem}
        phases={getStratagemPhases(stratagem.id)}
    />

    const renderGroup = (type, renderItem, asCards) => size(search[type])
        ? <CollapseSection key={type} title={t(type)} count={size(search[type])} expanded={search.expand[type]} onToggle={handleToggle}>
            {asCards ? map(search[type], renderItem) : <ListCard>{map(search[type], renderItem)}</ListCard>}
        </CollapseSection>
        : null

    return <>
        <div className={Styles.searchBar}>
            <input
                className={Styles.input}
                defaultValue={search.value}
                onChange={handleChange}
                autoFocus
                placeholder={t('Search datasheets, rules, stratagems')}
                type='search'
                name='search'
            />
        </div>
        <div id='column' className='Chapter'>
            {renderGroup('Datasheets', renderDatasheet)}
            {renderGroup('Rules', renderRule)}
            {renderGroup('Detachments', renderDetachment)}
            {renderGroup('Stratagems', renderStratagem, true)}
        </div>
    </>
}

export default Search
