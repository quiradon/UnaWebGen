const {nav, footer} = require('../components/navbar')
const scripts = require('../components/bootscripts')
const {head} = require('../components/head')
const {idiomaR} = require('../caminho')
const {bot_invite} = require('../config.json')
const icons = require('../components/icons')
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
                                    <div class="d-flex d-xxl-flex justify-content-center align-items-center justify-content-xxl-center align-items-xxl-center mb-2"><img class="img-fluid" src="${img}" width="125px" alt="${title}"></div>
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
    let lang = idiomaR(t)
    return `
    <section class="bgImg1">
        <div class="container py-4 py-xl-5">
            <h2 class="text-center text-light mb-1 bt-1">${t.index.sec2.title}</h2>
            <p class="text-center text-light m-1 mb-5">${t.index.sec2.desc}</p>
             <div class="row row-cols-1 row-cols-lg-3 d-flex owl-carousel" id="carousel">

                ${Object.keys(t.posts.sistemas).map((key) => {
                    
                    const sistema = t.posts.sistemas[key];
                    return systemCards(sistema.card.title, sistema.card.desc, sistema.icon, `${lang}/posts/${sistema.path}`, sistema.card.btn)
                }).join('')}

             </div>                 
            </div>
        </div>
    </section>`
}


function botStatus(t) {
    return `<section>
    <div class="mb-2">
        <div class="container py-4 py-xl-5">
            <div class="text-nowrap d-flex justify-content-center align-items-center animated-text noSelect"></div>
            <div class="row h-100">
                <div class="col-md-10 col-xl-8 text-center d-flex d-sm-flex d-md-flex justify-content-center align-items-center mx-auto justify-content-md-start align-items-md-center justify-content-xl-center">
                    <div>
                        <h2 class="fw-bold text-white mb-3">${t.index.status.title}</h2>
                        <p class="text-light mb-4">${t.index.status.desc}</p>
                    </div>
                </div>
            </div>
            <div class="row gy-4 row-cols-2 row-cols-md-4 justify-content-center align-items-center">
                <div class="col">
                    <div class="text-center d-flex flex-column justify-content-center align-items-center py-3 mb-3" data-bss-hover-animate="pulse">
                        <div class="bs-icon-xl bs-icon-circle bs-icon-primary bg-primary d-flex flex-shrink-0 justify-content-center align-items-center d-inline-block mb-2 bs-icon lg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-32 0 512 512" width="1em" height="1em" fill="currentColor" class="text-dark">
                                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"></path>
                            </svg></div>
                        <div class="px-3">
                            <h2 class="fw-bold text-primary mb-0" id="userAmount">195412</h2>
                            <p class="text-white mb-0">${t.index.status.user}</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="text-center d-flex flex-column justify-content-center align-items-center py-3 mb-3" data-bss-hover-animate="pulse">
                        <div class="bs-icon-xl bs-icon-circle bs-icon-primary bg-primary d-flex flex-shrink-0 justify-content-center align-items-center d-inline-block mb-2 bs-icon lg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -64 640 640" width="1em" height="1em" fill="currentColor" class="text-dark">
                                <path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192h42.7c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0H21.3C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7h42.7C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3H405.3zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352H378.7C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7H154.7c-14.7 0-26.7-11.9-26.7-26.7z"></path>
                            </svg></div>
                        <div class="px-3">
                            <h2 class="fw-bold text-primary mb-0" id="serverAmount">4200</h2>
                            <p class="text-white mb-0">${t.index.status.guilds}</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="text-center d-flex flex-column justify-content-center align-items-center py-3 mb-3" data-bss-hover-animate="pulse">
                        <div class="bs-icon-xl bs-icon-circle bs-icon-primary bg-primary d-flex flex-shrink-0 justify-content-center align-items-center d-inline-block mb-2 bs-icon lg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -64 640 640" width="1em" height="1em" fill="currentColor" class="text-dark">
                                <path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"></path>
                            </svg></div>
                        <div class="px-3">
                            <h2 class="fw-bold text-primary mb-0" id="commandAmount">52</h2>
                            <p class="text-white mb-0">${t.index.status.cmds}</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="text-center d-flex flex-column justify-content-center align-items-center py-3 mb-3" data-bss-hover-animate="pulse">
                        <div class="bs-icon-xl bs-icon-circle bs-icon-primary bg-primary d-flex flex-shrink-0 justify-content-center align-items-center d-inline-block mb-2 bs-icon lg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor" class="text-dark">
                                <path d="M176 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64c-35.3 0-64 28.7-64 64H24c-13.3 0-24 10.7-24 24s10.7 24 24 24H64v56H24c-13.3 0-24 10.7-24 24s10.7 24 24 24H64v56H24c-13.3 0-24 10.7-24 24s10.7 24 24 24H64c0 35.3 28.7 64 64 64v40c0 13.3 10.7 24 24 24s24-10.7 24-24V448h56v40c0 13.3 10.7 24 24 24s24-10.7 24-24V448h56v40c0 13.3 10.7 24 24 24s24-10.7 24-24V448c35.3 0 64-28.7 64-64h40c13.3 0 24-10.7 24-24s-10.7-24-24-24H448V280h40c13.3 0 24-10.7 24-24s-10.7-24-24-24H448V176h40c13.3 0 24-10.7 24-24s-10.7-24-24-24H448c0-35.3-28.7-64-64-64V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H280V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H176V24zM160 128H352c17.7 0 32 14.3 32 32V352c0 17.7-14.3 32-32 32H160c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32zm192 32H160V352H352V160z"></path>
                            </svg></div>
                        <div class="px-3">
                            <h2 class="fw-bold text-primary mb-0" id="version">3.24.0</h2>
                            <p class="text-white mb-0">${t.index.status.version}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>`
}


