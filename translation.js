const pt = require('./i18n/pt.json')
const en = require('./i18n/en.json')
const es = require('./i18n/es.json')
const de = require('./i18n/de.json')
const translations = {
    pt,
    en,
    es,
    de
}

function traduz(language) {
    return translations[language]
}

module.exports = {
    traduz
}