// Статистика по завершённым партиям. "Я" - первый игрок партии (владелец устройства по умолчанию)
import {getResult, STATUS_FINISHED} from './gameModel'
import {getScoreLimits} from './missionData'

import filter from 'lodash/filter'
import sortBy from 'lodash/sortBy'
import map from 'lodash/map'

export const getFinishedGames = (games) => sortBy(filter(games, ['status', STATUS_FINISHED]), game => -game.updatedAt)

const outcome = (result) => result.winner === null ? 'draws' : result.winner === 0 ? 'wins' : 'losses'

const addTo = (groups, key, game, result) => {
    const group = groups[key] || (groups[key] = {key, games: 0, wins: 0, draws: 0, losses: 0})
    group.games++
    group[outcome(result)]++
}

const toList = (groups) => sortBy(map(groups, group => group), group => -group.games)

export const getStats = (games) => {
    const finished = getFinishedGames(games)
    const stats = {total: finished.length, wins: 0, draws: 0, losses: 0, pointsFor: 0, pointsAgainst: 0}
    const mine = {}
    const opponents = {}
    finished.forEach(game => {
        const result = getResult(game, getScoreLimits(game.mode))
        stats[outcome(result)]++
        stats.pointsFor += result.players[0].total
        stats.pointsAgainst += result.players[1].total
        addTo(mine, game.players[0].army?.factionId || '', game, result)
        addTo(opponents, game.players[1].army?.factionId || '', game, result)
    })
    stats.winRate = stats.total ? Math.round(stats.wins / stats.total * 100) : 0
    stats.avgFor = stats.total ? Math.round(stats.pointsFor / stats.total * 10) / 10 : 0
    stats.avgAgainst = stats.total ? Math.round(stats.pointsAgainst / stats.total * 10) / 10 : 0
    stats.byArmy = toList(mine)
    stats.byOpponent = toList(opponents)
    return stats
}
