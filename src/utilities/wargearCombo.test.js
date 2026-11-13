const dataBase = require('./db')
dataBase.setDatabase(require('../dataBase.json'), 'en')
import {getUnitSlots, getChoiceMax, setChoiceCount} from './wargearModel'
import {createUnit, resetRoster} from './rosterModel'

const byLabel = (slot, label) => slot.choices.find(choice => choice.label === label)

test('Battle Sisters Squad: можно хевик и обычное спец-оружие, но не два хевика', () => {
    resetRoster()
    const ds = dataBase.data.datasheet.find(item => item.name === 'Battle Sisters Squad')
    let unit = createUnit(ds.id)
    const slot = getUnitSlots(unit).find(item => byLabel(item, 'Heavy bolter'))
    const heavy = byLabel(slot, 'Heavy bolter')
    const melta = byLabel(slot, 'Meltagun')
    const multi = byLabel(slot, 'Multi-melta')
    expect(getChoiceMax(unit, slot, heavy.id)).toBe(1)
    unit = {...unit, loadouts: setChoiceCount(unit, slot, heavy.id, 1)}
    expect(getChoiceMax(unit, slot, melta.id)).toBe(1)
    expect(getChoiceMax(unit, slot, multi.id)).toBe(0)
    expect(getChoiceMax(unit, slot, heavy.id)).toBe(1)
    unit = {...unit, loadouts: setChoiceCount(unit, slot, melta.id, 1)}
    expect(getChoiceMax(unit, slot, byLabel(slot, 'Ministorum flamer').id)).toBe(0)
    // два спец-оружия подряд тоже допустимы: 2× Meltagun
    let two = createUnit(ds.id)
    two = {...two, loadouts: setChoiceCount(two, slot, melta.id, 1)}
    expect(getChoiceMax(two, slot, melta.id)).toBe(2)
})
