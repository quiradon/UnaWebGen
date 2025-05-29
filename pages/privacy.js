const {nav, footer} = require('../components/navbar')
const scripts = require('../components/bootscripts')
const {head} = require('../components/head')
const {blog, MarkdownContent} = require('../components/blogpost')

function page(idioma, rota) {
    const t = idioma
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.privacy.title}`,`${t.privacy.desc}`,"/static/img/banners/terms_of_service_banner.webp")}
<body>
    ${nav(t, rota)}

    ${blog(t.privacy.title,t.tos.tags,"/static/img/banners/terms_of_service_banner.webp",`
        ${MarkdownContent(t.privacy.md)}
    `)}

    ${footer(t,rota)}
    ${scripts}
</body>
</html>
`
}

module.exports = {
    page
}