import { defineMiddleware } from 'astro:middleware';
import { getLanguages } from '@lib/i18n';

export const onRequest = defineMiddleware(async (context, next) => {
  // Obter idiomas disponíveis
  const availableLanguages = getLanguages();
  const defaultLanguage = 'en';
  
  // Armazenar idiomas disponíveis no Astro.locals
  context.locals.availableLanguages = availableLanguages;
  context.locals.defaultLanguage = defaultLanguage;
  
  // Verificar se a rota tem parâmetro locale
  const locale = context.params.locale;
  
  if (locale) {
    // Validar se o idioma é válido
    if (!availableLanguages.includes(locale)) {
      // Redirecionar para idioma padrão se o locale for inválido
      const url = new URL(context.request.url);
      const newPath = url.pathname.replace(`/${locale}`, `/${defaultLanguage}`);
      return Response.redirect(new URL(newPath, url.origin), 302);
    }
    
    // Armazenar o idioma validado
    context.locals.currentLanguage = locale;
  } else {
    // Se não há parâmetro locale, usar o idioma padrão
    context.locals.currentLanguage = defaultLanguage;
  }
  
  return next();
});