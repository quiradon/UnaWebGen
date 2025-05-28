export function onRequest(context) {
  const valid_langs = ['da','de','en','es','fr','it','nl','no','pl','pt','ru','sv','tr','zh'];
  const atual_lang = Array.isArray(context?.params?.langs) ? context.params.langs[0] : 'en';
  if (!valid_langs.includes(atual_lang)) {
    return new Response(null, { status: 302, headers: { 'Location': '/404' } });
  }

  return new Response("Hello, world!", {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Cloudflare-CDN-Cache-Control': 'max-age=86400, stale-while-revalidate=604800',
      'Content-Type': 'text/html; charset=utf-8',
      'Vary': 'Accept-Encoding',
      'ETag': `"hello-${atual_lang}"` // Estático agora
    }
  });
}