function listItem(texto, svg) {
    return `
    <li class="mb-1">${svg} ${texto}</li>
    `
}

function plans(t) {
    return `
    <section id="premium" class="d-xl-flex justify-content-xl-center">
    <div class="container">
        <div class="row">
            <div class="col">
                <h2 class="text-center text-light">${t.index.donate.title}</h2>
                <p class="text-center text-light m-2 p-2">${t.index.donate.desc} </p>
            </div>
        </div>
        <div class="row g-0 justify-content-center align-items-center">
            <div class="col-xxl-12 box pb-0 mb-5">
                <div class="content">
                    <h3>${t.premium[0].title}${icons.shild}</h3>
                    <p>${t.premium[0].desc}</p>
                    <ul class="list-unstyled justify-content-xxl-start mb-1">
                        ${listItem(t.premium.feat[10],icons.user)}     
                        ${listItem(`2 ${t.premium.feat[4]}`,icons.coin)} 
                        ${listItem(`${t.premium.feat[6]} ${t.premium.feat[7]}`,icons.key)}
                        ${listItem(t.premium.feat[5], icons.msg)}
                        <hr></hr>
                        ${listItem(t.premium.feat[0],icons.dice)}
                        ${listItem(t.premium.feat[1],icons.tags)}
                        ${listItem(t.premium.feat[2], icons.text)}
                    </ul>
                    <h3 id="price-3" class="mt-3">R$5/mês</h3><a class="d-flex d-md-flex d-lg-flex d-xxl-flex justify-content-center justify-content-md-center align-items-md-center justify-content-lg-center align-items-lg-center justify-content-xxl-center align-items-xxl-center mt-3" href="#">${t.index.donate.btn}</a>
                </div>
            </div>
            <div class="col-xxl-12 box pb-0 mb-5">
                <div class="content">
                    <h3>${t.premium[1].title}${icons.group}</h3>
                    <p>${t.premium[1].desc}</p>
                    <ul class="list-unstyled justify-content-xxl-start mb-1">
                    ${listItem(t.premium.feat[10],icons.user)}     
                    ${listItem(`4 ${t.premium.feat[4]}`,icons.coin)} 
                    ${listItem(`${t.premium.feat[6]} ${t.premium.feat[8]}`,icons.key)}
                    ${listItem(t.premium.feat[5], icons.msg)}
                    <hr></hr>
                    ${listItem(t.premium.feat[0],icons.dice)}
                    ${listItem(t.premium.feat[1],icons.tags)}
                    ${listItem(t.premium.feat[2], icons.text)}
                    ${listItem(t.premium.feat[3], icons.palet)}
                    <h3 id="price-1" class="mt-3">R$7/mês</h3><a class="d-flex d-md-flex d-lg-flex d-xxl-flex justify-content-center justify-content-md-center align-items-md-center justify-content-lg-center align-items-lg-center justify-content-xxl-center align-items-xxl-center mt-3" href="#">${t.index.donate.btn}</a>
                </div>
            </div>
            <div class="col-xxl-12 box pb-0 mb-5">
                <div class="content">
                    <h3>${t.premium[2].title}${icons.octopus}</h3>
                    <p>${t.premium[2].desc}</p>
                    <ul class="list-unstyled justify-content-xxl-start mb-1">
                    ${listItem(t.premium.feat[11],icons.user)} 
                    ${listItem(`10 ${t.premium.feat[4]}`,icons.coin)} 
                    ${listItem(`${t.premium.feat[6]} ${t.premium.feat[12]}`,icons.key)}
                    ${listItem(t.premium.feat[5], icons.msg)}
                    ${listItem(t.premium.feat[9],icons.xadrez)}
                    ${listItem(t.premium.feat[98],icons.picture)}
                    ${listItem(t.premium.feat[99],icons.blocks)}
                    <hr></hr>
                            ${listItem(t.premium.feat[0],icons.dice)}
                            ${listItem(t.premium.feat[1],icons.tags)}
                            ${listItem(t.premium.feat[2], icons.text)}
                            ${listItem(t.premium.feat[3], icons.palet)}
                    </ul>
                    <h3 id="price-2" class="mt-3">R$15/mês</h3><a class="d-flex d-md-flex d-lg-flex d-xxl-flex justify-content-center justify-content-md-center align-items-md-center justify-content-lg-center align-items-lg-center justify-content-xxl-center align-items-xxl-center mt-3" href="#">${t.index.donate.btn}</a>
                </div>
            </div>
        </div>
    </div>
</section>`
}

