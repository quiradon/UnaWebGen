export function onRequest(context) {
    let valid_langs = ['da','de','en','es','fr','it','nl','no','pl','pt','ru','sv','tr','zh']
    let atual_lang = Array.isArray(context?.params?.langs) ? context.params.langs[0] : 'en'
    if (!valid_langs.includes(atual_lang)) {
      return new Response(null, { status: 302, headers: { 'Location': '/404' } })
    }
    return new Response("Hello, world!")
  }