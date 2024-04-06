const {nav, footer} = require('../components/navbar')
const scripts = require('../components/bootscripts')
const {head} = require('../components/head')

let updates = require('../data/updates.json')
//transforme o json em um array de objetos
updates = updates.v
function generateCard(version, text, image) {
    text = text.replace(/\n/g, '<br />');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/@(\w+)/g, '<span class="text-primary">@$1</span>');
    text = text.replace(/`(.*?)`/g, '<span class="text-bg-primary">$1</span>');
    return `<div class="col">
        <div class="border rounded border-1 border-primary-subtle px-4 py-1 m-2 my-4">
            <h2 class="text-center text-primary">${version}</h2>
            <hr class="text-primary">
            <p class="text-break text-light">${text}</p>
            <hr class="text-primary">
            ${image ? `<img class="rounded img-fluid" src="${image}">` : ''}
        </div>
    </div>
    `
}
function page(idioma, rota) {
    const t = idioma
    let idiomaUpdates = t.lang
    if (idiomaUpdates == 'pt') {
        idiomaUpdates = 'pt-BR'
    } 
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.changelogs.title}`)}
<body>
    ${nav(t, rota)}

    <div class="container">
    <div class="col-12 text-center mb-2 mt-4">
    <h1>${t.changelogs.title}</h1>
</div>
    <div class="row row-cols-1" id="updates"><div class="col">
    ${updates.map(update => generateCard(update.version, update.text[idiomaUpdates], update.img)).join('')}
    </div>
</div>
    ${footer(t,rota)}
    ${scripts}
</body>
</html>
`
}

module.exports = {
    page
}