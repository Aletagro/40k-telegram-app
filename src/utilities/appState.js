import Constants from '../Constants'

export const roster = {
    grandFaction: '',
    faction: '',
    factionId: '',
    units: {},
    warlordId: null,
    detachment: '',
    pointsLimit: 2000,
    points: {
        all: 0
    }
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

export const builderFilters = {
    hidePotentialLegends: false,
    showLegends: false
}

export const singlePlayer = {
    firstPlayer: {...Constants.newPlayer},
    secondPlayer: {...Constants.newPlayer},
    battleplan: {
        name: '',
        id: ''
    },
    rounds: [],
    currentRound: 1,
    gameStarted: false,
    gameOver: false,
    underdog: 0
}

export const calc = {
    units: [{...Constants.newCalcUnit}]
}

export const navigationState = {
    isBuilder: false
}

export const isCollapseUnitsTypes = Constants.defaultIsCollapseUnitsTypes

export const isCollapseRegimentAlliances = Constants.defaultIsCollapseRegimentAlliances