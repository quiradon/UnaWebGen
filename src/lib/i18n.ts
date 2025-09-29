import fs from 'node:fs';
import path from 'node:path';

export type Translations = Record<string, any> & { lang: string };

const I18N_DIR = path.resolve(process.cwd(), 'i18n');

export function getLanguages(): string[] {
  if (!fs.existsSync(I18N_DIR)) return [];
  return fs
    .readdirSync(I18N_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.basename(f, path.extname(f)));
}

export function loadT(lang: string): Translations {
  const file = path.join(I18N_DIR, `${lang}.json`);
  const raw = fs.readFileSync(file, 'utf-8');
  const t = JSON.parse(raw) as Translations;
  t.lang = lang;
  return t;
}

export function getRouteSlugs(): string[] {
  const PAGES_DIR = path.resolve(process.cwd(), 'pages');
  const slugs: string[] = [];
  if (!fs.existsSync(PAGES_DIR)) return slugs;

  const walk = (dir: string, prefix = '') => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, path.join(prefix, entry.name));
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        const name = path.basename(entry.name, '.js');
        if (prefix === '' && name === 'index') {
          continue;
        }
        if (name === 'index') {
          slugs.push(prefix.replace(/\\/g, '/'));
        } else {
          slugs.push(path.join(prefix, name).replace(/\\/g, '/'));
        }
      }
    }
  };

  walk(PAGES_DIR);
  return [...new Set(slugs)].sort();
}

export function resolveModuleAbsolutePathFromSlug(slug: string): string | null {
  const PAGES_DIR = path.resolve(process.cwd(), 'pages');
  const base = path.join(PAGES_DIR, slug);
  const direct = `${base}.js`;
  const asIndex = path.join(base, 'index.js');
  if (fs.existsSync(direct)) return direct;
  if (fs.existsSync(asIndex)) return asIndex;
  return null;
}

export function computeRotaFromAbsolutePath(absPath: string): string {
  const PAGES_DIR = path.resolve(process.cwd(), 'pages');
  let rel = path.relative(PAGES_DIR, absPath).replace(/\\/g, '/');
  rel = rel.replace(/\.js$/, '');
  if (rel === 'index') return '/index';
  return '/' + rel;
}

