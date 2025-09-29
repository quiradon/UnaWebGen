/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    availableLanguages: string[];
    defaultLanguage: string;
    currentLanguage: string;
  }
}