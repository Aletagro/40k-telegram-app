import Constants from '../Constants'

export const roster = {
    grandAlliance: '',
    allegiance: '',
    regiments: [
        {
            units: [],
            heroId: '',
            points: 0,
            artefact: '',
            heroicTrait: ''
        }
    ],
    generalRegimentIndex: null,
    auxiliaryUnits: [],
    regimentOfRenown: null,
    regimentsOfRenownUnits: [],
    battleFormation: '',
    withoutBattleFormation: false,
    spellsLore: '',
    prayersLore: '',
    manifestationLore: '',
    manifestationsList: [],
    factionTerrain: '',
    pointsLimit: 2000,
    points: 0
}

export const search = {
    value: '',
    Warscrolls: [],
    Rules: [],
    Allegiances: [],
    expand: {
        Warscrolls: true,
        Rules: true,
        Allegiances: true
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