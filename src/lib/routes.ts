import fs from 'node:fs';
import path from 'node:path';

const I18N_DIR = path.resolve(process.cwd(), 'i18n');
const languages = fs
  .readdirSync(I18N_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => path.basename(f, path.extname(f)));

export function idiomaR(t: { lang?: string } | undefined): string {
  const lang = t && t.lang ? (t.lang === 'en' ? '' : `/${t.lang}`) : '';
  return lang;
}

export function roteador(rota: string): string {
  let r = rota;
  for (const language of languages) {
    r = r.replace(`/${language}`, '');
  }
  if (r === '/index') r = '/';
  r = r.replace(/index/g, '');
  return r;
}

export function extrairIdioma(rota: string): string {
  let idioma = 'en';
  for (const language of languages) {
    if (rota.includes(`${language}/`)) idioma = language;
  }
  return idioma;
}

export function extrairRotaSemIdioma(rota: string): string {
  let nova = rota;
  for (const language of languages) {
    if (nova.startsWith(`/${language}`)) nova = nova.replace(`/${language}`, '');
    else if (nova.startsWith(`${language}`)) nova = nova.replace(`${language}`, '');
  }
  if (nova === '/index') nova = '/';
  nova = nova.replace(/index/g, '');
  return nova;
}

