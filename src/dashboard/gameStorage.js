// Партии дашборда хранятся в localStorage устройства: незавершённая партия продолжается после закрытия приложения
import find from 'lodash/find'
import filter from 'lodash/filter'
import map from 'lodash/map'
import omit from 'lodash/omit'
import {STATUS_PLAYING} from './gameModel'

const KEY = 'dashboardGames'
// Недоигранных партий не больше этого числа, самые старые удаляются
export const MAX_PLAYING = 5
// Все партии вместе (в символах записи localStorage); сверх этого удаляются самые старые завершённые
export const MAX_SIZE = 3 * 1024 * 1024

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

const isPlaying = (game) => game.status === STATUS_PLAYING

// Лишние недоигранные и самые старые завершённые партии. Партия first (только что сохранённая) не удаляется.
// Список упорядочен от новых к старым, поэтому "самые старые" - последние
export const prune = (games, first) => {
    let playingCount = 0
    let result = filter(games, game => {
        if (!isPlaying(game)) return true
        playingCount++
        return playingCount <= MAX_PLAYING || game === first
    })
    let size = JSON.stringify(result).length
    while (size > MAX_SIZE) {
        let index = -1
        for (let i = result.length - 1; i >= 0; i--) {
            if (!isPlaying(result[i]) && result[i] !== first) {
                index = i
                break
            }
        }
        if (index < 0) break
        size -= JSON.stringify(result[index]).length + 1
        result = [...result.slice(0, index), ...result.slice(index + 1)]
    }
    return result
}

// Сколько места занимают сохранённые партии (символов записи localStorage)
export const getStorageSize = () => (localStorage.getItem(KEY) || '').length

export const loadGames = () => read()

export const getGame = (id) => find(read(), ['id', id])

// Последняя незавершённая партия
export const getActiveGame = () => find(read(), isPlaying)

// Новая или обновлённая партия ставится первой. У завершённых история отмены и полные списки армий (они велики) уже не нужны
export const saveGame = (game) => {
    const stored = isPlaying(game) ? game : {...game, history: [], players: map(game.players, player => player.army?.snapshot ? {...player, army: omit(player.army, 'snapshot')} : player)}
    let games = prune([stored, ...filter(read(), item => item.id !== game.id)], stored)
    // Если браузер всё равно не принял запись, убираем самые старые завершённые партии по одной
    while (!write(games)) {
        const index = games.map((item, i) => (!isPlaying(item) && item !== stored ? i : -1)).filter(i => i >= 0).pop()
        if (index === undefined) return false
        games = [...games.slice(0, index), ...games.slice(index + 1)]
    }
    return true
}

export const deleteGame = (id) => write(filter(read(), item => item.id !== id))
