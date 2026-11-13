const dataBase = require('./db')
dataBase.setDatabase(require('../dataBase.json'), 'en')
import {roster} from './appState'
import {getUnitsSortesByType, getCodexInfo, getParentCodexId} from './utils'
import {getAttachTargets, findAttachGroup} from './rosterValidation'
import {createUnit, resetRoster} from './rosterModel'

test('Celestine is Epic Hero', () => {
    const faction = dataBase.data.faction_keyword.find(f => f.name === 'Adepta Sororitas')
    const groups = getUnitsSortesByType(faction, getCodexInfo(faction.id), [], getParentCodexId(faction))
    const epic = groups.find(g => g.title === 'Epic Heroes' || /Epic/.test(g.title))
    const names = (g) => (g.units || []).map(u => u.name)
    expect(names(epic)).toContain('Saint Celestine')
    expect(names(groups.find(g => g.title === 'Infantry' || g.title === 'Battleline') || {})).not.toContain('Saint Celestine')
})

test('Palatine with Catechism relic can lead Repentia', () => {
    resetRoster()
    const enh = dataBase.data.enhancement.find(e => e.name === 'Catechism of Divine Penitence')
    const palatine = dataBase.data.datasheet.find(d => d.name === 'Canoness' ) || dataBase.data.datasheet.find(d => d.name === 'Palatine')
    const repentia = dataBase.data.datasheet.find(d => d.name === 'Repentia Squad')
    const leader = createUnit(palatine.id)
    const target = createUnit(repentia.id)
    roster.detachmentIds = [enh.detachmentId]
    roster.units = [leader, target]
    expect(findAttachGroup(leader, target)).toBeFalsy()
    leader.enhancementId = enh.id
    expect(findAttachGroup(leader, target)).toBeTruthy()
    expect(getAttachTargets(leader).map(u => u.uid)).toContain(target.uid)
})
