import fs from 'node:fs';
import path from 'node:path';

export type Translations = Record<string, any> & { lang: string };

const I18N_DIR = path.resolve(process.cwd(), 'i18n');

export async function getStaticPaths() {
  const languages = getLanguages();
  return languages.map((lang) => ({
    params: { locale: lang },
  }));
}

export function getLanguages(): string[] {
  if (!fs.existsSync(I18N_DIR)) return [];
  return fs
    .readdirSync(I18N_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.basename(f, path.extname(f)));
}

export function loadT(lang: string): Translations {
  if (!lang) lang = 'en';
  const file = path.join(I18N_DIR, `${lang}.json`);
  const raw = fs.readFileSync(file, 'utf-8');
  const t = JSON.parse(raw) as Translations;
  t.lang = lang;
  return t;
}

export function getValidatedLanguage(astroLocals: any, requestedLang?: string): string {
  const availableLanguages = astroLocals?.availableLanguages || getLanguages();
  const defaultLanguage = 'en'; // Sempre usar inglês como padrão
  
  // Se não há idioma solicitado, retorna o padrão
  if (!requestedLang) {
    return defaultLanguage;
  }
  
  // Se o idioma solicitado é válido, usa ele
  if (availableLanguages.includes(requestedLang)) {
    return requestedLang;
  }
  
  // Se o idioma não é válido, retorna o padrão
  return defaultLanguage;
}


