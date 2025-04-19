function idiomaR(t) {
    let lang = t && t.lang ? (t.lang == 'en' ? '' : `/${t.lang}`) : '';
    return lang
}

const path = require('path');
const fg = require('fast-glob'); // Substituído fs por fast-glob

// Caminho para a pasta i18n
const i18nPath = path.join(__dirname, 'i18n');

// Lê todos os arquivos na pasta i18n e obtém os nomes dos arquivos sem a extensão
const languages = fg.sync(`${i18nPath}/*.*`).map(file => path.basename(file, path.extname(file)));

function roteador(rota) {
    languages.forEach(language => {
        rota = rota.replace(`/${language}`, '');
    });

    if (rota == '/index') {
        rota = '/'
    }

    //de replace em todos os index para vazio
    rota = rota.replace(/index/g, '');

    


    return rota;
}

function extrairIdioma(rota) {
    let idioma = 'en'; // Idioma padrão
    languages.forEach(language => {
        if (rota.includes(`${language}/`)) {
            idioma = language;
        }
    });
    return idioma;
}

// Função para extrair a rota sem o idioma
function extrairRotaSemIdioma(rota) {
    let rotaNova = rota;
    languages.forEach(language => {
        if (rotaNova.startsWith(`/${language}`)) {
            rotaNova = rotaNova.replace(`/${language}`, '');
        } else if (rotaNova.startsWith(`${language}`)) {
            rotaNova = rotaNova.replace(`${language}`, '');
        }
    });


    if (rotaNova === '/index') {
        rotaNova = '/';
    }

    rota = rota.replace(/index/g, '');

    return rotaNova;
}

// Nova função para verificar se os arquivos estáticos existem
function verificaArquivoEstatico(caminho) {
    const caminhoCompleto = path.join(__dirname, 'static', caminho);
    const arquivos = fg.sync(caminhoCompleto, { onlyFiles: true });
    return arquivos.length > 0;
}

module.exports = {
    languages,
    extrairRotaSemIdioma,
    extrairIdioma,
    idiomaR,
    roteador,
    verificaArquivoEstatico
}

