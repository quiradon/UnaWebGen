/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    availableLanguages: string[];
    defaultLanguage: string;
    currentLanguage: string;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_APP_ENV?: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_API_URL?: string;
  readonly PUBLIC_DISCORD_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
