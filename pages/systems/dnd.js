const {nav, footer} = require('../../components/navbar')
const scripts = require('../../components/bootscripts')
const {head} = require('../../components/head')
const {blog, TextAndImage, MarkdownContent} = require('../../components/blogpost')

function linkReplacer(string) {
    // transforme [link](url) em <a href="url">link</a>
    const regex = /\[(.*?)\]\((.*?)\)/gm
    return string.replace(regex, '<a href="$2">$1</a>')
}


function page(idioma, rota) {
    const t = idioma
    const sistema = t.posts.sistemas[0]
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.system.default.title.replaceAll("%system%",sistema.card.title)}`,t.system.default.desc.replaceAll("%system%",sistema.card.title),"/static/img/banners/Dungeons_&_Dragon_Banner_Cape.webp")}
<body>
    ${nav(t, rota)}
    ${blog(t.system.default.title.replaceAll("%system%",sistema.card.title),sistema.tags,"/static/img/banners/Dungeons_&_Dragon_Banner_Cape.webp",`    
    ${MarkdownContent(sistema.md)}
    ${TextAndImage(t.footer.legal,linkReplacer(sistema.legal),sistema.icon,t.system.default.title.replaceAll("%system%",sistema.card.title))}
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