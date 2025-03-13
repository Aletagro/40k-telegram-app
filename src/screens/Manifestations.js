import React from 'react';
import Constants from '../Constants'
import {sortByName} from '../utilities/utils'
import Row from '../components/Row'
import Accordion from '../components/Accordion'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const Manifestations = () => {
    window.scrollTo(0, 0)
    let lores = filter(dataBase.data.lore, (lore) => lore.publicationId === Constants.manifestationsPublicationId)
    sortByName(lores)

    const renderUnit = (unit) => <Row
        key={unit.id}
        title={unit.name}
        image={unit?.rowImage}
        navigateTo='warscroll'
        state={{unit}}
    />

    const renderLore = (lore) => {
        const spells = filter(dataBase.data.lore_ability, ability => ability.loreId === lore.id)
        const units = map(spells, spell => find(dataBase.data.warscroll, warscroll => warscroll.id === spell.linkedWarscrollId))
        return <Accordion
            title={lore.name}
            data={units}
            renderItem={renderUnit}
        />
    }

    return <>
        <div id='column' className='Chapter'>
            {lores && map(lores, renderLore)}
        </div>
    </>
}

export default Manifestations