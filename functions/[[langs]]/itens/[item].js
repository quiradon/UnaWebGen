export async function onRequest(context) {
    let valid_langs = ['da', 'de', 'en', 'es', 'fr', 'it', 'nl', 'no', 'pl', 'pt', 'ru', 'sv', 'tr', 'zh'];
    let atual_lang = Array.isArray(context?.params?.langs) ? context.params.langs[0] : 'default';

    if (atual_lang !== 'default' && !valid_langs.includes(atual_lang)) {
        return new Response(null, { status: 302, headers: { 'Location': 'https://rpg.arkanus.app/404.html' } });
    }

    let item = context.params.item ?? '0';

    if (!item || typeof item !== 'string' || item.trim() === '') {
        console.error('Item inválido:', item);
        return new Response('Parâmetro item inválido', { status: 400 });
    }

    let responseBody = `item: ${item} - lang: ${atual_lang}`;

    let response = new Response(responseBody, {
        headers: {
            'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
            'Surrogate-Control': 'max-age=3600', // Cache para proxy de borda
            'Vary': 'Accept-Language', // Variação por idioma
            'ETag': `"${btoa(responseBody)}"`, // Gera ETag com base no conteúdo
            'X-Worker-Cache': 'Generated'
        }
    });

    return response;
}
