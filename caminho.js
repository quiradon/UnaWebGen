function idiomaR(t) {
    let lang = t && t.lang ? (t.lang == 'en' ? '' : `/${t.lang}`) : '';
    return lang
}

const fs = require('fs');
const path = require('path');

// Caminho para a pasta i18n
const i18nPath = path.join(__dirname, 'i18n');

// Lê todos os arquivos na pasta i18n e obtém os nomes dos arquivos sem a extensão
const languages = fs.readdirSync(i18nPath).map(file => path.basename(file, path.extname(file)));

function roteador(rota) {
    languages.forEach(language => {
        rota = rota.replace(`/${language}`, '');
    });

    if (rota == '/index') {
        rota = '/'
    }

    return rota;
}

module.exports = {
    idiomaR,
    roteador
}

