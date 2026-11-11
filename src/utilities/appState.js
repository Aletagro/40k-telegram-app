import Constants from '../Constants'

// Данные текущего пользователя Telegram
export const main = {
    tgId: undefined,
    // Пользователь с бэкенда (после fetchUser)
    user: undefined
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
