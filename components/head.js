const {url} = require('../config.json')
const {traduz} = require('../translation')
function extrairRotaSemIdioma(rota) {
    let rotaNova = rota
    rotaNova = rotaNova.replace("pt", "")
    rotaNova = rotaNova.replace("en", "")
    if (rotaNova == '/index') {
        rotaNova = '/'
    }
    return rotaNova
}

function extrairIdioma(rota) {
    let idioma = 'en'
    if (rota.includes('pt/')) {
        idioma = 'pt'
    }
    return idioma
}

function head(rota,title,desc,pictureURL) {
    let rotaRoot = extrairRotaSemIdioma(rota)
    const t = traduz(extrairIdioma(rota))

    if (!desc){
        desc = t.default.desc
    }
    if (!pictureURL){
        pictureURL = `${url}/static/img/bg/space.webp`
    }

    return `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title>${title} | Mini Kraken</title>
    <meta name="description" content="${desc}">
    <link rel="stylesheet" href="/static/bootstrap/css/bootstrap.min.css">
    <meta name="theme-color" content="#f80752">
    <link rel="stylesheet" href="/static/css/bs-theme-overrides.css">
    <link rel="stylesheet" href="/static/css/animate.min.css">
    <link rel="stylesheet" href="/static/css/styles.css">
    <link rel="icon" type="image/png" sizes="512x512" href='/static/img/icons/logo.svg'>
    <link rel="icon" type="image/png" sizes="192x192" href='/static/img/icons/logo.svg'>
    <link rel="icon" type="image/png" sizes="180x180" href='/static/img/icons/logo.svg'>
    <link rel="icon" type="image/png" sizes="32x32" href='/static/img/icons/logo.svg'>
    <link rel="icon" type="image/png" sizes="16x16" href='/static/img/icons/logo.svg'>
    <link rel="canonical" href="${url}${rotaRoot}">
    <link rel="alternate" hreflang="pt" href="${url}/pt${rotaRoot}">
    <link rel="alternate" hreflang="en" href="${url}${rotaRoot}">
    <link rel="alternate" hreflang="x-default" href="${url}${rotaRoot}">
    <meta property="og:url" content="${url}${rotaRoot}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@MiniKrakenBOT">
    <meta name="twitter:creator" content="@MiniKrakenBOT">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${pictureURL}">
    <meta property="og:url" content="URL_da_sua_página">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="${pictureURL}">

</head>`
}


module.exports = {
    head
}

