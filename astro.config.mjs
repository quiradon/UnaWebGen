import { defineConfig } from "astro/config";
import { i18n, filterSitemapByDefaultLocale } from "astro-i18n-aut/integration";
import sitemap from "@astrojs/sitemap";

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

export default defineConfig({
  trailingSlash: "always",
  site: "https://rpg.arkanus.app",
  build: {
    format: "directory"
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@lib': '/src/lib',
        '@layouts': '/src/layouts',
        '@pages': '/src/pages',
        '@i18n': '/src/i18n',
        '@static': '',
        '@data': '/data'
      }
    }
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
  ],
});