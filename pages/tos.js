const {nav, footer} = require('../components/navbar')
const scripts = require('../components/bootscripts')
const {head} = require('../components/head')
const {blog, PlaceParagraphs} = require('../components/blogpost')

function page(idioma, rota) {
    const t = idioma
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.tos.title}`)}
<body>
    ${nav(t, rota)}

    ${blog(t.tos.title,t.tos.tags,"/static/img/bg/dnd.webp",`
    ${PlaceParagraphs(t.tos[0].title,t.tos[0].desc)}
    ${PlaceParagraphs(t.tos[1].title,t.tos[1].desc)}
    ${PlaceParagraphs(t.tos[2].title,t.tos[2].desc)}
    ${PlaceParagraphs(t.tos[3].title,t.tos[3].desc)}
    ${PlaceParagraphs(t.tos[4].title,t.tos[4].desc)}
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