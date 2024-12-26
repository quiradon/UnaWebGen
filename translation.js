const pt = require('./i18n/pt.json')
const en = require('./i18n/en.json')
const es = require('./i18n/es.json')
const translations = {
    pt,
    en,
    es
}

function traduz(language) {
    return translations[language]
}

module.exports = {
    traduz
}