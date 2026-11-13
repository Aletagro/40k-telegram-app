import {
    createGame, getTurnInfo, advanceTurn, setScore, getScoreCount, getPlayerTotals, getResult, getCp, addOtherCp, spendCp, adjustCp,
    setSecondaryMode, makeSecondary, drawSecondary, achieveSecondary, discardSecondary, redrawSecondary, canRedrawSecondary, undo, canUndo, setBattleReady, STATUS_FINISHED
} from './gameModel'

const rng = () => 0.5
const newGame = (setup, players = [{name: 'A'}, {name: 'B'}]) => createGame({id: 'g1', mode: 'standard', setup, players, now: 1})

describe('ходы и CP', () => {
    test('первый ход: оба получают 1 Core CP, ходит первый игрок', () => {
        const game = newGame({firstPlayer: 1})
        expect(getTurnInfo(game)).toMatchObject({round: 1, playerIndex: 1, inRound: 0})
        expect([getCp(game, 0), getCp(game, 1)]).toEqual([1, 1])
    })

    test('порядок ходов по раундам и завершение после 10 ходов', () => {
        let game = newGame({firstPlayer: 0})
        const order = []
        for (let i = 0; i < 9; i++) {
            order.push(getTurnInfo(game).playerIndex)
            game = advanceTurn(game)
        }
        order.push(getTurnInfo(game).playerIndex)
        expect(order).toEqual([0, 1, 0, 1, 0, 1, 0, 1, 0, 1])
        expect(getTurnInfo(game)).toMatchObject({round: 5, isLast: true})
        expect(getCp(game, 0)).toBe(10)
        game = advanceTurn(game)
        expect(getTurnInfo(game)).toMatchObject({round: 'end', isEnd: true, playerIndex: null})
        expect(game.status).not.toBe(STATUS_FINISHED)
        expect(getCp(game, 0)).toBe(10)
        game = advanceTurn(game)
        expect(game.status).toBe(STATUS_FINISHED)
        expect(getCp(game, 0)).toBe(10)
    })

    test('очки в фазе конца битвы засчитываются, отмена не даёт CP повторно', () => {
        let game = newGame()
        for (let i = 0; i < 10; i++) game = advanceTurn(game)
        game = setScore(game, 0, {round: 'end', kind: 'primary', source: 'x', count: 1, vp: 4})
        expect(getPlayerTotals(game, 0).total).toBe(4)
        let game2 = newGame()
        const next = advanceTurn(game2)
        const again = advanceTurn(undo(next))
        expect([getCp(again, 0), getCp(again, 1)]).toEqual([getCp(next, 0), getCp(next, 1)])
    })

    test('стартовые CP', () => {
        const game = newGame({}, [{name: 'A', startingCp: 2}, {name: 'B'}])
        expect([getCp(game, 0), getCp(game, 1)]).toEqual([3, 1])
    })

    test('прочие CP не больше 1 за раунд, в новом раунде снова можно', () => {
        let game = newGame()
        let result = addOtherCp(game, 0)
        expect(result.applied).toBe(1)
        result = addOtherCp(result.game, 0)
        expect(result.applied).toBe(0)
        expect(getCp(result.game, 0)).toBe(2)
        game = advanceTurn(advanceTurn(result.game))
        expect(addOtherCp(game, 0).applied).toBe(1)
    })

    test('трата и ручная правка CP', () => {
        let game = spendCp(newGame(), 0, 1, 'stratagem')
        expect(getCp(game, 0)).toBe(0)
        game = adjustCp(game, 0, 3)
        expect(getCp(game, 0)).toBe(3)
    })
})

