export function onRequest(context) {
  let valid_langs = ['da','de','en','es','fr','it','nl','no','pl','pt','ru','sv','tr','zh'];
  let atual_lang = Array.isArray(context?.params?.langs) ? context.params.langs[0] : 'en';
  if (!valid_langs.includes(atual_lang)) {
    return new Response(null, { status: 302, headers: { 'Location': '/404' } });
  }
  
  return new Response("Hello, world!", {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400', // 1h no navegador, 24h no proxy
      'Cloudflare-CDN-Cache-Control': 'max-age=86400, stale-while-revalidate=604800', // 24h cache, 7 dias stale
      'Content-Type': 'text/html; charset=utf-8',
      'Vary': 'Accept-Encoding', // Para cache baseado na compressão
      'ETag': `"${atual_lang}-${Date.now()}"` // ETag para validação de cache
    }
  });
}