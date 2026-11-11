import Constants from '../Constants'
import {main} from './appState'

// Тонкая обёртка над API бэкенда (40k.aoscom.online). Пользователи (/users) общие с AoS, ростеры (/rosters_db) отдельные.

const JSON_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/javascript, /; q=0.01'
}

const request = async (path, {method = 'GET', params, body} = {}) => {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    try {
        const response = await fetch(`${Constants.domain}${path}${query}`, {
            method,
            headers: body ? JSON_HEADERS : {Accept: JSON_HEADERS.Accept},
            body: body ? JSON.stringify(body) : undefined
        })
        return await response.json()
    } catch (error) {
        console.error(error)
        return null
    }
}

// Как человек идентифицируется на бэкенде: Telegram или VK
export const getIdentityParams = () => main.tgId ? {tgId: main.tgId} : {vkId: main.vkId}

// Пользователь
export const fetchUser = () => request('/users/user', {params: getIdentityParams()})
export const registerUser = (data) => request('/users/reg', {method: 'POST', body: {tgId: main.tgId, vkId: main.vkId, ...data}})

// Связка аккаунтов Telegram и VK
// Возвращают true/false: для связки важен только статус ответа (бот присылает код в личные сообщения)
const requestOk = async (path, params) => {
    try {
        const response = await fetch(`${Constants.domain}${path}?${new URLSearchParams(params)}`, {method: 'PUT', headers: JSON_HEADERS})
        return response.ok
    } catch (error) {
        console.error(error)
        return false
    }
}
export const generateLinkCode = (userId) => requestOk('/users/generate_link_code', {id: userId})
export const linkAccounts = (code) => requestOk('/users/link_accounts', {code, ...getIdentityParams()})

// Списки (ростеры)
export const fetchRostersByUser = () => request('/rosters_db/rosters_by_user', {params: getIdentityParams()})
export const fetchRoster = (rosterId) => request('/rosters_db/roster', {params: {roster_id: rosterId}})
export const fetchRosters = (filters, page = 1) => request('/rosters_db/rosters', {params: {filters: JSON.stringify(filters || {}), page}})
export const createRoster = (data) => request('/rosters_db/new_roster', {method: 'POST', body: data})
export const updateRoster = (rosterId, data) => request('/rosters_db/update_roster', {method: 'PUT', params: {roster_id: rosterId}, body: data})
export const deleteRoster = (rosterId, userId) => request('/rosters_db/delete_roster', {method: 'DELETE', params: {roster_id: rosterId, user_id: userId}})
