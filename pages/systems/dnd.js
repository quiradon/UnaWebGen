const {nav, footer} = require('../../components/navbar')
const scripts = require('../../components/bootscripts')
const {head} = require('../../components/head')
const {blog, PlaceParagraphs} = require('../../components/blogpost')

function page(idioma, rota) {
    const t = idioma
    const sistema = t.posts.sistemas[0]
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.system.default.title.replaceAll("%system%",sistema.card.title)}`,t.system.default.desc.replaceAll("%system%",sistema.card.title))}
<body>
    ${nav(t, rota)}

    ${blog(t.tos.title,t.tos.tags,"/static/img/bg/dnd.webp",`
    ${PlaceParagraphs(t.tos[0].title,t.tos[0].desc)}

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