// Модель партии для дашборда: состояние партии и чистые функции, которые возвращают новое состояние.
// Очки хранятся как записи {round, kind, card, source, count, vp}, а итоги считаются заново с учётом лимитов набора миссий:
// основная миссия до 45 VP (не больше 15 за раунд), вторичные до 45 VP (не больше 15 за раунд, а каждая фиксированная
// карта не больше 20 VP), 10 VP за покрас армии. Очки сверх лимита не теряются в записях, а просто не учитываются в итоге.
// CP: по 1 Core CP каждому игроку в Command phase каждого хода, остальные прибавки не больше 1 за раунд на игрока.
import filter from 'lodash/filter'
import find from 'lodash/find'
import map from 'lodash/map'
import sum from 'lodash/sum'
import sumBy from 'lodash/sumBy'
import omit from 'lodash/omit'
import range from 'lodash/range'
import without from 'lodash/without'

export const MAX_ROUNDS = 5
export const HISTORY_LIMIT = 30
export const OTHER_CP_PER_ROUND = 1
export const TACTICAL_DRAW_COUNT = 2
export const REDRAW_CP_COST = 1

export const DEFAULT_LIMITS = {primaryGame: 45, primaryRound: 15, secondaryGame: 45, secondaryRound: 15, fixedSecondaryCard: 20, battleReady: 10}

export const STATUS_PLAYING = 'playing'
export const STATUS_FINISHED = 'finished'

const EMPTY_SECONDARY = {mode: 'none', fixedIds: [], deck: [], active: [], used: [], redrawUsed: false}

