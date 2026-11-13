const dataBase = require('./db')
dataBase.setDatabase(require('../dataBase.json'), 'en')
import {roster} from './appState'
import {createUnit, getCompositions, resetRoster} from './rosterModel'
import {getRosterIssues} from './rosterValidation'
import {getFactionDetachments} from './utils'

const byName = (table, name) => dataBase.data[table].find(item => item.name === name)

describe('правила состава ростера', () => {
    beforeEach(() => resetRoster())

    test('Callidus Assassin: в чужой армии как союзник одна цена, в Agents of the Imperium - своя', () => {
        const callidus = byName('datasheet', 'Callidus Assassin')
        const agents = byName('faction_keyword', 'Agents of the Imperium')
        const custodes = byName('faction_keyword', 'Adeptus Custodes')
        roster.factionId = custodes.id
        expect(getCompositions(callidus.id, true).map(item => item.points)).toEqual([100])
        roster.factionId = agents.id
        expect(getCompositions(callidus.id, false).length).toBe(1)
        expect(getCompositions(callidus.id, false)[0].referenceGroupingKeywordId).toBeNull()
    })

    test('боевые патрули не попадают в детачменты обычной армии', () => {
        dataBase.data.faction_keyword.forEach(faction => {
            expect(getFactionDetachments(faction.id).some(detachment => detachment.isCombatPatrol)).toBe(false)
        })
    })

    test('поддержка без присоединения - ошибка, с присоединением - нет', () => {
        const support = dataBase.data.datasheet_bodyguard_group.find(group => group.bodyguardType === 'support' && !group.requiredDetachmentId && !group.excludedDetachmentId)
        const bodyguardLink = dataBase.data.datasheet_bodyguard_group_datasheet.find(link => link.datasheetBodyguardGroupId === support.id)
        const sup = createUnit(support.datasheetId)
        const guard = createUnit(bodyguardLink.datasheetId)
        roster.units = [sup, guard]
        const has = () => getRosterIssues().some(issue => issue.uid === sup.uid && /support unit must be attached/.test(issue.message))
        expect(has()).toBe(true)
        sup.attachedToUid = guard.uid
        expect(has()).toBe(false)
    })
})
