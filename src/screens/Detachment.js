import React from 'react'
import {useLocation} from 'react-router-dom'
import {sortByName, replaceAsterisks} from '../utilities/utils'
import Tile from '../components/Tile'
import {RuleCard} from '../components/Rule'
import HeaderImage from '../components/HeaderImage'

import map from 'lodash/map'
import size from 'lodash/size'
import find from 'lodash/find'
import filter from 'lodash/filter'

import Styles from './styles/Detachment.module.css'

const dataBase = require('../utilities/db')

const Detachment = () => {
    const {detachment, detachmentId} = useLocation().state
    const _detachment = detachment || find(dataBase.data.detachment, ['id', detachmentId])
    const detachmentRules = sortByName(filter(dataBase.data.detachment_rule, ['detachmentId', _detachment.id]), 'displayOrder')
    const detachmentDetails = sortByName(filter(dataBase.data.detachment_detail, ['detachmentId', _detachment.id]), 'displayOrder')
    const enhancements = sortByName(filter(dataBase.data.enhancement, ['detachmentId', _detachment.id]), 'displayOrder')
    const stratagems = sortByName(filter(dataBase.data.stratagem, ['detachmentId', _detachment.id]), 'displayOrder')

    const renderDetachmentRule = (detachmentRule) => <RuleCard
        key={detachmentRule.id}
        title={detachmentRule.name}
        rules={sortByName(filter(dataBase.data.rule_container_component, ['detachmentRuleId', detachmentRule.id]), 'displayOrder')}
    />

    const renderDetailPoint = (point) => <li key={point.id}>{replaceAsterisks(point.text)}</li>

    const renderDetail = (detail) => <div className={Styles.detail} key={detail.id}>
        <p className={Styles.detailTitle}>{detail.title}</p>
        <ul className={Styles.detailList}>
            {map(sortByName(filter(dataBase.data.detachment_detail_bullet_point, ['detachmentDetailId', detail.id]), 'displayOrder'), renderDetailPoint)}
        </ul>
    </div>

    return <>
        {_detachment.bannerImage ? <HeaderImage src={_detachment.bannerImage} alt={_detachment.name} /> : null}
        <div id='column' className='Chapter'>
            <div className={Styles.grid}>
                {size(stratagems)
                    ? <Tile compact title='Stratagems' navigateTo='stratagems' state={{detachment: _detachment, data: stratagems}} />
                    : null
                }
                {size(enhancements)
                    ? <Tile compact title='Enhancements' navigateTo='enhancements' state={{detachment: _detachment, data: enhancements}} />
                    : null
                }
            </div>
            {map(detachmentDetails, renderDetail)}
            {map(detachmentRules, renderDetachmentRule)}
        </div>
    </>
}

export default Detachment
