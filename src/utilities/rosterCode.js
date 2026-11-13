// Код ростера: красивая строка вида 40K-XXXX-XXXX-..., из которой приложение восстанавливает id списка.
// Это не защита, а удобство: код не похож на id, в нём есть контрольные символы от опечаток.
// Id списков — случайные UUID, перебором их не найти.
const PREFIX = '40K'
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ' // Crockford base32
const MASK = [0x5a, 0x17, 0xc3, 0x9e, 0x2b, 0x74, 0xe1, 0x08, 0xd6, 0x4f, 0x93, 0x3a, 0xb8, 0x61, 0x0d, 0xf2]
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const checksum = (bytes) => {
    let a = 0x1f3
    let b = 0x2a7
    bytes.forEach((byte, index) => {
        a = (a * 31 + byte + index) % 1021
        b = (b * 17 + byte * 3 + a) % 1019
    })
    return [a % 32, b % 32]
}

// Первый байт: 0 — компактный UUID (16 байт), иначе длина id в виде строки (id любого формата)
export const encodeRosterCode = (rosterId) => {
    const id = rosterId === undefined || rosterId === null ? '' : String(rosterId)
    if (!id) return ''
    let bytes
    if (UUID_RE.test(id)) {
        const hex = id.replace(/-/g, '')
        bytes = [0]
        for (let i = 0; i < 16; i++) bytes.push(parseInt(hex.substr(i * 2, 2), 16))
    } else {
        const raw = Array.from(unescape(encodeURIComponent(id))).map(char => char.charCodeAt(0))
        if (raw.length > 255) return ''
        bytes = [raw.length, ...raw]
    }
    const masked = bytes.map((byte, i) => byte ^ MASK[i % MASK.length])
    const bits = masked.map(byte => byte.toString(2).padStart(8, '0')).join('')
    const padded = bits.padEnd(Math.ceil(bits.length / 5) * 5, '0')
    const values = []
    for (let i = 0; i < padded.length; i += 5) values.push(parseInt(padded.substr(i, 5), 2))
    const chars = values.concat(checksum(bytes)).map(value => ALPHABET[value]).join('')
    return `${PREFIX}-${chars.match(/.{1,4}/g).join('-')}`
}

// Id списка из кода; null, если это не код ростера или в нём опечатка
export const decodeRosterCode = (text) => {
    let value = (text || '').toUpperCase().replace(/[^0-9A-Z]/g, '')
    if (value.startsWith(PREFIX)) value = value.slice(PREFIX.length)
    value = value.replace(/O/g, '0').replace(/[IL]/g, '1')
    if (value.length < 5) return null
    const values = value.split('').map(char => ALPHABET.indexOf(char))
    if (values.includes(-1)) return null
    const body = values.slice(0, -2)
    const bits = body.map(v => v.toString(2).padStart(5, '0')).join('')
    const count = Math.floor(bits.length / 8)
    const bytes = []
    for (let i = 0; i < count; i++) bytes.push(parseInt(bits.substr(i * 8, 8), 2) ^ MASK[i % MASK.length])
    const length = bytes[0] === 0 ? 17 : bytes[0] + 1
    if (!bytes.length || bytes.length !== length) return null
    const [a, b] = checksum(bytes)
    if (a !== values[values.length - 2] || b !== values[values.length - 1]) return null
    if (bytes[0] === 0) {
        const hex = bytes.slice(1).map(byte => byte.toString(16).padStart(2, '0')).join('')
        return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20)}`
    }
    try {
        return decodeURIComponent(escape(String.fromCharCode(...bytes.slice(1))))
    } catch (error) {
        return null
    }
}

// Похож ли текст на код ростера (чтобы отличить его от текста списка)
export const looksLikeRosterCode = (text) => {
    const value = (text || '').trim()
    return value.length < 80 && !!decodeRosterCode(value)
}

// Копирование через скрытое поле: работает в веб-вью Telegram и VK, где Clipboard API может не сработать
const copyWithTextarea = (text) => {
    const field = document.createElement('textarea')
    field.value = text
    field.setAttribute('readonly', '')
    field.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px'
    document.body.appendChild(field)
    field.focus()
    field.select()
    field.setSelectionRange(0, text.length)
    let ok = false
    try {
        ok = document.execCommand('copy')
    } catch (error) {
        ok = false
    }
    document.body.removeChild(field)
    return ok
}

export const copyText = async (text) => {
    // Сначала синхронный способ, пока действие пользователя ещё "свежее"
    if (copyWithTextarea(text)) return true
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (error) {
        return false
    }
}
