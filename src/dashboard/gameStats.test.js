import {createGame, advanceTurn, setScore} from './gameModel'
import {getStats, getFinishedGames} from './gameStats'

test('статистика: победы, ничьи, поражения и средние очки', () => {
    const open = (vp0, vp1, factions, id) => {
        let game = createGame({id, mode: 'standard', players: [{name: 'Me', army: {factionId: factions[0]}}, {name: 'Opp', army: {factionId: factions[1]}}], now: 1})
        for (let i = 0; i < 10; i++) game = advanceTurn(game)
        if (vp0) game = setScore(game, 0, {round: 'end', kind: 'primary', source: 'x', count: 1, vp: vp0})
        if (vp1) game = setScore(game, 1, {round: 'end', kind: 'primary', source: 'x', count: 1, vp: vp1})
        return advanceTurn(game)
    }
    const games = [open(10, 4, ['a', 'x'], 'g1'), open(3, 3, ['a', 'y'], 'g2'), open(2, 9, ['b', 'x'], 'g3'), createGame({id: 'g4', mode: 'standard', players: [{name: 'Me'}, {name: 'Opp'}], now: 1})]
    games[0].updatedAt = 3; games[1].updatedAt = 2; games[2].updatedAt = 1
    const stats = getStats(games)
    expect(stats).toMatchObject({total: 3, wins: 1, draws: 1, losses: 1, winRate: 33, avgFor: 5, avgAgainst: 5.3})
    expect(stats.byArmy[0]).toMatchObject({key: 'a', games: 2, wins: 1, draws: 1})
    expect(stats.byOpponent[0]).toMatchObject({key: 'x', games: 2, wins: 1, losses: 1})
    expect(getFinishedGames(games).map(game => game.id)).toEqual(['g1', 'g2', 'g3'])
    expect(getStats([]).total).toBe(0)
})
