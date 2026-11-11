import Constants from '../Constants'

// Тонкая обёртка над API бэкенда.

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

// Пользователь
export const fetchUser = (tgId) => request('/users/user', {params: {tgId}})
export const registerUser = (data) => request('/users/reg', {method: 'POST', body: data})

// Списки (ростеры)
export const fetchRostersByUser = (params) => request('/rosters_db/rosters_by_user', {params})
export const createRoster = (data) => request('/rosters_db/new_roster', {method: 'POST', body: data})
export const updateRoster = (rosterId, data) => request('/rosters_db/update_roster', {method: 'PUT', params: {roster_id: rosterId}, body: data})
export const deleteRoster = (rosterId, userId) => request('/rosters_db/delete_roster', {method: 'DELETE', params: {roster_id: rosterId, user_id: userId}})
