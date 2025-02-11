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

    // 🔹 Construção da chave do cache
    const baseUrl = 'https://rpg.arkanus.app';
    let cacheKey = atual_lang === 'default' 
        ? `${baseUrl}/itens/${item}`
        : `${baseUrl}/${atual_lang}/itens/${item}`;

    console.log('[CACHE] Tentando recuperar:', cacheKey);

    const cache = caches.default;

    // 🔹 Verifica se já está no cache
    let cachedResponse = await cache.match(new Request(cacheKey));
    if (cachedResponse) {
        console.log('[CACHE] Resposta encontrada, servindo do cache:', cacheKey);
        return cachedResponse;  // Retorna diretamente do cache
    }

    console.log('[CACHE] Nenhuma resposta no cache, gerando nova...');

    let responseBody = `item: ${item} - lang: ${atual_lang}`;

    let response = new Response(responseBody, {
        headers: {
            'Cache-Control': 'public, max-age=31536000, immutable', // Cache por 1 ano
            'Surrogate-Control': 'max-age=31536000',
            'ETag': `"${btoa(responseBody)}"`, // Garantir cache por ETag
            'X-Worker-Cache': 'Generated'
        }
    });

    // 🔹 Armazena no cache
    context.waitUntil(cache.put(new Request(cacheKey), response.clone()));

    console.log('[CACHE] Resposta armazenada com sucesso:', cacheKey);

    return response;
}
