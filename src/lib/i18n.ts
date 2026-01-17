export type Translations = Record<string, any> & { lang: string };

const translationModules = import.meta.glob<Translations>('/i18n/*.json', {
  import: 'default',
});

const translationsByLang: Record<string, Translations> = {};
const translationLoaders: Record<string, () => Promise<Translations>> = {};
for (const [file, loader] of Object.entries(translationModules)) {
  const name = file.split('/').pop();
  if (!name) continue;
  const lang = name.replace(/\.json$/, '');
  if (!lang) continue;
  translationLoaders[lang] = loader as () => Promise<Translations>;
}

const languageList = Object.keys(translationLoaders);

export async function getStaticPaths() {
  const languages = getLanguages();
  return languages.map((lang) => ({
    params: { locale: lang },
  }));
}

export function getLanguages(): string[] {
  return languageList.slice();
}

export async function loadT(lang: string): Promise<Translations> {
  const resolvedLang = lang || 'en';
  let base = translationsByLang[resolvedLang];
  if (!base) {
    const loader = translationLoaders[resolvedLang];
    if (!loader) {
      throw new Error(`Missing translations for language "${resolvedLang}".`);
    }
    base = await loader();
    translationsByLang[resolvedLang] = base;
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


