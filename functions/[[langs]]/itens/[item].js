export async function onRequest(context) {
    let valid_langs = ['da','de','en','es','fr','it','nl','no','pl','pt','ru','sv','tr','zh'];
    let atual_lang = Array.isArray(context?.params?.langs) ? context.params.langs[0] : 'en';

    if (!valid_langs.includes(atual_lang)) {
        return new Response(null, { status: 302, headers: { 'Location': '/404' } });
    }

    let item = context.params.item ?? '0';
    let cacheKey = `${item}-${atual_lang}`;
    let responseBody = `item: ${item} - lang: ${atual_lang}`;
    let etag = `"${btoa(responseBody)}"`;

    // Verifica o cache do Cloudflare
    const cache = caches.default;
    let response = await cache.match(cacheKey);
    if (response) {
        return response;
    }

    // Se o cliente já tem o conteúdo atualizado, evita reenvio de dados
    if (context.request.headers.get('If-None-Match') === etag) {
        return new Response(null, { status: 304 });
    }

    response = new Response(responseBody, {
        headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Surrogate-Control': 'max-age=31536000', // Garante que o Cloudflare faça cache
            'ETag': etag
        }
    });

    // Armazena a resposta no cache do Cloudflare
    context.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
}
