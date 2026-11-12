// Готовит базу данных к загрузке приложением: src/dataBase.json (источник, в бандл не попадает) делится на
//   public/db/core.<hash>.json  - все таблицы, из переводов только английский (нужен всем)
//   public/db/<lang>.<hash>.json - переводы одного языка: {таблица: [[индекс строки, переводы], ...]}
//   public/db/manifest.json     - версия данных, имена файлов и размеры (для индикатора загрузки)
// Файлы с хэшем в имени не меняются, поэтому их можно кэшировать надолго. Запускается автоматически перед start и build.
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const SOURCE = path.join(__dirname, '..', 'src', 'dataBase.json')
const OUT = path.join(__dirname, '..', 'public', 'db')

const raw = JSON.parse(fs.readFileSync(SOURCE, 'utf8'))
const core = {metadata: raw.metadata, data: {}}
const overlays = {}

Object.keys(raw.data).forEach((table) => {
    const rows = raw.data[table]
    if (!Array.isArray(rows)) {
        core.data[table] = rows
        return
    }
    core.data[table] = rows.map((row, index) => {
        const loc = row && row.localisations
        if (!loc) return row
        Object.keys(loc).forEach((lang) => {
            if (lang === 'en') return
            overlays[lang] = overlays[lang] || {}
            overlays[lang][table] = overlays[lang][table] || []
            overlays[lang][table].push([index, loc[lang]])
        })
        return {...row, localisations: {en: loc.en}}
    })
})

// удаляем файлы прошлой сборки (если не получилось - не страшно, они просто не попадут в manifest)
fs.mkdirSync(OUT, {recursive: true})
fs.readdirSync(OUT).forEach((file) => {
    try {
        fs.unlinkSync(path.join(OUT, file))
    } catch (e) {}
})

const manifest = {version: raw.metadata && raw.metadata.data_version, files: {}}
const write = (name, content) => {
    const text = JSON.stringify(content)
    const hash = crypto.createHash('sha1').update(text).digest('hex').slice(0, 10)
    const file = `${name}.${hash}.json`
    fs.writeFileSync(path.join(OUT, file), text)
    manifest.files[name] = {file, bytes: Buffer.byteLength(text)}
}

write('core', core)
Object.keys(overlays).forEach((lang) => write(lang, overlays[lang]))
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest))
console.log('db:', Object.keys(manifest.files).map((name) => `${name} ${(manifest.files[name].bytes / 1e6).toFixed(1)}MB`).join(', '))
