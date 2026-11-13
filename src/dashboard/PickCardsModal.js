import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import Modal from '../components/Modal'
import Button from '../components/Button'
import {pickSecondary, getAvailableSecondary} from './gameModel'
import {MissionOption, MissionInfoModal} from './MissionPick'

import map from 'lodash/map'
import find from 'lodash/find'
import compact from 'lodash/compact'
import sortBy from 'lodash/sortBy'
import includes from 'lodash/includes'
import without from 'lodash/without'

import Styles from './styles/Dashboard.module.css'

const dataBase = require('../utilities/db')

// Выбор карт, которые игрок физически вытянул из своей колоды (начало хода или обмен за CP)
const PickCardsModal = ({game, playerIndex, open, onClose, apply}) => {
    const [selected, setSelected] = useState([])
    const [info, setInfo] = useState(null)
    const player = game.players[playerIndex]
    const count = player?.secondary.pendingDraw || 0
    const cards = sortBy(compact(map(player ? getAvailableSecondary(player.secondary) : [], id => find(dataBase.data.secondary_mission, ['id', id]))), 'name')

    const toggle = (id) => setSelected(current => includes(current, id) ? without(current, id) : current.length < count ? [...current, id] : [...current.slice(1), id])

    const handleConfirm = () => {
        apply(current => pickSecondary(current, playerIndex, selected))
        setSelected([])
    }

    return <Modal visible={open && count > 0} title={t('{{name}}: cards you drew', {name: player?.name})} onClose={onClose}>
        <div className={Styles.pickBox}>
            <p className={Styles.muted}>{t('Choose {{count}} of the cards below: {{chosen}} chosen', {count, chosen: selected.length})}</p>
            {map(cards, card => <MissionOption key={card.id} mission={card} active={includes(selected, card.id)} onClick={() => toggle(card.id)} onInfo={() => setInfo(card)} />)}
        </div>
        <Button disabled={selected.length !== count} onClick={handleConfirm}>{t('Confirm')}</Button>
        <MissionInfoModal mission={info} kind='secondary' secondaryMode='tactical' onClose={() => setInfo(null)} />
    </Modal>
}

export default PickCardsModal
