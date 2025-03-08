const {nav, footer} = require('../components/navbar')
const scripts = require('../components/bootscripts')
const {head} = require('../components/head')

function TitleAndSubtitle(title,paragraph) {
    paragraph = paragraph || ''
    paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<span class="text-primary">$1</span>')
    return `
            <div class="mb-3">
            <h1 class="display-5 fw-bold mt-0">${title}</h1>
            <p class="lead text-secondary -3">${paragraph}</p>
        </div>
        `
}

async function fetchUpdates() {
    const response = await fetch('https://una-api.arkanus.app/updates');
    
    const data = await response.json();
    return data;
}

function generateCard(version, text, image) {
    if (text) {
        text = text.replace(/\n/g, '<br/>');
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/@(\w+)/g, '<span class="text-primary">@$1</span>');
        text = text.replace(/`(.*?)`/g, '<span class="text-bg-primary">$1</span>');
    }
    return `<div class="col" id="${version}">
        <div class="border rounded border-1 border-primary-subtle px-4 py-1 m-2 my-4">
            <h2 class="text-center mt-3">${version}</h2>
            <hr class="text-primary">
            <p class="text-break text-light">${text || ''}</p>
            <hr class="text-primary">
            ${image ? `<img class="rounded img-fluid" src="${image}">` : ''}
        </div>
    </div>
    `
}
async function page(idioma, rota) {
    const t = idioma
    let idiomaUpdates = t.lang
    if (idiomaUpdates == 'pt') {
        idiomaUpdates = 'pt-BR'
    } else {
        idiomaUpdates = 'en-US'
    }


    const updates = await fetchUpdates(); // Buscando as atualizações da URL

    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.changelogs.title}`,t.changelogs.desc)}
<body>
    ${nav(t, rota)}

    <div class="container">
    <div class="col-12 text-center mb-2 mt-4">
    ${TitleAndSubtitle(t.nav.docs.changelogs.name,t.nav.docs.changelogs.desc)}
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