const shuffle = (items, rng = Math.random) => {
    const result = [...items]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

// Состояние вторичных миссий игрока: none (без них), fixed (две карты на всю битву) или tactical (колода из всех карт набора)
export const makeSecondary = ({mode, fixedIds = [], allIds = []} = {}, rng) => {
    if (mode === 'fixed') return {...EMPTY_SECONDARY, mode, fixedIds, active: [...fixedIds]}
    if (mode === 'tactical') return {...EMPTY_SECONDARY, mode, deck: shuffle(allIds, rng)}
    return {...EMPTY_SECONDARY}
}

// player: {name, army, primaryMissionId, startingCp, battleReady, secondary}
const newPlayer = (player = {}) => ({
    name: player.name || '',
    army: player.army || null,
    primaryMissionId: player.primaryMissionId || null,
    startingCp: player.startingCp || 0,
    scores: [],
    cp: [],
    battleReady: Boolean(player.battleReady),
    secondary: player.secondary || {...EMPTY_SECONDARY}
})

const snapshot = (game) => JSON.stringify(omit(game, 'history'))

// Сохраняет предыдущее состояние для отмены и обновляет время
const commit = (game, next, now = Date.now()) => ({
    ...next,
    history: [...(game.history || []).slice(-(HISTORY_LIMIT - 1)), snapshot(game)],
    updatedAt: now
})

export const canUndo = (game) => Boolean(game.history?.length)

export const undo = (game) => {
    if (!canUndo(game)) return game
    const history = game.history.slice(0, -1)
    return {...JSON.parse(game.history[game.history.length - 1]), history}
}

const setPlayer = (game, index, patch) => ({
    ...game,
    players: map(game.players, (player, playerIndex) => playerIndex === index ? {...player, ...(typeof patch === 'function' ? patch(player) : patch)} : player)
})

// --- Создание партии и ход игры ---

// setup: {presetId, deploymentId, layoutId, twistId, firstPlayer: 0|1}
export const createGame = ({id, mode, setup = {}, players = [], now = Date.now()}) => {
    const game = {
        id,
        version: 1,
        mode,
        status: STATUS_PLAYING,
        createdAt: now,
        updatedAt: now,
        setup: {firstPlayer: 0, ...setup},
        players: [newPlayer(players[0]), newPlayer(players[1])],
        turnIndex: 0,
        history: []
    }
    // Стартовые CP и Core CP первого хода
    const withStart = map(game.players, player => ({...player, cp: player.startingCp ? [{round: 1, type: 'start', amount: player.startingCp}] : []}))
    return addCoreCp({...game, players: withStart})
}

// Номер хода turnIndex (0-9): раунд, порядок хода в раунде и индекс игрока, который ходит
export const getTurnInfo = (game) => {
    const turnIndex = game.turnIndex || 0
    // После 10-го хода наступает фаза конца битвы: в ней тоже можно получать очки, ходов уже нет
    if (turnIndex >= MAX_ROUNDS * 2) return {turnIndex, round: 'end', inRound: 0, playerIndex: null, isLast: false, isEnd: true}
    const first = game.setup?.firstPlayer || 0
    const inRound = turnIndex % 2
    return {
        turnIndex,
        round: Math.floor(turnIndex / 2) + 1,
        inRound,
        playerIndex: inRound === 0 ? first : 1 - first,
        isLast: turnIndex >= MAX_ROUNDS * 2 - 1,
        isEnd: false
    }
}

const addCoreCp = (game) => {
    const {round} = getTurnInfo(game)
    return {...game, players: map(game.players, player => ({...player, cp: [...player.cp, {round, type: 'core', amount: 1}]}))}
}

// Следующий ход: оба игрока получают Core CP. После последнего хода наступает конец битвы (без Core CP), потом партия завершается
export const advanceTurn = (game, now) => {
    if (game.status === STATUS_FINISHED) return game
    const info = getTurnInfo(game)
    if (info.isEnd) return commit(game, {...game, status: STATUS_FINISHED}, now)
    if (info.isLast) return commit(game, {...game, turnIndex: game.turnIndex + 1}, now)
    return commit(game, addCoreCp({...game, turnIndex: game.turnIndex + 1}), now)
}

export const finishGame = (game, now) => game.status === STATUS_FINISHED ? game : commit(game, {...game, status: STATUS_FINISHED}, now)

// --- Очки ---

const sameSource = (a, b) => a.round === b.round && a.kind === b.kind && (a.card || null) === (b.card || null) && a.source === b.source

// Ставит количество срабатываний цели. count 0 удаляет запись. exclusiveWith: источники цели, которые нельзя брать вместе с этим
export const setScore = (game, playerIndex, entry, now) => {
    const {count, exclusiveWith = []} = entry
    const base = {round: entry.round, kind: entry.kind, card: entry.card || null, source: entry.source}
    const kept = filter(game.players[playerIndex].scores, item => !sameSource(item, base)
        && !(count > 0 && exclusiveWith.includes(item.source) && item.round === base.round && item.kind === base.kind && (item.card || null) === base.card))
    const scores = count > 0 ? [...kept, {...base, count, vp: entry.vp}] : kept
    return commit(game, setPlayer(game, playerIndex, {scores}), now)
}

export const getScoreCount = (game, playerIndex, entry) => {
    const base = {round: entry.round, kind: entry.kind, card: entry.card || null, source: entry.source}
    return find(game.players[playerIndex].scores, item => sameSource(item, base))?.count || 0
}

export const setBattleReady = (game, playerIndex, value, now) => commit(game, setPlayer(game, playerIndex, {battleReady: Boolean(value)}), now)

// Итоги игрока: очки по раундам и источникам с учётом лимитов, а также сколько очков не засчитано из-за лимитов
export const getPlayerTotals = (game, playerIndex, limits = DEFAULT_LIMITS) => {
    const player = game.players[playerIndex]
    const isFixed = player.secondary.mode === 'fixed'
    const rounds = []
    const fixedUsed = {}
    let primaryTotal = 0
    let secondaryTotal = 0
    let ignored = 0
    range(1, MAX_ROUNDS + 1).concat('end').forEach(round => {
        const entries = filter(player.scores, ['round', round])
        const primaryRaw = sumBy(filter(entries, ['kind', 'primary']), item => item.count * item.vp)
        // Потолок на карту фиксированной вторичной миссии считается по всей битве
        const secondaryEntries = filter(entries, ['kind', 'secondary'])
        let secondaryRaw = 0
        secondaryEntries.forEach(item => {
            const points = item.count * item.vp
            if (!isFixed) {
                secondaryRaw += points
                return
            }
            const left = Math.max(0, limits.fixedSecondaryCard - (fixedUsed[item.card] || 0))
            const taken = Math.min(points, left)
            fixedUsed[item.card] = (fixedUsed[item.card] || 0) + taken
            ignored += points - taken
            secondaryRaw += taken
        })
        const primary = Math.min(primaryRaw, limits.primaryRound, Math.max(0, limits.primaryGame - primaryTotal))
        const secondary = Math.min(secondaryRaw, limits.secondaryRound, Math.max(0, limits.secondaryGame - secondaryTotal))
        ignored += primaryRaw - primary + secondaryRaw - secondary
        primaryTotal += primary
        secondaryTotal += secondary
        rounds.push({round, primary, secondary, primaryRaw, secondaryRaw})
    })
    const battleReady = player.battleReady ? limits.battleReady : 0
    return {primary: primaryTotal, secondary: secondaryTotal, battleReady, total: primaryTotal + secondaryTotal + battleReady, rounds, ignored}
}

// Итоги партии: очки обоих игроков и победитель (null при ничьей)
export const getResult = (game, limits = DEFAULT_LIMITS) => {
    const players = [getPlayerTotals(game, 0, limits), getPlayerTotals(game, 1, limits)]
    const winner = players[0].total === players[1].total ? null : players[0].total > players[1].total ? 0 : 1
    return {players, winner}
}

// --- Command Points ---

export const getCp = (game, playerIndex) => sumBy(game.players[playerIndex].cp, 'amount')

const getOtherCpInRound = (game, playerIndex, round) => sumBy(filter(game.players[playerIndex].cp, item => item.type === 'other' && item.round === round), 'amount')

// Прибавка CP не из Core CP: не больше 1 за раунд на игрока. Возвращает {game, applied}, applied меньше amount, если лимит исчерпан
const gainOtherCp = (game, playerIndex, amount) => {
    const {round} = getTurnInfo(game)
    const applied = Math.max(0, Math.min(amount, OTHER_CP_PER_ROUND - getOtherCpInRound(game, playerIndex, round)))
    if (!applied) return {game, applied: 0}
    return {game: setPlayer(game, playerIndex, player => ({cp: [...player.cp, {round, type: 'other', amount: applied}]})), applied}
}

export const canGainOtherCp = (game, playerIndex) => getOtherCpInRound(game, playerIndex, getTurnInfo(game).round) < OTHER_CP_PER_ROUND

export const addOtherCp = (game, playerIndex, now) => {
    const result = gainOtherCp(game, playerIndex, 1)
    return {game: result.applied ? commit(game, result.game, now) : game, applied: result.applied}
}

// Трата CP на стратагему или ручная правка (adjust может быть и со знаком минус)
export const spendCp = (game, playerIndex, amount, note, now) => {
    const {round} = getTurnInfo(game)
    return commit(game, setPlayer(game, playerIndex, player => ({cp: [...player.cp, {round, type: 'spend', amount: -Math.abs(amount), note}]})), now)
}

export const adjustCp = (game, playerIndex, amount, now) => {
    const {round} = getTurnInfo(game)
    return commit(game, setPlayer(game, playerIndex, player => ({cp: [...player.cp, {round, type: 'adjust', amount}]})), now)
}

// --- Вторичные миссии ---

// Смена режима вторичных миссий уже в ходе партии (обычно режим выбирается при настройке)
export const setSecondaryMode = (game, playerIndex, config, rng, now) => commit(game, setPlayer(game, playerIndex, {secondary: makeSecondary(config, rng)}), now)

const drawFrom = (secondary, count) => {
    const drawn = secondary.deck.slice(0, count)
    return {...secondary, deck: secondary.deck.slice(drawn.length), active: [...secondary.active, ...drawn]}
}

// Добор в начале Command phase (по правилам две карты)
export const drawSecondary = (game, playerIndex, count = TACTICAL_DRAW_COUNT, now) => {
    if (game.players[playerIndex].secondary.mode !== 'tactical') return game
    return commit(game, setPlayer(game, playerIndex, player => ({secondary: drawFrom(player.secondary, count)})), now)
}

// Карта выполнена: уходит в отбой (в тактическом режиме после получения очков)
export const achieveSecondary = (game, playerIndex, cardId, now) => {
    const {round} = getTurnInfo(game)
    return commit(game, setPlayer(game, playerIndex, player => ({secondary: {
        ...player.secondary,
        active: without(player.secondary.active, cardId),
        used: [...player.secondary.used, {id: cardId, round, how: 'achieved'}]
    }})), now)
}

// Сброс активной карты: +1 CP (в пределах лимита прибавок за раунд). Возвращает {game, applied}
export const discardSecondary = (game, playerIndex, cardId, now) => {
    const {round} = getTurnInfo(game)
    const moved = setPlayer(game, playerIndex, player => ({secondary: {
        ...player.secondary,
        active: without(player.secondary.active, cardId),
        used: [...player.secondary.used, {id: cardId, round, how: 'discarded'}]
    }}))
    const result = gainOtherCp(moved, playerIndex, 1)
    return {game: commit(game, result.game, now), applied: result.applied}
}

export const canRedrawSecondary = (game, playerIndex) => {
    const secondary = game.players[playerIndex].secondary
    return secondary.mode === 'tactical' && !secondary.redrawUsed && getCp(game, playerIndex) >= REDRAW_CP_COST && secondary.deck.length > 0
}

// Один раз за битву: 1 CP, сбросить одну активную карту и взять новую (без CP за сброс)
export const redrawSecondary = (game, playerIndex, cardId, now) => {
    if (!canRedrawSecondary(game, playerIndex)) return game
    const {round} = getTurnInfo(game)
    return commit(game, setPlayer(game, playerIndex, player => {
        const discarded = {
            ...player.secondary,
            active: without(player.secondary.active, cardId),
            used: [...player.secondary.used, {id: cardId, round, how: 'redrawn'}],
            redrawUsed: true
        }
        return {secondary: drawFrom(discarded, 1), cp: [...player.cp, {round, type: 'spend', amount: -REDRAW_CP_COST, note: 'redraw'}]}
    }), now)
}

// Замена карты без траты CP, когда это разрешает условие самой карты (например, "When drawn: ... you can discard this card and draw a new one")
export const replaceSecondary = (game, playerIndex, cardId, now) => {
    const secondary = game.players[playerIndex].secondary
    if (!secondary.deck.length) return game
    const {round} = getTurnInfo(game)
    return commit(game, setPlayer(game, playerIndex, player => ({secondary: drawFrom({
        ...secondary,
        active: without(secondary.active, cardId),
        used: [...secondary.used, {id: cardId, round, how: 'replaced'}]
    }, 1)})), now)
}

export const setPlayerInfo = (game, playerIndex, patch, now) => commit(game, setPlayer(game, playerIndex, patch), now)

export const getTotalCpGained = (game, playerIndex) => sum(map(filter(game.players[playerIndex].cp, item => item.amount > 0), 'amount'))
