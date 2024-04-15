const {nav, footer} = require('../components/navbar')
const scripts = require('../components/bootscripts')
const {head} = require('../components/head')
const {idiomaR} = require('../caminho')


function gebIMG(url) {
    return `
    <div class="col item"><a href="${url}"><img class="img-fluid rounded-2" src="${url}"/></a></div>
    `
}

function page(idioma, rota) {
    const t = idioma
    let idiomaUpdates = t.lang
    if (idiomaUpdates == 'pt') {
        idiomaUpdates = 'pt-BR'
    } 
    const lang = idiomaR(t)
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.changelogs.title}`)}
<body>
    ${nav(t, rota)}
            <section class="photo-gallery py-4 py-xl-5">
                <div class="container">
                    <div class="row mb-5">
                        <div class="col-md-8 col-xl-6 text-center mx-auto">
                            <h2>Secret</h2>
                            <p class="w-lg-50">Estoque de Imagens Originais da Fortuna</p>
                        </div>
                    </div>
                    <div class="row gx-2 gy-2 row-cols-1 row-cols-md-2 row-cols-xl-3 photos" data-bss-baguettebox>
                        ${gebIMG("/static/img/misc/secrets/calva.webp")}         
                        ${gebIMG("/static/img/misc/secrets/dominix.webp")}        
                        ${gebIMG("/static/img/misc/secrets/uwu.webp")}        
                    </div>
                    
                </div>
            </section>
    ${footer(t,rota)}
    ${scripts}
</body>
</html>
`
}

module.exports = {
    page
}