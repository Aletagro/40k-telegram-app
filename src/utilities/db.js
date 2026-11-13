// Единая точка доступа к базе данных с учётом локализации.
// В исходном json тексты лежат в row.localisations[lang]. Здесь мы один раз при загрузке
// "разворачиваем" их в обычные поля строки: сначала английский (есть почти везде),
// поверх него — выбранный язык. Так отсутствующие переводы автоматически берутся из английского.
// Сама база лежит в public/db (готовится scripts/build-db.js) и загружается один раз при старте, до запуска приложения.
// Объект raw заполняется на месте, поэтому модули могут получать его через require и читать data позже.
const raw = {metadata: {}, data: {}}

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

const BASE_URL = `${process.env.PUBLIC_URL || ''}/db/`
const CACHE_NAME = 'db-cache'

const openCache = async () => {
  try {
    return typeof caches !== 'undefined' ? await caches.open(CACHE_NAME) : null
  } catch (e) {
    return null
  }
}

// Файлы имеют хэш в имени, поэтому после первой загрузки лежат в кэше браузера и больше не скачиваются
const fetchJson = async (file, bytes, onChunk) => {
  const url = `${BASE_URL}${file}`
  const cache = await openCache()
  let response = cache ? await cache.match(url) : null
  if (!response) {
    response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to load ${file}`)
    if (cache) cache.put(url, response.clone()).catch(() => {})
  }
  if (!response.body || !response.body.getReader) {
    const json = await response.json()
    onChunk(bytes)
    return json
  }
  const reader = response.body.getReader()
  const chunks = []
  for (;;) {
    const {done, value} = await reader.read()
    if (done) break
    chunks.push(value)
    onChunk(value.length)
  }
  return new Response(new Blob(chunks)).json()
}

const fetchManifest = async () => {
  const url = `${BASE_URL}manifest.json`
  const cache = await openCache()
  try {
    const response = await fetch(url, {cache: 'no-cache'})
    if (!response.ok) throw new Error('manifest')
    if (cache) cache.put(url, response.clone()).catch(() => {})
    return await response.json()
  } catch (e) {
    // нет сети: берём последнюю сохранённую версию
    const saved = cache ? await cache.match(url) : null
    if (!saved) throw e
    return saved.json()
  }
}

// Загружает базу и разворачивает переводы выбранного языка. onProgress получает долю от 0 до 1
const loadDatabase = async (onProgress = () => {}) => {
  const language = getLanguage()
  const manifest = await fetchManifest()
  const overlayInfo = language !== DEFAULT_LANGUAGE ? manifest.files[language] : null
  const total = manifest.files.core.bytes + (overlayInfo ? overlayInfo.bytes : 0)
  let loaded = 0
  const onChunk = (size) => {
    loaded += size
    onProgress(Math.min(1, loaded / total))
  }
  const [core, overlay] = await Promise.all([
    fetchJson(manifest.files.core.file, manifest.files.core.bytes, onChunk),
    overlayInfo ? fetchJson(overlayInfo.file, overlayInfo.bytes, onChunk) : null
  ])
  if (overlay) {
    Object.keys(overlay).forEach((table) => {
      const rows = core.data[table]
      overlay[table].forEach(([index, localisation]) => {
        if (rows && rows[index] && rows[index].localisations) rows[index].localisations[language] = localisation
      })
    })
  }
  setDatabase(core, language)
}

// Подключает уже загруженную базу ({metadata, data} с английскими переводами и, при необходимости, переводами языка).
// Используется загрузчиком выше, а также тестами, которые читают src/dataBase.json напрямую
const setDatabase = (core, language = getLanguage()) => {
  localize(core.data, language)
  raw.metadata = core.metadata
  Object.assign(raw.data, core.data)
}

module.exports = raw
module.exports.LANGUAGES = LANGUAGES
module.exports.getLanguage = getLanguage
module.exports.setLanguage = setLanguage
module.exports.loadDatabase = loadDatabase
module.exports.setDatabase = setDatabase
