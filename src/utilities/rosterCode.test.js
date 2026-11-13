import {encodeRosterCode, decodeRosterCode, looksLikeRosterCode} from './rosterCode'

const id = '3f2b8c1e-9a4d-4e7b-8c15-0d6a7e2f91b3'

test('код ростера восстанавливает id', () => {
    const code = encodeRosterCode(id)
    expect(code).toMatch(/^40K(-[0-9A-Z]{1,4})+$/)
    expect(decodeRosterCode(code)).toBe(id)
    expect(decodeRosterCode(`  ${code.toLowerCase().replace(/-/g, ' ')} `)).toBe(id)
    expect(looksLikeRosterCode(code)).toBe(true)
})

test('опечатка и чужой текст не принимаются', () => {
    const code = encodeRosterCode(id)
    const broken = code.slice(0, 6) + (code[6] === 'A' ? 'B' : 'A') + code.slice(7)
    expect(decodeRosterCode(broken)).toBe(null)
    expect(looksLikeRosterCode('My list (2,000 Points)')).toBe(false)
    expect(encodeRosterCode('')).toBe('')
})

test('id любого формата: число, строка, спецсимволы', () => {
    ;[12345, '987654321', 'abc_DEF-9', '5f0e7c'].forEach(value => {
        const code = encodeRosterCode(value)
        expect(code).toMatch(/^40K(-[0-9A-Z]{1,4})+$/)
        expect(decodeRosterCode(code)).toBe(String(value))
    })
})
