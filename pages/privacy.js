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
    ${PlaceParagraphs(t.privacy[2].title,t.privacy[2].desc)}
    ${PlaceParagraphs(t.privacy[3].title,t.privacy[3].desc)}
    ${PlaceParagraphs(t.privacy[4].title,t.privacy[4].desc)}

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