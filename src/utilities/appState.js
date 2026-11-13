import Constants from '../Constants'

// Данные текущего пользователя Telegram
export const main = {
    tgId: undefined,
    vkId: undefined,
    // Пользователь с бэкенда (после fetchUser)
    user: undefined,
    // Сохранённые списки пользователя
    rosters: [],
    showSaveListModal: false
}

// Текущий ростер. Структура описана в utilities/rosterModel.js, сбрасывается через resetRoster()
export const roster = {
    name: '',
    grandFaction: '',
    faction: '',
    factionId: '',
    battleSizeId: '',
    pointsLimit: 2000,
    detachmentIds: [],
    forceDispositionId: '',
    allegiances: {},
    units: []
}

// Списки других игроков (экран Community Lists): загруженные страницы, мета и фильтры
export const lists = {
    data: [],
    meta: {},
    isFirstReq: true,
    filters: {points_limit: 2000}
}

// Черновик новой партии для дашборда: режим, игроки и настройки до старта (см. dashboard/gameSetup.js)
export const gameDraft = {
    mode: null,
    players: [],
    setup: {},
    // выбор армии вручную по игрокам: {factionId, detachmentIds, dispositionId, battleSizeId}
    manual: {}
}

export const search = {
    value: '',
    Datasheets: [],
    Rules: [],
    Stratagems: [],
    Detachments: [],
    expand: {
        Datasheets: true,
        Rules: true,
        Stratagems: true,
        Detachments: true
    }
}

export const calc = {
    units: [{...Constants.newCalcUnit}]
}

export const navigationState = {
    isBuilder: false
}

export const isCollapseUnitsTypes = Constants.defaultIsCollapseUnitsTypes
