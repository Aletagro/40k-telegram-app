import {
    MODE_STANDARD, MODE_COMBAT_PATROL, getMissionPack, getScoreLimits, getPrimaryMissions, getPrimaryMissionDetail, getRoundObjectives,
    getSecondaryMissions, getSecondaryMissionDetail, getDeployments, getLayouts, getLayoutsForDeployment, getTwists
} from './missionData'

const dataBase = require('../utilities/db')

beforeAll(() => {
    dataBase.setDatabase(require('../dataBase.json'), 'en')
})

test('наборы миссий и лимиты', () => {
    expect(getMissionPack(MODE_STANDARD).nameEn).toBe('Chapter Approved 2026-2027')
    expect(getMissionPack(MODE_COMBAT_PATROL).nameEn).toBe('Combat Patrol')
    expect(getScoreLimits(MODE_STANDARD)).toEqual({primaryGame: 45, primaryRound: 15, secondaryGame: 45, secondaryRound: 15, fixedSecondaryCard: 20, battleReady: 10})
})

test('основные миссии: 25 обычных и 26 патрульных, у каждой есть цели с очками', () => {
    expect(getPrimaryMissions(MODE_STANDARD)).toHaveLength(25)
    expect(getPrimaryMissions(MODE_COMBAT_PATROL)).toHaveLength(26)
    getPrimaryMissions(MODE_STANDARD).forEach(mission => {
        const detail = getPrimaryMissionDetail(mission.id)
        expect(detail.objectives.length).toBeGreaterThan(0)
        detail.objectives.forEach(objective => {
            expect(objective.scorings.length).toBeGreaterThan(0)
            objective.scorings.forEach(scoring => expect(scoring.vp).toBeGreaterThan(0))
        })
        // в каждом раунде можно что-то засчитать, кроме, возможно, конца битвы
        for (const round of [1, 2, 3, 4, 5]) expect(getRoundObjectives(detail, round).length).toBeGreaterThanOrEqual(0)
    })
})

test('цели привязаны к раундам', () => {
    const mission = getPrimaryMissions(MODE_STANDARD).find(item => item.name === 'Determined Acquisition')
    const detail = getPrimaryMissionDetail(mission.id)
    expect(getRoundObjectives(detail, 1)).toHaveLength(1)
    expect(getRoundObjectives(detail, 2)).toHaveLength(2)
})

test('вторичные миссии: 18 карт, 4 из них можно брать фиксированными', () => {
    const missions = getSecondaryMissions(MODE_STANDARD)
    expect(missions).toHaveLength(18)
    expect(missions.filter(mission => mission.isFixedSecondary)).toHaveLength(4)
    missions.forEach(mission => {
        const tactical = getSecondaryMissionDetail(mission.id, 'tactical')
        expect(tactical.objectives.length).toBeGreaterThan(0)
        tactical.objectives.forEach(objective => expect(objective.scorings.length).toBeGreaterThan(0))
        if (mission.isFixedSecondary) {
            const fixed = getSecondaryMissionDetail(mission.id, 'fixed')
            fixed.objectives.forEach(objective => expect(objective.scorings.length).toBeGreaterThan(0))
        }
    })
})

test('расстановки, раскладки и повороты', () => {
    expect(getDeployments(MODE_STANDARD)).toHaveLength(6)
    expect(getDeployments(MODE_COMBAT_PATROL)).toHaveLength(3)
    expect(getLayouts(MODE_STANDARD)).toHaveLength(45)
    expect(getTwists(MODE_STANDARD)).toHaveLength(6)
    const deployment = getDeployments(MODE_STANDARD)[0]
    expect(getLayoutsForDeployment(MODE_STANDARD, deployment.id).length).toBeGreaterThan(0)
})
