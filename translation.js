const fs = require('fs');
const path = require('path');

const translations = {};

// Caminho para a pasta i18n
const i18nPath = path.join(__dirname, 'i18n');

// Lê todos os arquivos na pasta i18n
fs.readdirSync(i18nPath).forEach(file => {
    // Obtém o nome do arquivo sem a extensão
    const language = path.basename(file, path.extname(file));
    // Importa o arquivo JSON e adiciona ao objeto de traduções
    translations[language] = require(path.join(i18nPath, file));
});

function traduz(language) {
    return translations[language];
}

module.exports = {
    traduz
};