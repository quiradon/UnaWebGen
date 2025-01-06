const {url} = require('../config.json')
const {traduz} = require('../translation')
const {extrairRotaSemIdioma, extrairIdioma, languages} = require('../caminho')

function head(rota,title,desc,pictureURL) {
    let rotaRoot = extrairRotaSemIdioma(rota)
    const t = traduz(extrairIdioma(rota))
    let imgData = ''
    if (!desc){
        desc = t.default.desc
    }
    if (pictureURL){
        imgData = `
        <meta name="twitter:image" content="${pictureURL}">
        <meta property="og:image" content="${pictureURL}">
        `
    }

    let alternateLinks = languages.map(lang => {
        let langPath = lang === 'x-default' || lang === 'en' ? '' : `/${lang}`
        let obj = `<link rel="alternate" hreflang="${lang}" href="${url}${langPath}${rotaRoot}">`
        return obj
    }).join('\n')
    let canonicalLink = (rota.includes('en/')) ? `<link rel="canonical" href="${url}${rotaRoot}">` : '';
    return `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title>${title} | Mini Kraken</title>
    <meta name="description" content="${desc}">
    <link rel="stylesheet" href="/static/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="/static/css/bs-theme-overrides.css">
    <link rel="stylesheet" href="/static/css/styles.css">
    <meta name="theme-color" content="#f80752">
    <link rel="icon" type="image/png" sizes="512x512" href='/static/img/icons/logo.svg'>
    <link rel="icon" type="image/png" sizes="192x192" href='/static/img/icons/logo.svg'>
    <link rel="icon" type="image/png" sizes="180x180" href='/static/img/icons/logo.svg'>
    <link rel="icon" type="image/png" sizes="32x32" href='/static/img/icons/logo.svg'>
    <link rel="icon" type="image/png" sizes="16x16" href='/static/img/icons/logo.svg'>
    ${canonicalLink}
    ${alternateLinks}
    <link rel="alternate" hreflang="x-default" href="${url}${rotaRoot}">
    <meta property="og:url" content="${url}${rotaRoot}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@MiniKrakenBOT">
    <meta name="twitter:creator" content="@MiniKrakenBOT">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta property="og:url" content="${url}${rotaRoot}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    ${imgData}

    <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "ppp9vxyjiy");
    </script>

</head>`
}

module.exports = {
    head
}

