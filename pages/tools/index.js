const {nav, footer} = require('../../components/navbar')
const scripts = require('../../components/bootscripts')
const {head} = require('../../components/head')
const names = require('../../data/names.json')
const {idiomaR} = require('../../caminho')
listaNames = JSON.stringify(names)

function drawCard(t, title, desc, url, icon) {
    let lang = idiomaR(t)
       
    return `
         <div class="col-xxl-4 d-flex">
            <a href="${lang}/${url}" class="card system_card text-decoration-none flex-grow-1">
                <div class="card-body d-flex flex-column p-4">
                    <div class="bs-icon-md bs-icon-rounded bs-icon-primary d-flex justify-content-center align-items-center d-inline-block mb-3 bs-icon">${icon}</div>
                    <h4 class="card-title">${title}</h4>
                    <p class="card-text flex-grow-1">${desc}</p>
                </div>
            </a>
        </div>
        `;
}


function page(idioma, rota) {
    const t = idioma
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.tools.section.title}`,`${t.tools.section.desc}`)}
<body>
    ${nav(t, rota)}
    <section id="inicio" style="background: url('pattern-square.svg') top / auto repeat-x;">
    <div class="container py-3">
        <div>
            <h1 class="display-5 fw-bold text-white">${t.tools.section.title}</h1>
            <p class="lead text-secondary">${t.tools.section.desc}</p>
        </div>
    </div>
    <div class="container py-4 py-xl-5">
    <div class="row gy-4 row-cols-1 row-cols-md-2 row-cols-xl-3 flex grow">
   
    ${drawCard(t,t.nav.dices.title, t.nav.dices.desc, 'dices', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-32 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M201 10.3c14.3-7.8 31.6-7.8 46 0L422.3 106c5.1 2.8 8.3 8.2 8.3 14s-3.2 11.2-8.3 14L231.7 238c-4.8 2.6-10.5 2.6-15.3 0L25.7 134c-5.1-2.8-8.3-8.2-8.3-14s3.2-11.2 8.3-14L201 10.3zM23.7 170l176 96c5.1 2.8 8.3 8.2 8.3 14V496c0 5.6-3 10.9-7.8 13.8s-10.9 3-15.8 .3L25 423.1C9.6 414.7 0 398.6 0 381V184c0-5.6 3-10.9 7.8-13.8s10.9-3 15.8-.3zm400.7 0c5-2.7 11-2.6 15.8 .3s7.8 8.1 7.8 13.8V381c0 17.6-9.6 33.7-25 42.1L263.7 510c-5 2.7-11 2.6-15.8-.3s-7.8-8.1-7.8-13.8V280c0-5.9 3.2-11.2 8.3-14l176-96z"></path></svg>')}
    ${drawCard(t,t.nav.tools.poker.name, t.nav.tools.poker.desc, 'tools/poker', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"></path></svg>')}
    ${drawCard(t,t.nav.tools.tarot.name, t.nav.tools.tarot.desc, 'tools/tarot', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-64 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"></path></svg>')}
    ${drawCard(t,t.nav.tools.names.title, t.nav.tools.names.desc, 'tools/names', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-32 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M224 256A128 128 0 1 1 224 0a128 128 0 1 1 0 256zM209.1 359.2l-18.6-31c-6.4-10.7 1.3-24.2 13.7-24.2H224h19.7c12.4 0 20.1 13.6 13.7 24.2l-18.6 31 33.4 123.9 36-146.9c2-8.1 9.8-13.4 17.9-11.3c70.1 17.6 121.9 81 121.9 156.4c0 17-13.8 30.7-30.7 30.7H285.5c-2.1 0-4-.4-5.8-1.1l.3 1.1H168l.3-1.1c-1.8 .7-3.8 1.1-5.8 1.1H30.7C13.8 512 0 498.2 0 481.3c0-75.5 51.9-138.9 121.9-156.4c8.1-2 15.9 3.3 17.9 11.3l36 146.9 33.4-123.9z"></path></svg>')}
    ${drawCard(t,t.flip_coin.title, t.flip_coin.description, 'tools/coinflip', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-352a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"></path></svg>')}
    ${drawCard(t,t.tools.clima.pageTitle, t.tools.clima.pageDesc, 'tools/weather', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-32 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M0 32V45.6C0 62.7 1.7 79.6 5 96H357.8c3.2-6.9 7.5-13.3 13-18.8l38.6-38.6c4.2-4.2 6.6-10 6.6-16C416 10.1 405.9 0 393.4 0H32C14.3 0 0 14.3 0 32zm352.2 96H13.6c12.2 35.9 32.3 68.7 58.8 96H412l-47.2-62.9c-7.3-9.7-11.6-21.2-12.6-33.1zm-226 138.2l116.4 68.5c8.2 4.8 15.8 10.7 22.5 17.3H445c2-9.8 3-19.9 3-30.1c0-23-5.3-45.5-15.3-65.9H110.2c5.2 3.6 10.5 7 16 10.2zM288 384c10.3 21.4 13.8 45.5 9.9 69l-5.9 35.7c-2 12.2 7.4 23.4 19.8 23.4c5.3 0 10.4-2.1 14.2-5.9l78.2-78.2c12.8-12.8 23.1-27.7 30.4-43.9H288z"></path></svg>')}

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