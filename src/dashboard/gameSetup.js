// Настройка новой партии: черновик в gameDraft, выбор основной миссии по Force Disposition, рекомендованные раскладки, старт.
import {t} from '../utilities/i18n'
import {gameDraft, main} from '../utilities/appState'
import {createGame, makeSecondary} from './gameModel'
import {saveGame} from './gameStorage'
import {MODE_STANDARD, MODE_COMBAT_PATROL, getSecondaryMissions, getPresets, getDeployments, getLayouts} from './missionData'

import find from 'lodash/find'
import filter from 'lodash/filter'
import map from 'lodash/map'
import compact from 'lodash/compact'
import uniq from 'lodash/uniq'
import includes from 'lodash/includes'
import some from 'lodash/some'

const dataBase = require('../utilities/db')

const newDraftPlayer = (name = '') => ({
    name,
    army: null,
    // выбор основной миссии вручную (по умолчанию она определяется армиями)
    primaryMissionId: null,
    secondaryMode: 'tactical',
    deckSource: 'digital',
    fixedIds: [],
    startingCp: 0,
    battleReady: false
})

const getMyName = () => [main.user?.lastname, main.user?.firstname].filter(Boolean).join(' ')

export const resetGameDraft = (mode) => {
    gameDraft.mode = mode
    gameDraft.players = [newDraftPlayer(getMyName()), newDraftPlayer()]
    gameDraft.setup = {firstPlayer: 0, presetId: null, twistId: null}
    gameDraft.manual = {}
}

const parseJson = (value, fallback) => {
    try {
        return JSON.parse(value) ?? fallback
    } catch (error) {
        return fallback
    }
}

// Сохранённый или чужой список с бэкенда -> армия партии. Список сохраняется целиком, чтобы потом показывать детачмент и стратагемы
export const listToArmy = (list, source) => ({
    source,
    rosterId: list.id,
    name: list.name,
    factionId: list.faction_id,
    detachmentIds: parseJson(list.detachment_ids, list.detachment_id ? [list.detachment_id] : []),
    forceDispositionId: list.force_disposition_id || '',
    pointsLimit: list.points_limit,
    ownerName: [list.lastname, list.firstname].filter(Boolean).join(' '),
    snapshot: list
})

export const getArmyFactionName = (army) => find(dataBase.data.faction_keyword, ['id', army?.factionId])?.name || ''

export const getArmyDetachmentNames = (army) => compact(map(army?.detachmentIds, id => find(dataBase.data.detachment, ['id', id])?.name))

export const getArmyForceDispositionName = (army) => find(dataBase.data.force_disposition, ['id', army?.forceDispositionId])?.name || ''

// Основная миссия игрока. В 40k её определяет пара Force Disposition (своя карта и карта соперника), в Combat Patrol - патруль игрока
export const getAutoPrimaryMissionId = (index) => {
    const army = gameDraft.players[index]?.army
    const opponent = gameDraft.players[1 - index]?.army
    if (!army) return null
    if (gameDraft.mode === MODE_COMBAT_PATROL) {
        return find(dataBase.data.primary_mission, mission => mission.detachmentId && includes(army.detachmentIds, mission.detachmentId))?.id || null
    }
    if (!army.forceDispositionId || !opponent?.forceDispositionId) return null
    return find(dataBase.data.force_disposition_mission, item => item.friendlyForceDispositionId === army.forceDispositionId
        && item.oppositionForceDispositionId === opponent.forceDispositionId)?.primaryMissionId || null
}

export const getPrimaryMissionId = (index) => gameDraft.players[index]?.primaryMissionId || getAutoPrimaryMissionId(index)

// Раскладки, рекомендованные для пары Force Disposition (для Combat Patrol - все три карты A, B, C)
export const getRecommendedPresets = () => {
    if (gameDraft.mode === MODE_COMBAT_PATROL) return getPresets(MODE_COMBAT_PATROL)
    const [first, second] = map(gameDraft.players, 'army')
    if (!first?.forceDispositionId || !second?.forceDispositionId) return []
    const rows = filter(dataBase.data.force_disposition_mission, item =>
        (item.friendlyForceDispositionId === first.forceDispositionId && item.oppositionForceDispositionId === second.forceDispositionId)
        || (item.friendlyForceDispositionId === second.forceDispositionId && item.oppositionForceDispositionId === first.forceDispositionId))
    const rowIds = map(rows, 'id')
    const presetIds = uniq(map(filter(dataBase.data.force_disposition_mission_recommended_preset, item => includes(rowIds, item.forceDispositionMissionId)), 'missionPresetId'))
    return compact(map(presetIds, id => find(dataBase.data.mission_preset, ['id', id])))
}

// Название сочетания расстановки и раскладки
export const getPresetLabel = (preset) => {
    if (!preset) return ''
    const deployment = find(getDeployments(gameDraft.mode), ['id', preset.missionDeploymentId])?.name
    const layout = find(getLayouts(gameDraft.mode), ['id', preset.missionLayoutId])?.name
    return [deployment, layout || preset.name].filter(Boolean).join(' · ')
}

export const getPreset = (presetId) => find(dataBase.data.mission_preset, ['id', presetId])

export const getFixedSecondaryMissions = () => filter(getSecondaryMissions(MODE_STANDARD), 'isFixedSecondary')

const newGameId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

// Создаёт и сохраняет партию из черновика
export const startGame = () => {
    const allSecondaryIds = map(getSecondaryMissions(MODE_STANDARD), 'id')
    const preset = getPreset(gameDraft.setup.presetId)
    const game = createGame({
        id: newGameId(),
        mode: gameDraft.mode,
        setup: {
            firstPlayer: gameDraft.setup.firstPlayer,
            presetId: gameDraft.setup.presetId,
            deploymentId: preset?.missionDeploymentId || null,
            layoutId: preset?.missionLayoutId || null,
            twistId: gameDraft.setup.twistId || null
        },
        players: map(gameDraft.players, (player, index) => ({
            name: player.name || t('Player {{number}}', {number: index + 1}),
            army: player.army,
            primaryMissionId: getPrimaryMissionId(index),
            startingCp: Number(player.startingCp) || 0,
            battleReady: player.battleReady,
            secondary: gameDraft.mode === MODE_STANDARD
                ? makeSecondary({mode: player.secondaryMode, fixedIds: player.fixedIds, allIds: allSecondaryIds, deckSource: player.deckSource, noFirstRound: map(filter(getSecondaryMissions(MODE_STANDARD), mission => !mission.isScorableFirstTurn), 'id')})
                : makeSecondary()
        }))
    })
    saveGame(game)
    return game
}

export const hasChosenBothArmies = () => gameDraft.players.length === 2 && !some(gameDraft.players, player => !player.army)
