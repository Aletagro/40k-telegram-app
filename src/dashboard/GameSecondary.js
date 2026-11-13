import {t} from '../utilities/i18n'
import React, {useState} from 'react'
import {toast} from 'react-toastify'
import Constants from '../Constants'
import Button from '../components/Button'
import {replaceAsterisks} from '../utilities/utils'
import {
    getTurnInfo, getScoreCount, getEntryPoints, setScore, achieveSecondary, discardSecondary, redrawSecondary, canRedrawSecondary, drawSecondary, canDrawSecondary,
    getCp, isPhysicalDeck, REDRAW_CP_COST
} from './gameModel'
import {getSecondaryMissionDetail} from './missionData'
import {MissionInfoModal} from './MissionPick'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'
import sumBy from 'lodash/sumBy'

import Styles from './styles/GameScreen.module.css'

const dataBase = require('../utilities/db')

const getHowLabel = (how) => ({achieved: t('Completed'), discarded: t('Discarded'), redrawn: t('Redrawn'), replaced: t('Replaced')}[how] || how)

const getCard = (id) => find(dataBase.data.secondary_mission, ['id', id])

// Вкладка вторичных миссий: активные карты игрока с очками, действия с тактической колодой, использованные карты
const GameSecondary = ({game, limits, apply, onOpenPicker}) => {
    const turn = getTurnInfo(game)
    const [playerIndex, setPlayerIndex] = useState(turn.playerIndex ?? 0)
    const [info, setInfo] = useState(null)
    const player = game.players[playerIndex]
    const secondary = player.secondary
    const isTactical = secondary.mode === 'tactical'
    const round = turn.round

    const cardVp = (cardId) => sumBy(filter(player.scores, item => item.kind === 'secondary' && item.card === cardId), getEntryPoints)

    const setCount = (cardId, objective, scoring, count) => {
        const exclusiveWith = scoring.isExclusive ? map(filter(objective.scorings, other => other.isExclusive && other.id !== scoring.id), 'id') : []
        apply(current => setScore(current, playerIndex, {round, kind: 'secondary', card: cardId, source: scoring.id, count: Math.max(0, count), vp: scoring.vp, cap: scoring.cap, exclusiveWith}))
    }

    const handleDiscard = (cardId) => {
        const result = discardSecondary(game, playerIndex, cardId)
        apply(() => result.game)
        if (!result.applied) toast.info(t('The card is discarded, but no CP: only 1 extra CP per round'), Constants.toastParams)
    }

    const renderScoring = (cardId, objective, scoring) => {
        const count = getScoreCount(game, playerIndex, {round, kind: 'secondary', card: cardId, source: scoring.id})
        return <div className={Styles.scoreRow} key={scoring.id}>
            <p className={Styles.scoreText}><b>{t('{{count}} VP', {count: scoring.vp})}</b>{scoring.cap ? <> ({t('max {{count}} VP', {count: scoring.cap})})</> : null}{scoring.criteria ? <> - {replaceAsterisks(scoring.criteria)}</> : null}</p>
            {scoring.input === 'checkbox'
                ? <button type='button' className={`${Styles.check} ${count ? Styles.checkOn : ''}`} onClick={() => setCount(cardId, objective, scoring, count ? 0 : 1)} aria-label={t('Scored')}>{count ? '✓' : ''}</button>
                : <div className={Styles.stepper}>
                    <button type='button' className={Styles.stepButton} onClick={() => setCount(cardId, objective, scoring, count - 1)}>−</button>
                    <span className={Styles.stepValue}>{count}</span>
                    <button type='button' className={Styles.stepButton} disabled={Boolean(scoring.cap) && count * scoring.vp >= scoring.cap} onClick={() => setCount(cardId, objective, scoring, count + 1)}>+</button>
                </div>}
        </div>
    }

    const renderCard = (cardId) => {
        const card = getCard(cardId)
        const detail = getSecondaryMissionDetail(cardId, secondary.mode)
        if (!card || !detail) return null
        return <div className={Styles.card} key={cardId}>
            <div className={Styles.cardHead}>
                <h4 className={Styles.cardTitle}>{card.name}</h4>
                <button type='button' className={Styles.infoButton} onClick={() => setInfo(card)} aria-label={t('Info')}>i</button>
            </div>
            {map(detail.objectives, objective => <div className={Styles.objective} key={objective.id}>
                {objective.when ? <p className={Styles.when}>{replaceAsterisks(objective.when)}</p> : null}
                {map(objective.scorings, scoring => renderScoring(cardId, objective, scoring))}
            </div>)}
            {secondary.mode === 'fixed'
                ? <p className={Styles.muted}>{t('VP from this card: {{count}} of {{max}}', {count: cardVp(cardId), max: limits.fixedSecondaryCard})}</p>
                : <div className={Styles.actions}>
                    <Button onClick={() => apply(current => achieveSecondary(current, playerIndex, cardId))}>{t('Completed')}</Button>
                    <Button type='secondary' onClick={() => handleDiscard(cardId)}>{t('Discard, +1 CP')}</Button>
                    <Button type='secondary' disabled={!canRedrawSecondary(game, playerIndex)} onClick={() => apply(current => redrawSecondary(current, playerIndex, cardId))}>
                        {secondary.redrawUsed ? t('Redraw (already used)') : t('Redraw for {{count}} CP', {count: REDRAW_CP_COST})}
                    </Button>
                </div>}
        </div>
    }

    const renderUsed = () => secondary.used.length ? <div className={Styles.card}>
        <h4 className={Styles.cardTitle}>{t('Used cards')}</h4>
        {map(secondary.used, (item, index) => <div className={Styles.usedRow} key={index}>
            <span>{getCard(item.id)?.name}</span>
            <span className={Styles.muted}>{getHowLabel(item.how)} · {t('Round {{round}}', {round: item.round})}{cardVp(item.id) ? ` · ${t('{{count}} VP', {count: cardVp(item.id)})}` : ''}</span>
        </div>)}
    </div> : null

    return <>
        <div className={Styles.tabs}>
            {map(game.players, (item, index) => <button type='button' key={index} className={`${Styles.tab} ${playerIndex === index ? Styles.tabActive : ''}`} onClick={() => setPlayerIndex(index)}>{item.name}</button>)}
        </div>
        {secondary.mode === 'none'
            ? <p className={Styles.muted}>{t('This player does not use secondary missions')}</p>
            : <>
                <p className={Styles.muted}>
                    {isTactical
                        ? isPhysicalDeck(secondary)
                            ? t('Tactical missions, physical deck. CP: {{cp}}', {cp: getCp(game, playerIndex)})
                            : t('Tactical missions. Cards in the deck: {{count}}. CP: {{cp}}', {count: secondary.deck.length, cp: getCp(game, playerIndex)})
                        : t('Fixed missions. They stay active the whole battle')}
                    {turn.isEnd ? '' : ` · ${t('Points go to: {{round}}', {round: t('Round {{round}}', {round})})}`}
                </p>
                {secondary.pendingDraw > 0 ? <Button onClick={onOpenPicker}>{t('Choose the cards you drew')}</Button> : null}
                {canDrawSecondary(game, playerIndex) ? <Button onClick={() => apply(current => drawSecondary(current, playerIndex))}>{isPhysicalDeck(secondary) ? t('Draw 2 cards, choose them') : t('Draw 2 cards')}</Button> : null}
                {map(secondary.active, renderCard)}
                {isTactical && !secondary.active.length ? <p className={Styles.muted}>{t('No active cards')}</p> : null}
                {renderUsed()}
            </>}
        <MissionInfoModal mission={info} kind='secondary' secondaryMode={secondary.mode} onClose={() => setInfo(null)} />
    </>
}

export default GameSecondary
