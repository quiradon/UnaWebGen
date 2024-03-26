const {nav, footer} = require('../components/navbar')
const scripts = require('../components/bootscripts')
const {head} = require('../components/head')
const {idiomaR} = require('../caminho')
const {bot_invite} = require('../config.json')

/**
 * 
 * @param {*} idioma 
 * @returns 
 */
function inicio(idioma) {
    const t = idioma
    let lang = idiomaR(t)
    return `<section id="inicio">
    <div class="container py-4 py-xl-5">
        <div class="row row-cols-1 row-cols-lg-2">
            <div class="col align-self-center">
                <h1 class="display-5 fw-bold lh-1 mb-3">Fortuna</h1>
                <p class="text-white lead">${t.index.start.desc}</p>
                <div class="d-flex justify-content-sm-center align-items-sm-center justify-content-md-center align-items-md-center justify-content-lg-start">
                <a data-bss-hover-animate="pulse" class="btn btn-primary btn-lg link-light px-4 mt-2 mb-2" role="button" href="${bot_invite}" target="_blank">${t.index.start.btn1}</a>
                <a data-bss-hover-animate="pulse" class="btn btn-outline-light btn-lg d-flex align-items-center px-4 m-2" data-bss-hover-animate="pulse" role="button" href="${lang}/dices" rel="help">${t.nav.docs.title}</a></div>
            </div>
            <div class="col align-self-center"><img class="rounded img-fluid d-md-inline" src="/static/img/misc/una_hero_logo.webp" loading="auto" alt="Inanimalia Fortuna Tenebris Verteri" /></div>
        </div>
    </div>
</section>`
}

function systemCards(title, desc, img, link, btn) {
    return `
    <div class="col d-flex mt-1 mb-3 item">
                    <div class="card border-white border-0 shadow glass-container cardBonito">
                        <div class="card-body d-flex flex-grow-1 p-4">
                            <div class="row row-cols-1 align-items-stretch">
                                <div class="col">
                                    <div class="d-flex d-xxl-flex justify-content-center align-items-center justify-content-xxl-center align-items-xxl-center mb-2"><img class="img-fluid" src="${img}" width="125px" alt="Ordem Paranormal no Discord"></div>
                                </div>
                                <div class="col">
                                    <h3 class="text-center text-white">${title}</h3>
                                </div>
                                <div class="col">
                                    <p class="text-start text-light">${desc}</p>
                                </div>
                                <div class="col text-center d-lg-flex justify-content-lg-center align-items-lg-end"><a class="btn btn-primary link-light border rounded-pill border-0" data-bss-hover-animate="pulse" href="${link}" role="button">${btn}</a></div>
                            </div>
                        </div>
                    </div>
                </div>
`
}


function section2(t) {
    return `
    <section class="bgImg1">
        <div class="container py-4 py-xl-5">
            <h2 class="text-center text-light mb-1 bt-1">${t.index.sec2.title}</h2>
            <p class="text-center text-light m-1 mb-5">${t.index.sec2.desc}</p>
             <div class="row row-cols-1 row-cols-lg-3 d-flex owl-carousel" id="carousel">

                ${systemCards("teste", "teste", "/static/img/misc/una_hero_logo.webp", bot_invite, "teste")}



             </div>                 
            </div>
        </div>
    </section>`
}


function page(idioma, rota) {
    const t = idioma
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.index.name}`)}
<body>
    ${nav(t, rota)}
    ${inicio(t)}
    ${section2(t)}
    ${footer(t,rota)}
    ${scripts}
</body>
</html>
`
}

module.exports = {
    page
}