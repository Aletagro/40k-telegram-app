// Локализация интерфейса. Ключ - английский текст (он же запасной вариант, если перевода нет).
// t('Save') -> 'Speichern'; t('{{count}} models', {count: 3}); множественное число: 'one issue|{{count}} issues'
// Формы через "|" идут в порядке: one|other (или one|few|many для русского) (для английского и ключей); в словаре можно дать объект {one, few, many, other}
import {getLanguage} from './db'

const LOADERS = {
    de: () => require('../locales/de').default,
    es: () => require('../locales/es').default,
    fr: () => require('../locales/fr').default,
    it: () => require('../locales/it').default,
    ja: () => require('../locales/ja').default,
    ko: () => require('../locales/ko').default,
    zh: () => require('../locales/zh').default,
    ru: () => require('../locales/ru').default
}

const language = getLanguage()
let dictionary = {}
try {
    if (LOADERS[language]) dictionary = LOADERS[language]() || {}
} catch (e) {}

let rules
try { rules = new Intl.PluralRules(language) } catch (e) { rules = null }
const englishRules = new Intl.PluralRules('en')

const interpolate = (text, params) => params
    ? text.replace(/\{\{(\w+)\}\}/g, (match, name) => params[name] === undefined || params[name] === null ? match : String(params[name]))
    : text

const pickForm = (value, count, pluralRules) => {
    if (typeof value === 'string') {
        if (value.indexOf('|') === -1) return value
        const forms = value.split('|')
        const category = pluralRules.select(count)
        // три формы (русский): 1 / 2-4 / 5+; две формы: one / other
        if (forms.length >= 3) return forms[category === 'one' ? 0 : category === 'few' ? 1 : 2]
        return forms[category === 'one' ? 0 : 1] || forms[0]
    }
    // объект с категориями
    return value[pluralRules.select(count)] || value.other || value.one || ''
}

export const t = (key, params) => {
    const hasCount = params && typeof params.count === 'number'
    const translated = dictionary[key]
    let text
    if (translated !== undefined && translated !== '') text = hasCount ? pickForm(translated, params.count, rules || englishRules) : (typeof translated === 'string' ? translated : translated.other)
    else text = hasCount ? pickForm(key, params.count, englishRules) : key
    return interpolate(text, params)
}

export const isEnglish = () => language === 'en'
