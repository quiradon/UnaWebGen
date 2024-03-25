const {url} = require('../config.json')

function head(rota,title,desc,pictureURL) {
    return `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title>${title}</title>
    <link rel="stylesheet" href="/static/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="/static/css/bs-theme-overrides.css">
    <link rel="stylesheet" href="/static/css/styles.css">
    <link rel="icon" type="image/png" sizes="512x512" href='/static/img/icons/android-chrome-512x512.png'>
    <link rel="icon" type="image/png" sizes="192x192" href='/static/img/icons/android-chrome-192x192.png'>
    <link rel="icon" type="image/png" sizes="180x180" href='/static/img/icons/apple-touch-icon.png'>
    <link rel="icon" type="image/png" sizes="32x32" href='/static/img/icons/favicon-32x32.png'>
    <link rel="icon" type="image/png" sizes="16x16" href='/static/img/icons/favicon-16x16.png'>
    <link rel="canonical" href="${url}/${rota}">
    <meta property="og:url" content="${url}/${rota}"">
</head>`
}


module.exports = {
    head
}