function card(title, text,svg) {
return `
<div class="col d-flex mt-1 mb-3">
                <div class="card border-white border-0 shadow glass-container cardBonito">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-center align-items-center align-content-center">
                            <div class="bs-icon-md bs-icon-circle d-flex justify-content-center align-items-center d-inline-block bs-icon">${svg}</div>
                        </div>
                        <h4 class="text-center text-white card-title">${title}</h4>
                        <p class="text-start text-light card-text">${text}</p>
                    </div>
                </div>
            </div>`
}

function cards(t) {
    return `
    <section class="bgImg2">
    <div class="container py-4 py-xl-5">
        <h2 class="text-center text-light">${t.index.features.title}</h2>
        <p class="text-center text-light mt-1 mb-5">${t.index.features.desc}</p>
        <div class="row gy-4 row-cols-1 row-cols-md-2 row-cols-xl-3 d-flex">
            ${card(t.index.func.card[0].title,t.index.func.card[0].desc,`<svg class="text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M228.3 469.1L47.6 300.4c-4.2-3.9-8.2-8.1-11.9-12.4h87c22.6 0 43-13.6 51.7-34.5l10.5-25.2 49.3 109.5c3.8 8.5 12.1 14 21.4 14.1s17.8-5 22-13.3L320 253.7l1.7 3.4c9.5 19 28.9 31 50.1 31H476.3c-3.7 4.3-7.7 8.5-11.9 12.4L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9zM503.7 240h-132c-3 0-5.8-1.7-7.2-4.4l-23.2-46.3c-4.1-8.1-12.4-13.3-21.5-13.3s-17.4 5.1-21.5 13.3l-41.4 82.8L205.9 158.2c-3.9-8.7-12.7-14.3-22.2-14.1s-18.1 5.9-21.8 14.8l-31.8 76.3c-1.2 3-4.2 4.9-7.4 4.9H16c-2.6 0-5 .4-7.3 1.1C3 225.2 0 208.2 0 190.9v-5.8c0-69.9 50.5-129.5 119.4-141C165 36.5 211.4 51.4 244 84l12 12 12-12c32.6-32.6 79-47.5 124.6-39.9C461.5 55.6 512 115.2 512 185.1v5.8c0 16.9-2.8 33.5-8.3 49.1z"></path></svg>`)}
            ${card(t.index.func.card[1].title,t.index.func.card[1].desc,`<svg class="text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M48.7 125.8l53.2 31.9c7.8 4.7 17.8 2 22.2-5.9L201.6 12.1c3-5.4-.9-12.1-7.1-12.1c-1.6 0-3.2 .5-4.6 1.4L47.9 98.8c-9.6 6.6-9.2 20.9 .8 26.9zM16 171.7V295.3c0 8 10.4 11 14.7 4.4l60-92c5-7.6 2.6-17.8-5.2-22.5L40.2 158C29.6 151.6 16 159.3 16 171.7zM310.4 12.1l77.6 139.6c4.4 7.9 14.5 10.6 22.2 5.9l53.2-31.9c10-6 10.4-20.3 .8-26.9L322.1 1.4c-1.4-.9-3-1.4-4.6-1.4c-6.2 0-10.1 6.7-7.1 12.1zM496 171.7c0-12.4-13.6-20.1-24.2-13.7l-45.3 27.2c-7.8 4.7-10.1 14.9-5.2 22.5l60 92c4.3 6.7 14.7 3.6 14.7-4.4V171.7zm-49.3 246L286.1 436.6c-8.1 .9-14.1 7.8-14.1 15.9v52.8c0 3.7 3 6.8 6.8 6.8c.8 0 1.6-.1 2.4-.4l172.7-64c6.1-2.2 10.1-8 10.1-14.5c0-9.3-8.1-16.5-17.3-15.4zM233.2 512c3.7 0 6.8-3 6.8-6.8V452.6c0-8.1-6.1-14.9-14.1-15.9l-160.6-19c-9.2-1.1-17.3 6.1-17.3 15.4c0 6.5 4 12.3 10.1 14.5l172.7 64c.8 .3 1.6 .4 2.4 .4zM41.7 382.9l170.9 20.2c7.8 .9 13.4-7.5 9.5-14.3l-85.7-150c-5.9-10.4-20.7-10.8-27.3-.8L30.2 358.2c-6.5 9.9-.3 23.3 11.5 24.7zm439.6-24.8L402.9 238.1c-6.5-10-21.4-9.6-27.3 .8L290.2 388.5c-3.9 6.8 1.6 15.2 9.5 14.3l170.1-20c11.8-1.4 18-14.7 11.5-24.6zm-216.9 11l78.4-137.2c6.1-10.7-1.6-23.9-13.9-23.9H183.1c-12.3 0-20 13.3-13.9 23.9l78.4 137.2c3.7 6.4 13 6.4 16.7 0zM174.4 176H337.6c12.2 0 19.9-13.1 14-23.8l-80-144c-2.8-5.1-8.2-8.2-14-8.2h-3.2c-5.8 0-11.2 3.2-14 8.2l-80 144c-5.9 10.7 1.8 23.8 14 23.8z"></path></svg>`)}
            ${card(t.index.func.card[2].title,t.index.func.card[2].desc,`<svg class="text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="-64 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M280 64h40c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128C0 92.7 28.7 64 64 64h40 9.6C121 27.5 153.3 0 192 0s71 27.5 78.4 64H280zM64 112c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H304v24c0 13.3-10.7 24-24 24H192 104c-13.3 0-24-10.7-24-24V112H64zm128-8a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"></path></svg>`)}
            ${card(t.index.func.card[3].title,t.index.func.card[3].desc,`<svg class="text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"></path></svg>`)}
            ${card(t.index.func.card[4].title,t.index.func.card[4].desc,`<svg class="text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path></svg>`)}
            ${card(t.index.func.card[5].title,t.index.func.card[5].desc,`<svg class="text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="-64 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M384 312.7c-55.1 136.7-187.1 54-187.1 54-40.5 81.8-107.4 134.4-184.6 134.7-16.1 0-16.6-24.4 0-24.4 64.4-.3 120.5-42.7 157.2-110.1-41.1 15.9-118.6 27.9-161.6-82.2 109-44.9 159.1 11.2 178.3 45.5 9.9-24.4 17-50.9 21.6-79.7 0 0-139.7 21.9-149.5-98.1 119.1-47.9 152.6 76.7 152.6 76.7 1.6-16.7 3.3-52.6 3.3-53.4 0 0-106.3-73.7-38.1-165.2 124.6 43 61.4 162.4 61.4 162.4.5 1.6.5 23.8 0 33.4 0 0 45.2-89 136.4-57.5-4.2 134-141.9 106.4-141.9 106.4-4.4 27.4-11.2 53.4-20 77.5 0 0 83-91.8 172-20z"></path></svg>`)}
            ${card(t.index.func.card[6].title,t.index.func.card[6].desc,`<svg class="text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M512 80c0 18-14.3 34.6-38.4 48c-29.1 16.1-72.5 27.5-122.3 30.9c-3.7-1.8-7.4-3.5-11.3-5C300.6 137.4 248.2 128 192 128c-8.3 0-16.4 .2-24.5 .6l-1.1-.6C142.3 114.6 128 98 128 80c0-44.2 86-80 192-80S512 35.8 512 80zM160.7 161.1c10.2-.7 20.7-1.1 31.3-1.1c62.2 0 117.4 12.3 152.5 31.4C369.3 204.9 384 221.7 384 240c0 4-.7 7.9-2.1 11.7c-4.6 13.2-17 25.3-35 35.5c0 0 0 0 0 0c-.1 .1-.3 .1-.4 .2l0 0 0 0c-.3 .2-.6 .3-.9 .5c-35 19.4-90.8 32-153.6 32c-59.6 0-112.9-11.3-148.2-29.1c-1.9-.9-3.7-1.9-5.5-2.9C14.3 274.6 0 258 0 240c0-34.8 53.4-64.5 128-75.4c10.5-1.5 21.4-2.7 32.7-3.5zM416 240c0-21.9-10.6-39.9-24.1-53.4c28.3-4.4 54.2-11.4 76.2-20.5c16.3-6.8 31.5-15.2 43.9-25.5V176c0 19.3-16.5 37.1-43.8 50.9c-14.6 7.4-32.4 13.7-52.4 18.5c.1-1.8 .2-3.5 .2-5.3zm-32 96c0 18-14.3 34.6-38.4 48c-1.8 1-3.6 1.9-5.5 2.9C304.9 404.7 251.6 416 192 416c-62.8 0-118.6-12.6-153.6-32C14.3 370.6 0 354 0 336V300.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 342.6 135.8 352 192 352s108.6-9.4 148.1-25.9c7.8-3.2 15.3-6.9 22.4-10.9c6.1-3.4 11.8-7.2 17.2-11.2c1.5-1.1 2.9-2.3 4.3-3.4V304v5.7V336zm32 0V304 278.1c19-4.2 36.5-9.5 52.1-16c16.3-6.8 31.5-15.2 43.9-25.5V272c0 10.5-5 21-14.9 30.9c-16.3 16.3-45 29.7-81.3 38.4c.1-1.7 .2-3.5 .2-5.3zM192 448c56.2 0 108.6-9.4 148.1-25.9c16.3-6.8 31.5-15.2 43.9-25.5V432c0 44.2-86 80-192 80S0 476.2 0 432V396.6c12.5 10.3 27.6 18.7 43.9 25.5C83.4 438.6 135.8 448 192 448z"></path></svg>`)}
            ${card(t.index.func.card[7].title,t.index.func.card[7].desc,`<svg class="text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="-64 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M153.6 29.9l16-21.3C173.6 3.2 180 0 186.7 0C198.4 0 208 9.6 208 21.3V43.5c0 13.1 5.4 25.7 14.9 34.7L307.6 159C356.4 205.6 384 270.2 384 337.7C384 434 306 512 209.7 512H192C86 512 0 426 0 320v-3.8c0-48.8 19.4-95.6 53.9-130.1l3.5-3.5c4.2-4.2 10-6.6 16-6.6C85.9 176 96 186.1 96 198.6V288c0 35.3 28.7 64 64 64s64-28.7 64-64v-3.9c0-18-7.2-35.3-19.9-48l-38.6-38.6c-24-24-37.5-56.7-37.5-90.7c0-27.7 9-54.8 25.6-76.9z"></path></svg>`)}
            ${card(t.index.func.card[8].title,t.index.func.card[8].desc,`<svg class="text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M416 398.9c58.5-41.1 96-104.1 96-174.9C512 100.3 397.4 0 256 0S0 100.3 0 224c0 70.7 37.5 133.8 96 174.9c0 .4 0 .7 0 1.1v64c0 26.5 21.5 48 48 48h48V464c0-8.8 7.2-16 16-16s16 7.2 16 16v48h64V464c0-8.8 7.2-16 16-16s16 7.2 16 16v48h48c26.5 0 48-21.5 48-48V400c0-.4 0-.7 0-1.1zM96 256a64 64 0 1 1 128 0A64 64 0 1 1 96 256zm256-64a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"></path></svg>`)}
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
    ${botStatus(t)}
    ${cards(t)}
    ${plans(t)}
    ${footer(t,rota)}
    ${scripts}
    <script>
    fetch("https://api.github.com/gists/5696808013548492a67fb21c32759479").then(a=>a.json()).then(a=>{a=JSON.parse(a.files["botstatus.json"].content),document.getElementById("version").innerHTML=a.version;let b=0;const c=document.getElementById("userAmount"),d=document.getElementById("serverAmount"),e=document.getElementById("commandAmount"),f=Math.max(a.userAmount,a.serverAmount,a.commandAmount),g=f/100;console.log(a);const h={members(){return b+=g,b>=a.userAmount?(c.innerHTML=a.userAmount,void(h.members=()=>{})):void(c.innerHTML=Math.round(b))},server_amount(){return b+=g,b>=a.serverAmount?(d.innerHTML=a.serverAmount,void(h.server_amount=()=>{})):void(d.innerHTML=Math.round(b))},commands(){return b+=g,b>=a.commandAmount?(e.innerHTML=a.commandAmount,void(h.commands=()=>{})):void(e.innerHTML=Math.round(b))},update(a,c){h.members(),h.server_amount(),h.commands(),b>=a&&clearInterval(c)}},j=setInterval(()=>{h.update(f,j)},50)});
    </script>
</body>
</html>
`
}

module.exports = {
    page
}