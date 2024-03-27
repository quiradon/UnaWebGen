const {nav, footer} = require('../components/navbar')
const scripts = require('../components/bootscripts')
const {head} = require('../components/head')
const {blog, PlaceParagraphs} = require('../components/blogpost')

function page(idioma, rota) {
    const t = idioma
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.privacy.title}`)}
<body>
    ${nav(t, rota)}

    ${blog(t.privacy.title,t.tos.tags,"/static/img/bg/dnd.webp",`
    ${PlaceParagraphs(t.tos[0].title,t.tos[0].desc)}
    ${PlaceParagraphs(t.privacy.title,t.privacy[0].desc)}
    ${PlaceParagraphs(t.privacy[1].title,t.privacy[1].desc)}

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