describe('очки и лимиты', () => {
    test('основная миссия: не больше 15 за раунд и 45 за игру', () => {
        let game = newGame()
        game = setScore(game, 0, {round: 1, kind: 'primary', source: 'a', count: 5, vp: 5})
        let totals = getPlayerTotals(game, 0)
        expect(totals.primary).toBe(15)
        expect(totals.ignored).toBe(10)
        for (const round of [2, 3, 4]) game = setScore(game, 0, {round, kind: 'primary', source: 'a', count: 3, vp: 5})
        game = setScore(game, 0, {round: 5, kind: 'primary', source: 'a', count: 3, vp: 5})
        totals = getPlayerTotals(game, 0)
        expect(totals.primary).toBe(45)
    })

    test('записи за конец битвы учитываются', () => {
        const game = setScore(newGame(), 0, {round: 'end', kind: 'primary', source: 'x', count: 2, vp: 3})
        expect(getPlayerTotals(game, 0).primary).toBe(6)
    })

    test('фиксированная вторичная: до 20 VP на карту', () => {
        let game = setSecondaryMode(newGame(), 0, {mode: 'fixed', fixedIds: ['c1', 'c2']}, rng)
        for (const round of [1, 2, 3, 4, 5]) game = setScore(game, 0, {round, kind: 'secondary', card: 'c1', source: 's', count: 1, vp: 8})
        const totals = getPlayerTotals(game, 0)
        expect(totals.secondary).toBe(20)
        expect(totals.ignored).toBe(20)
    })

    test('вторичные: не больше 15 за раунд', () => {
        let game = setSecondaryMode(newGame(), 0, {mode: 'fixed', fixedIds: ['c1', 'c2']}, rng)
        game = setScore(game, 0, {round: 2, kind: 'secondary', card: 'c1', source: 's', count: 1, vp: 12})
        game = setScore(game, 0, {round: 2, kind: 'secondary', card: 'c2', source: 's', count: 1, vp: 12})
        expect(getPlayerTotals(game, 0).secondary).toBe(15)
    })

    test('вторичные: итог до 45 VP', () => {
        let game = setSecondaryMode(newGame(), 0, {mode: 'tactical', allIds: ['a', 'b']}, rng)
        for (const round of [1, 2, 3, 4, 5]) game = setScore(game, 0, {round, kind: 'secondary', card: 'a', source: 's', count: 1, vp: 15})
        expect(getPlayerTotals(game, 0).secondary).toBe(45)
    })

    test('покрас 10 VP и победитель', () => {
        let game = setScore(newGame(), 0, {round: 1, kind: 'primary', source: 'a', count: 1, vp: 5})
        game = setBattleReady(game, 1, true)
        game = setScore(game, 1, {round: 1, kind: 'primary', source: 'a', count: 1, vp: 5})
        let result = getResult(game)
        expect(result.players.map(p => p.total)).toEqual([5, 15])
        expect(result.winner).toBe(1)
        game = setBattleReady(game, 0, true)
        expect(getResult(game).winner).toBeNull()
    })

    test('количество 0 удаляет запись, взаимоисключающие цели', () => {
        let game = setScore(newGame(), 0, {round: 1, kind: 'primary', source: 'a', count: 1, vp: 3, exclusiveWith: ['b']})
        game = setScore(game, 0, {round: 1, kind: 'primary', source: 'b', count: 1, vp: 6, exclusiveWith: ['a']})
        expect(getScoreCount(game, 0, {round: 1, kind: 'primary', source: 'a'})).toBe(0)
        expect(getPlayerTotals(game, 0).primary).toBe(6)
        game = setScore(game, 0, {round: 1, kind: 'primary', source: 'b', count: 0, vp: 6})
        expect(getPlayerTotals(game, 0).primary).toBe(0)
    })

    test('отмена возвращает прежнее состояние', () => {
        const start = newGame()
        let game = setScore(start, 0, {round: 1, kind: 'primary', source: 'a', count: 1, vp: 3})
        expect(canUndo(game)).toBe(true)
        game = undo(game)
        expect(getPlayerTotals(game, 0).primary).toBe(0)
        expect(canUndo(game)).toBe(false)
    })
})

describe('тактические вторичные', () => {
    const ids = ['a', 'b', 'c', 'd', 'e']
    const tactical = () => setSecondaryMode(newGame(), 0, {mode: 'tactical', allIds: ids}, rng)

    test('колода содержит все карты, добор по две', () => {
        let game = tactical()
        expect(game.players[0].secondary.deck.slice().sort()).toEqual(ids)
        game = drawSecondary(game, 0)
        expect(game.players[0].secondary.active).toHaveLength(2)
        expect(game.players[0].secondary.deck).toHaveLength(3)
    })

    test('выполненная карта уходит в отбой', () => {
        let game = drawSecondary(tactical(), 0)
        const card = game.players[0].secondary.active[0]
        game = achieveSecondary(game, 0, card)
        expect(game.players[0].secondary.active).not.toContain(card)
        expect(game.players[0].secondary.used[0]).toMatchObject({id: card, how: 'achieved'})
    })

    test('сброс карты даёт 1 CP, но не больше 1 за раунд', () => {
        let game = drawSecondary(tactical(), 0)
        const [first, second] = game.players[0].secondary.active
        let result = discardSecondary(game, 0, first)
        expect(result.applied).toBe(1)
        expect(getCp(result.game, 0)).toBe(2)
        result = discardSecondary(result.game, 0, second)
        expect(result.applied).toBe(0)
        expect(getCp(result.game, 0)).toBe(2)
    })

    test('обмен карты: один раз за битву за 1 CP', () => {
        let game = drawSecondary(tactical(), 0)
        const card = game.players[0].secondary.active[0]
        expect(canRedrawSecondary(game, 0)).toBe(true)
        game = redrawSecondary(game, 0, card)
        expect(getCp(game, 0)).toBe(0)
        expect(game.players[0].secondary.active).toHaveLength(2)
        expect(game.players[0].secondary.active).not.toContain(card)
        expect(canRedrawSecondary(game, 0)).toBe(false)
    })

    test('фиксированный режим: две карты всегда активны, добора нет', () => {
        let game = setSecondaryMode(newGame(), 1, {mode: 'fixed', fixedIds: ['x', 'y']}, rng)
        expect(game.players[1].secondary.active).toEqual(['x', 'y'])
        expect(drawSecondary(game, 1)).toBe(game)
    })
})

describe('создание партии', () => {
    test('данные игроков сохраняются, вторичные по умолчанию отключены', () => {
        const game = createGame({id: 'g', mode: 'combatPatrol', players: [{name: 'A', primaryMissionId: 'm1', battleReady: true}, {name: 'B', secondary: makeSecondary({mode: 'tactical', allIds: ['x', 'y']}, () => 0.5)}]})
        expect(game.players[0]).toMatchObject({primaryMissionId: 'm1', battleReady: true})
        expect(game.players[0].secondary.mode).toBe('none')
        expect(game.players[1].secondary.mode).toBe('tactical')
        expect(game.players[1].secondary.deck).toHaveLength(2)
    })
})
