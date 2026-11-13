// Партии дашборда хранятся в localStorage устройства: незавершённая партия продолжается после закрытия приложения
import find from 'lodash/find'
import filter from 'lodash/filter'
import {STATUS_PLAYING} from './gameModel'

const KEY = 'dashboardGames'
const MAX_GAMES = 50

const read = () => {
    try {
        const games = JSON.parse(localStorage.getItem(KEY))
        return Array.isArray(games) ? games : []
    } catch (error) {
        return []
    }
}

const write = (games) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(games))
        return true
    } catch (error) {
        return false
    }
}

export const loadGames = () => read()

export const getGame = (id) => find(read(), ['id', id])

// Последняя незавершённая партия
export const getActiveGame = () => find(read(), game => game.status === STATUS_PLAYING)

// Новая или обновлённая партия ставится первой. У завершённых история отмены не нужна
export const saveGame = (game) => {
    const stored = game.status === STATUS_PLAYING ? game : {...game, history: []}
    return write([stored, ...filter(read(), item => item.id !== game.id)].slice(0, MAX_GAMES))
}

export const deleteGame = (id) => write(filter(read(), item => item.id !== id))
