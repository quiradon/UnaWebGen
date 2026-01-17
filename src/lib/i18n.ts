export type Translations = Record<string, any> & { lang: string };

const translationModules = import.meta.glob<Translations>('/i18n/*.json', {
  eager: true,
  import: 'default',
});

const translationsByLang: Record<string, Translations> = {};
for (const [file, translations] of Object.entries(translationModules)) {
  const name = file.split('/').pop();
  if (!name) continue;
  const lang = name.replace(/\.json$/, '');
  if (!lang) continue;
  translationsByLang[lang] = translations;
}

const languageList = Object.keys(translationsByLang);

export async function getStaticPaths() {
  const languages = getLanguages();
  return languages.map((lang) => ({
    params: { locale: lang },
  }));
}

export function getLanguages(): string[] {
  return languageList.slice();
}

export function loadT(lang: string): Translations {
  const resolvedLang = lang || 'en';
  const base = translationsByLang[resolvedLang];
  if (!base) {
    throw new Error(`Missing translations for language "${resolvedLang}".`);
  }
  return { ...base, lang: resolvedLang };
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


