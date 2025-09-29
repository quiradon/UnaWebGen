import { defineConfig } from 'astro/config';

// Configuração Astro para gerar em ./dist e servir assets de ./static.
// Mantemos o formato de diretórios (route/index.html) para compatibilidade com _redirects.
export default defineConfig({
  site: 'https://rpg.arkanus.app',
  outDir: './dist',
  publicDir: './static',
  srcDir: './src',
  build: {
    format: 'directory',
  },
  i18n: {
  locales: ["da", "de", "en", "es", "fr", "hr", "hu", "id", "it", "ja","ko","pl","pt","ru","tr","zh"],
  defaultLocale: "en",
  routing: {
    prefixDefaultLocale: false
  }
  }
});
