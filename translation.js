const path = require('path');
const fg = require('fast-glob');
const fs = require('fs').promises; // assíncrono
const fsSync = require('fs'); // síncrono para fallback

const translations = {};

const i18nPath = path.join('./i18n');

// Função assíncrona para carregar todas as traduções (opcional)
async function carregarTraducoes() {
  const files = await fg(`${i18nPath}/*.json`);
  await Promise.all(
    files.map(async (file) => {
      const language = path.basename(file, '.json');
      const content = await fs.readFile(file, 'utf-8');
      const t = JSON.parse(content);
      t.lang = language;
      translations[language] = t;
    })
  );
}

// Executa a função carregarTraducoes automaticamente (best-effort)
carregarTraducoes();

function ensureLoaded(language) {
  if (!translations[language]) {
    try {
      const file = path.join(i18nPath, `${language}.json`);
      const content = fsSync.readFileSync(file, 'utf-8');
      const t = JSON.parse(content);
      t.lang = language;
      translations[language] = t;
    } catch (e) {
      translations[language] = { lang: language };
    }
  }
}

function traduz(language) {
  ensureLoaded(language);
  return translations[language] || { lang: language };
}

module.exports = {
  traduz,
  carregarTraducoes,
};

