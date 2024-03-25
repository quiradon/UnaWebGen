const pt = require('./i18n/pt.json')
const en = require('./i18n/en.json')

const translations = {
    pt,
    en
}

function traduz(language) {
    return translations[language]
}

module.exports = {
    traduz
}