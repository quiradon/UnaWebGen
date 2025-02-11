export function onRequest(context) {
    let valid_langs = ['da','de','en','es','fr','it','nl','no','pl','pt','ru','sv','tr','zh'];
    let atual_lang = Array.isArray(context?.params?.langs) ? context.params.langs[0] : 'en';

    if (!valid_langs.includes(atual_lang)) {
        return new Response(null, { status: 302, headers: { 'Location': '/404' } });
    }

    let item = context.params.item ?? '0';
    let responseBody = `item: ${item} - lang: ${atual_lang}`;
    let etag = `"${btoa(responseBody)}"`;

    // Se o cliente já tem o conteúdo atualizado, evita reenvio de dados
    if (context.request.headers.get('If-None-Match') === etag) {
        return new Response(null, { status: 304 });
    }

    let response = new Response(responseBody, {
        headers: {
            'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
            'ETag': etag,
            'CF-Cache-Status': 'HIT' // Garante que o Cloudflare faça cache
        }
    });

    return response;
}
