// Единая точка доступа к базе данных с учётом локализации.
// В исходном json тексты лежат в row.localisations[lang]. Здесь мы один раз при загрузке
// "разворачиваем" их в обычные поля строки: сначала английский (есть почти везде),
// поверх него — выбранный язык. Так отсутствующие переводы автоматически берутся из английского.
const raw = require('../dataBase.json')

const LANGUAGE_KEY = 'language'
const DEFAULT_LANGUAGE = 'en'

const LANGUAGES = [
  {id: 'en', name: 'English'},
  {id: 'de', name: 'Deutsch'},
  {id: 'es', name: 'Español'},
  {id: 'fr', name: 'Français'},
  {id: 'it', name: 'Italiano'},
  {id: 'ja', name: '日本語'},
  {id: 'ko', name: '한국어'},
  {id: 'zh', name: '中文'},
  {id: 'ru', name: 'Русский'}
]

const getLanguage = () => {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY)
    if (saved && LANGUAGES.some(({id}) => id === saved)) {
      return saved
    }
  } catch (e) {}
  return DEFAULT_LANGUAGE
}

const setLanguage = (language) => {
  try {
    localStorage.setItem(LANGUAGE_KEY, language)
  } catch (e) {}
  // база разворачивается один раз при загрузке, поэтому для смены языка перезагружаем приложение
  window.location.reload()
}

// В базе встречаются html-сущности (&#x20; и т.п.), показываем их как обычные символы
const decodeEntities = (value) => typeof value === 'string' && value.indexOf('&') !== -1
  ? value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
  : value

const isFilled = (value) => value !== null && value !== undefined && value !== ''

const localize = (data, language) => {
  Object.keys(data).forEach((table) => {
    const rows = data[table]
    if (!Array.isArray(rows)) {
      return
    }
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const loc = row && row.localisations
      if (!loc) {
        continue
      }
      const en = loc[DEFAULT_LANGUAGE] || {}
      const selected = language !== DEFAULT_LANGUAGE ? loc[language] : null
      delete row.localisations
      Object.assign(row, en)
      // Логика приложения опирается на английские названия (Character, Battleline ...), поэтому они сохраняются отдельно,
      // а name и commonName показывают выбранный язык
      if (en.name !== undefined) row.nameEn = en.name
      if (en.commonName !== undefined) row.commonNameEn = en.commonName
      if (selected) {
        Object.keys(selected).forEach((key) => {
          if (isFilled(selected[key])) {
            row[key] = selected[key]
          }
        })
      }
      Object.keys(row).forEach((key) => {
        row[key] = decodeEntities(row[key])
      })
    }
  })
}

const language = getLanguage()
localize(raw.data, language)

module.exports = raw
module.exports.LANGUAGES = LANGUAGES
module.exports.getLanguage = getLanguage
module.exports.setLanguage = setLanguage
