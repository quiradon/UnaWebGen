const path = require('path');
const fg = require('fast-glob');
const fs = require('fs').promises; // versão assíncrona

const translations = {};

const i18nPath = path.join('./i18n');

// Função assíncrona para carregar todas as traduções
async function carregarTraducoes() {
    const files = await fg(`${i18nPath}/*.json`);
    await Promise.all(
        files.map(async (file) => {
            const language = path.basename(file, '.json');
            const content = await fs.readFile(file, 'utf-8');
            translations[language] = JSON.parse(content);
        })
    );
}

// Executa a função carregarTraducoes automaticamente
carregarTraducoes();

function traduz(language) {
    return translations[language] || {};
}

module.exports = {
    traduz
};
