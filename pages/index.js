const {nav, footer} = require('../components/navbar')
const scripts = require('../components/bootscripts')
const {head} = require('../components/head')
function page(idioma, rota) {
    const t = idioma
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.index.name}`)}
<body>
    ${nav(t, rota)}


    ${footer(t)}
    ${scripts}
</body>
</html>
`
}

module.exports = {
    page
}