const {url} = require('../config.json')

function extrairRotaSemIdioma(rota) {
    let rotaNova = rota
    rotaNova = rotaNova.replace("pt", "")
    rotaNova = rotaNova.replace("en", "")
    if (rotaNova == '/index') {
        rotaNova = '/'
    }
    return rotaNova
}


function head(rota,title,desc,pictureURL) {
    let rotaRoot = extrairRotaSemIdioma(rota)

    return `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title>${title} | Mini Kraken</title>
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
    <link rel="canonical" href="${url}/${rota}">
    <link rel="alternate" hreflang="pt" href="${url}/pt${rotaRoot}">
    <link rel="alternate" hreflang="en" href="${url}${rotaRoot}">
    <link rel="alternate" hreflang="x-default" href="${url}${rotaRoot}">
    <meta property="og:url" content="${url}/${rota}"">
</head>`
}


module.exports = {
    head
}

