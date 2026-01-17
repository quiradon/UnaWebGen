import { defineConfig } from "astro/config";
import { i18n, filterSitemapByDefaultLocale } from "astro-i18n-aut/integration";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

const defaultLocale = "en";
const locales = {
  en: "en-US", // the `defaultLocale` value must present in `locales` keys
  es: "es-ES",
  fr: "fr-CA",
  pt: "pt-BR",
  de: "de-DE",
  da: "da-DK",
  hr: "hr-HR",
  hu: "hu-HU",
  id: "id-ID",
  it: "it-IT",
  ja: "ja-JP",
  ko: "ko-KR",
  pl: "pl-PL",
  ru: "ru-RU",
  tr: "tr-TR",
  zh: "zh-CN",
};

import cloudflare from "@astrojs/cloudflare";

const baseAliases = {
  "@": "/src",
  "@components": "/src/components",
  "@lib": "/src/lib",
  "@layouts": "/src/layouts",
  "@pages": "/src/pages",
  "@i18n": "/src/i18n",
  "@static": "",
  "@data": "/data",
  "@assets": "/src/assets",
};

export default defineConfig({
  // output: "hybrid" has been removed/merged into static with adapter
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: "compile",
  }),
  output: "static",
  prefetch: true,
  trailingSlash: "always",
  site: "https://rpg.arkanus.app",
  build: {
    format: "directory",
    inlineStylesheets: "auto",
    minify: true,
    assets: '_astro'
  },
  vite: {
    base: "",
    optimizeDeps: {
      include: ["sonner"],
    },
    // Resolve workerd exports (ex: react-dom/server.edge) for Cloudflare runtime.
    ssr: {
      resolve: {
        conditions: ["workerd", "worker", "browser", "module", "import", "default"],
      },
    },
    server: {
      host: true,
      allowedHosts: ['atividade.arkanus.app', 'atividadeapi.arkanus.app'],
    },
    build: {
      minify: 'terser',
      terserOptions: {
        mangle: true,
        format: {
          comments: false
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['astro']
          },
          // Adicionar crossorigin aos módulos
          assetFileNames: (assetInfo) => {
            return '_astro/[name]-[hash][extname]';
          }
        }
      },
      // Forçar crossorigin nos módulos
      modulePreload: {
        polyfill: false
      }
    },
    resolve: {
      alias: [
        ...Object.entries(baseAliases).map(([find, replacement]) => ({
          find,
          replacement,
        })),
      ],
    },
  },
  integrations: [
    i18n({
      locales,
      defaultLocale,

    }),
    sitemap({
      i18n: {
        locales,
        defaultLocale,
      },
      filter: filterSitemapByDefaultLocale({ defaultLocale }),
    }),
    react(),
  ],
});
