// Миссии из базы данных для дашборда: наборы миссий, основные и вторичные миссии с очками, расстановки, повороты.
// Все функции только читают базу и возвращают простые объекты, поэтому ими удобно пользоваться и в экранах, и в тестах.
import find from 'lodash/find'
import filter from 'lodash/filter'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import groupBy from 'lodash/groupBy'

const dataBase = require('../utilities/db')

export const MODE_STANDARD = 'standard'
export const MODE_COMBAT_PATROL = 'combatPatrol'

// Английское название набора миссий -> режим дашборда
const PACK_NAME_BY_MODE = {[MODE_STANDARD]: 'Chapter Approved 2026-2027', [MODE_COMBAT_PATROL]: 'Combat Patrol'}

// Периоды, в которых цель основной миссии можно засчитывать
export const PERIODS = ['firstBattleRound', 'secondBattleRound', 'thirdBattleRound', 'fourthBattleRound', 'fifthBattleRound', 'endOfBattle']
const ROUND_PERIODS = {1: 'firstBattleRound', 2: 'secondBattleRound', 3: 'thirdBattleRound', 4: 'fourthBattleRound', 5: 'fifthBattleRound'}

export const getMissionPack = (mode) => find(dataBase.data.mission_pack, pack => (pack.nameEn || pack.name) === PACK_NAME_BY_MODE[mode])

// Лимиты очков набора: основная/вторичная миссия (всего и за раунд), потолок фиксированной вторичной, бонус за покраску
export const getScoreLimits = (mode) => {
    const pack = getMissionPack(mode)
    return {
        primaryGame: pack?.primaryMissionScoreGameLimit ?? 45,
        primaryRound: pack?.primaryMissionScoreBattleRoundLimit ?? 15,
        secondaryGame: pack?.secondaryMissionScoreGameLimit ?? 45,
        secondaryRound: pack?.secondaryMissionScoreBattleRoundLimit ?? 15,
        fixedSecondaryCard: pack?.fixedSecondaryMissionCapLimit ?? 20,
        battleReady: pack?.battleReadyArmyPointModifier ?? 10
    }
}

const byOrder = (items) => sortBy(items, 'displayOrder')

// Основные миссии режима. В Combat Patrol они привязаны к детачментам конкретных патрулей
export const getPrimaryMissions = (mode) => {
    const pack = getMissionPack(mode)
    return filter(dataBase.data.primary_mission, mission => mission.missionPackId === pack?.id)
}

const mapScoring = (scoring) => ({
    id: scoring.id,
    vp: scoring.victoryPoints,
    input: scoring.inputType,
    isCumulative: Boolean(scoring.isCumulative),
    isExclusive: Boolean(scoring.isMutuallyExclusive),
    // Потолок очков за одно срабатывание цели (например, No Prisoners: по 2 VP за юнит, но не больше 5 за ход)
    cap: scoring.victoryPointsCap ?? null,
    criteria: scoring.scoringCriteria || ''
})

// Основная миссия целиком: цели с моментом подсчёта, периодами и вариантами очков; действия миссии
export const getPrimaryMissionDetail = (missionId) => {
    const mission = find(dataBase.data.primary_mission, ['id', missionId])
    if (!mission) return null
    const objectives = map(byOrder(filter(dataBase.data.primary_mission_objective, ['primaryMissionId', missionId])), objective => ({
        id: objective.id,
        name: objective.name,
        when: objective.whenText || '',
        periods: map(filter(dataBase.data.primary_mission_objective_scorable_period, ['primaryMissionObjectiveId', objective.id]), 'scorablePeriod'),
        scorings: map(byOrder(filter(dataBase.data.primary_mission_objective_scoring, ['primaryMissionObjectiveId', objective.id])), mapScoring)
    }))
    const actions = filter(dataBase.data.primary_mission_action, ['primaryMissionId', missionId])
    return {id: mission.id, name: mission.name, lore: mission.lore, description: mission.description, detachmentId: mission.detachmentId || null, objectives, actions}
}

// Цели, которые можно засчитывать в данном раунде (1-5) или в конце битвы (round = 'end')
export const getRoundObjectives = (detail, round) => {
    const period = round === 'end' ? 'endOfBattle' : ROUND_PERIODS[round]
    return filter(detail?.objectives, objective => objective.periods.includes(period))
}

export const getSecondaryMissions = (mode) => {
    const pack = getMissionPack(mode)
    return filter(dataBase.data.secondary_mission, mission => mission.missionPackId === pack?.id)
}

// Вариант подсчёта вторичной миссии зависит от режима игрока: fixed (две выбранные на всю битву) или tactical (колода).
// Миссия без отдельных вариантов (scoringType standard) считается одинаково в обоих режимах
export const getSecondaryMissionDetail = (missionId, secondaryMode) => {
    const mission = find(dataBase.data.secondary_mission, ['id', missionId])
    if (!mission) return null
    const objectives = map(byOrder(filter(dataBase.data.secondary_mission_objective, ['secondaryMissionId', missionId])), objective => ({
        id: objective.id,
        name: objective.name,
        when: objective.whenText || '',
        scorings: map(
            filter(byOrder(filter(dataBase.data.secondary_mission_objective_scoring, ['secondaryMissionObjectiveId', objective.id])), scoring => scoring.scoringType === 'standard' || scoring.scoringType === secondaryMode),
            mapScoring
        )
    }))
    return {id: mission.id, name: mission.name, lore: mission.lore, description: mission.description, canBeFixed: Boolean(mission.isFixedSecondary), objectives}
}

// Расстановки (карта развёртывания), раскладки местности и готовые сочетания
export const getDeployments = (mode) => filter(dataBase.data.mission_deployment, ['missionPackId', getMissionPack(mode)?.id])
export const getLayouts = (mode) => filter(dataBase.data.mission_layout, ['missionPackId', getMissionPack(mode)?.id])
export const getPresets = (mode) => filter(dataBase.data.mission_preset, ['missionPackId', getMissionPack(mode)?.id])
export const getTwists = (mode) => filter(dataBase.data.mission_twist, ['missionPackId', getMissionPack(mode)?.id])

// Раскладки, доступные для выбранной расстановки (в базе они связаны таблицей mission_layout_linked_deployment)
export const getLayoutsForDeployment = (mode, deploymentId) => {
    const links = groupBy(dataBase.data.mission_layout_linked_deployment, 'missionLayoutId')
    return filter(getLayouts(mode), layout => !deploymentId || map(links[layout.id], 'missionDeploymentId').includes(deploymentId))
}

// Картинка раскладки (с разметкой и размерами). У стандартных раскладок это компонент правил с id раскладки.
// У Combat Patrol картинки лежат в правилах "Determine Deployment": заголовок "Layout A/B/C" и следом картинка
export const getLayoutImage = (layoutId) => {
    const direct = find(dataBase.data.rule_container_component, component => component.ruleContainerId === layoutId && component.imageUrl)
    if (direct) return direct.imageUrl
    const letter = find(dataBase.data.mission_layout, ['id', layoutId])?.name?.match(/Layout ([ABC])$/)?.[1]
    if (!letter) return null
    const header = find(dataBase.data.rule_container_component, component => component.type === 'header' && component.textContent === `Layout ${letter}` && component.ruleContainerId)
    if (!header) return null
    const order = Number(header.displayOrder) + 1
    return find(dataBase.data.rule_container_component, component => component.ruleContainerId === header.ruleContainerId && Number(component.displayOrder) === order && component.imageUrl)?.imageUrl || null
}
