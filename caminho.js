function idiomaR(t) {
    let lang = t && t.lang ? (t.lang == 'en' ? '' : `/${t.lang}`) : '';
    return lang
}

function roteador(rota) {
    if (rota == '/index') {
        rota = '/'
    }
    rota = rota.replace('/pt','')
    return rota
}

module.exports = {
    idiomaR,
    roteador
}

