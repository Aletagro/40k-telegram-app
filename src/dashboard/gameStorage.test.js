import {saveGame, loadGames, getStorageSize, MAX_PLAYING, MAX_SIZE} from './gameStorage'
import {STATUS_PLAYING, STATUS_FINISHED} from './gameModel'

const make = (id, status, updatedAt, ballast = 0) => ({id, status, updatedAt, players: [{name: 'A', army: {snapshot: {big: 1}}}, {name: 'B'}], history: ['x'], ballast: 'x'.repeat(ballast)})

beforeEach(() => localStorage.clear())

test('недоигранных не больше MAX_PLAYING, старые удаляются', () => {
    for (let i = 1; i <= MAX_PLAYING + 2; i++) saveGame(make(`p${i}`, STATUS_PLAYING, i))
    const playing = loadGames().filter(game => game.status === STATUS_PLAYING)
    expect(playing.map(game => game.id)).toEqual(['p7', 'p6', 'p5', 'p4', 'p3'])
})

test('у завершённой партии убираются история отмены и списки армий', () => {
    saveGame(make('f1', STATUS_FINISHED, 1))
    const game = loadGames()[0]
    expect(game.history).toEqual([])
    expect(game.players[0].army.snapshot).toBeUndefined()
})

test('при превышении объёма удаляются самые старые завершённые, недоигранные остаются', () => {
    const chunk = Math.floor(MAX_SIZE / 4)
    saveGame(make('p1', STATUS_PLAYING, 1))
    for (let i = 1; i <= 5; i++) saveGame(make(`f${i}`, STATUS_FINISHED, 10 + i, chunk))
    const ids = loadGames().map(game => game.id)
    expect(ids).toContain('p1')
    expect(ids).toContain('f5')
    expect(ids).not.toContain('f1')
    expect(getStorageSize()).toBeLessThanOrEqual(MAX_SIZE)
})

test('текущая партия сохраняется всегда', () => {
    saveGame(make('big', STATUS_PLAYING, 1, MAX_SIZE + 1000))
    expect(loadGames().map(game => game.id)).toEqual(['big'])
})
