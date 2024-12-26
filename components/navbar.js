const {discord_invite, bot_invite, url} = require('../config.json')
const {idiomaR, roteador} = require('../caminho')

const lang_FLAGS = {
    'pt': '/static/img/flags/br.svg',
    'en': '/static/img/flags/en.svg',
    'es': '/static/img/flags/es.svg',
    'ru': '/static/img/flags/ru.svg',
}


/**
 * 
 * <a class="dropdown-item d-flex justify-content-sm-start" href="https://etheris.arkanus.app" rel="help" data-bs-target="https://rpg.arkanus.app">
                                <div class="d-flex justify-content-center align-items-center m-2"><svg class="fs-1 text-primary border rounded border-0 p-2 me-2 d-none d-md-flex nav_icon_background" xmlns="http://www.w3.org/2000/svg" viewBox="-32 0 512 512" width="1em" height="1em" fill="currentColor">
                                        <path d="M368 80h32v32H368V80zM352 32c-17.7 0-32 14.3-32 32H128c0-17.7-14.3-32-32-32H32C14.3 32 0 46.3 0 64v64c0 17.7 14.3 32 32 32V352c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32H96c17.7 0 32-14.3 32-32H320c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V384c0-17.7-14.3-32-32-32V160c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32H352zM96 160c17.7 0 32-14.3 32-32H320c0 17.7 14.3 32 32 32V352c-17.7 0-32 14.3-32 32H128c0-17.7-14.3-32-32-32V160zM48 400H80v32H48V400zm320 32V400h32v32H368zM48 112V80H80v32H48z"></path>
                                    </svg>
                                    <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">Geração de Assets</span><span class="text-secondary lh-0">Prepare assets para sua mesa em instantes</span></div>
                                </div>
                            </a>
                            
 */

function nav(t,rota){
    let lang = idiomaR(t)
    rota = roteador(rota)
    return `
    <div class="sticky-top p-2">
    <nav class="navbar navbar-expand-lg mx-1 mx-md-4 px-2 mt-2">
        <div class="container-fluid"><a class="navbar-brand fs-2 fw-bold d-flex align-items-center" href="${lang}/#"><span class="fs-3 fw-bold" style="font-family: Roboto, sans-serif;">Mini Kraken</span></a><button class="navbar-toggler border-1 py-2" data-bs-toggle="collapse" data-bs-target="#navcol-2"><span class="visually-hidden">Toggle navigation</span><span class="navbar-toggler-icon"></span></button>
            <div id="navcol-2" class="collapse navbar-collapse">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item dropdown auto-open animations-select"><a class="nav-link d-xxl-flex justify-content-xxl-center align-items-xxl-center" aria-expanded="false" data-bs-toggle="dropdown" href="#"><svg class="me-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                                <path d="M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z"></path>
                            </svg>${t.nav.acervo}<svg class="mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="-96 0 512 512" width="1em" height="1em" fill="currentColor">
                                <path d="M182.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8H288c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128z"></path>
                            </svg></a>
                        <div class="dropdown-menu shadow">
                        <a class="dropdown-item d-flex justify-content-sm-start" href="https://rpg.arkanus.app" rel="help" data-bs-target="https://rpg.arkanus.app">
                                <div class="d-flex justify-content-center align-items-center m-2"><svg class="fs-1 d-none d-md-flex text-danger border rounded border-0 p-2 fme-2 nav_icon_background me-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                                        <path d="M459.1 52.4L442.6 6.5C440.7 2.6 436.5 0 432.1 0s-8.5 2.6-10.4 6.5L405.2 52.4l-46 16.8c-4.3 1.6-7.3 5.9-7.2 10.4c0 4.5 3 8.7 7.2 10.2l45.7 16.8 16.8 45.8c1.5 4.4 5.8 7.5 10.4 7.5s8.9-3.1 10.4-7.5l16.5-45.8 45.7-16.8c4.2-1.5 7.2-5.7 7.2-10.2c0-4.6-3-8.9-7.2-10.4L459.1 52.4zm-132.4 53c-12.5-12.5-32.8-12.5-45.3 0l-2.9 2.9C256.5 100.3 232.7 96 208 96C93.1 96 0 189.1 0 304S93.1 512 208 512s208-93.1 208-208c0-24.7-4.3-48.5-12.2-70.5l2.9-2.9c12.5-12.5 12.5-32.8 0-45.3l-80-80zM200 192c-57.4 0-104 46.6-104 104v8c0 8.8-7.2 16-16 16s-16-7.2-16-16v-8c0-75.1 60.9-136 136-136h8c8.8 0 16 7.2 16 16s-7.2 16-16 16h-8z"></path>
                                    </svg>
                                    <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">Itens</span><span class="text-secondary">Encontre itens enviados pela comunidade</span></div>
                                </div>
                         </a>
                         <a class="dropdown-item d-flex justify-content-sm-start" href="/apps/books.html" rel="help" data-bs-target="https://nutri.arkanus.app">
                                <div class="d-flex justify-content-center align-items-center m-2"><svg class="fs-1 text-primary border rounded border-0 p-2 me-2 d-none d-md-flex nav_icon_background" xmlns="http://www.w3.org/2000/svg" viewBox="-32 0 512 512" width="1em" height="1em" fill="currentColor">
                                        <path d="M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z"></path>
                                    </svg>
                                    <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">Magias</span><span class="text-secondary">Encontre magias enviadas pela comunidade</span></div>
                                </div>
                        </a>
                        <a class="dropdown-item d-flex justify-content-sm-start" href="https://etheris.arkanus.app" rel="help" data-bs-target="https://rpg.arkanus.app">
                                <div class="d-flex justify-content-center align-items-center m-2"><svg class="fs-1 text-primary border rounded border-0 p-2 me-2 d-none d-md-flex nav_icon_background" xmlns="http://www.w3.org/2000/svg" viewBox="-32 0 512 512" width="1em" height="1em" fill="currentColor">
                                        <path d="M248 48V256h48V58.7c23.9 13.8 40 39.7 40 69.3V256h48V128C384 57.3 326.7 0 256 0H192C121.3 0 64 57.3 64 128V256h48V128c0-29.6 16.1-55.5 40-69.3V256h48V48h48zM48 288c-12.1 0-23.2 6.8-28.6 17.7l-16 32c-5 9.9-4.4 21.7 1.4 31.1S20.9 384 32 384l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32V384H352v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384c11.1 0 21.4-5.7 27.2-15.2s6.4-21.2 1.4-31.1l-16-32C423.2 294.8 412.1 288 400 288H48z"></path>
                                    </svg>
                                    <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">Mesas</span><span class="text-secondary">Encontre Mesas enviadas pela comunidade</span></div>
                                </div>
                        </a>
                        <a class="dropdown-item d-flex justify-content-sm-start" href="https://etheris.arkanus.app" rel="help" data-bs-target="https://rpg.arkanus.app">
                                <div class="d-flex justify-content-center align-items-center m-2"><svg class="fs-1 text-primary border rounded border-0 p-2 me-2 d-none d-md-flex nav_icon_background" xmlns="http://www.w3.org/2000/svg" viewBox="0 -64 640 640" width="1em" height="1em" fill="currentColor">
                                        <path d="M456 0c-48.6 0-88 39.4-88 88v29.2L12.5 390.6c-14 10.8-16.6 30.9-5.9 44.9s30.9 16.6 44.9 5.9L126.1 384H259.2l46.6 113.1c5 12.3 19.1 18.1 31.3 13.1s18.1-19.1 13.1-31.3L311.1 384H352c1.1 0 2.1 0 3.2 0l46.6 113.2c5 12.3 19.1 18.1 31.3 13.1s18.1-19.1 13.1-31.3l-42-102C484.9 354.1 544 280 544 192V128v-8l80.5-20.1c8.6-2.1 13.8-10.8 11.6-19.4C629 52 603.4 32 574 32H523.9C507.7 12.5 483.3 0 456 0zm0 64a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"></path>
                                    </svg>
                                    <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">Criaturas</span><span class="text-secondary">Encontre Criaturas enviadas pela comunidade</span></div>
                                </div>
                        </a>
                            </div>
                    </li>
                    <li  class="nav-item dropdown auto-open animations-select"><a class="nav-link d-xxl-flex justify-content-xxl-center align-items-xxl-center" aria-expanded="false" data-bs-toggle="dropdown" href="#"><svg class="me-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                                <path d="M315.4 15.5C309.7 5.9 299.2 0 288 0s-21.7 5.9-27.4 15.5l-96 160c-5.9 9.9-6.1 22.2-.4 32.2s16.3 16.2 27.8 16.2H384c11.5 0 22.2-6.2 27.8-16.2s5.5-22.3-.4-32.2l-96-160zM288 312V456c0 22.1 17.9 40 40 40H472c22.1 0 40-17.9 40-40V312c0-22.1-17.9-40-40-40H328c-22.1 0-40 17.9-40 40zM128 512a128 128 0 1 0 0-256 128 128 0 1 0 0 256z"></path>
                            </svg>${t.nav.guide}<svg class="mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="-96 0 512 512" width="1em" height="1em" fill="currentColor">
                                <path d="M182.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8H288c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128z"></path>
                            </svg></a>
                        <div class="dropdown-menu"><a class="dropdown-item d-flex justify-content-sm-start" href="https://etheris.arkanus.app" rel="help" data-bs-target="https://rpg.arkanus.app">
                                <div class="d-flex justify-content-center align-items-center m-2"><svg class="fs-1 text-primary border rounded border-0 p-2 me-2 d-none d-md-flex nav_icon_background" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                                        <path d="M342.6 9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4L28.1 342.6C10.1 360.6 0 385 0 410.5V416c0 53 43 96 96 96h5.5c25.5 0 49.9-10.1 67.9-28.1L448 205.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-32-32-96-96-32-32zM205.3 256L352 109.3 402.7 160l-96 96H205.3z"></path>
                                    </svg>
                                    <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">Lista de Comandos e Funções</span><span class="text-secondary lh-0">Veja a lista completa de funções</span></div>
                                </div>
                            </a><a target="_blank" class="dropdown-item d-flex justify-content-sm-start" href="https://dice-roller.github.io/documentation/guide/notation/" rel="help" data-bs-target="https://dice-roller.github.io/documentation/guide/notation/">
                                <div class="d-flex justify-content-center align-items-center m-2"><svg class="fs-1 text-danger border rounded border-0 p-2 fme-2 d-none d-md-flex nav_icon_background me-2" xmlns="http://www.w3.org/2000/svg" viewBox="-64 0 512 512" width="1em" height="1em" fill="currentColor">
                                        <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z"></path>
                                    </svg>
                                    <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">Documentação Dados</span><span class="text-secondary lh-0">Guias de como usar a ferramenta</span></div>
                                </div>
                            </a><a class="dropdown-item d-flex justify-content-sm-start" href="${lang}/changelog" rel="help" data-bs-target="https://nutri.arkanus.app">
                                <div class="d-flex justify-content-center align-items-center m-2"><svg class="fs-1 text-primary p-2 me-2 d-none d-md-flex nav_icon_background" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                                        <path d="M96 96c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H80c-44.2 0-80-35.8-80-80V128c0-17.7 14.3-32 32-32s32 14.3 32 32V400c0 8.8 7.2 16 16 16s16-7.2 16-16V96zm64 24v80c0 13.3 10.7 24 24 24H296c13.3 0 24-10.7 24-24V120c0-13.3-10.7-24-24-24H184c-13.3 0-24 10.7-24 24zm208-8c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H384c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H384c-8.8 0-16 7.2-16 16zM160 304c0 8.8 7.2 16 16 16H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16z"></path>
                                    </svg>
                                    <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">${t.nav.docs.changelogs.name}</span><span class="text-secondary lh-0">${t.nav.docs.changelogs.desc}</span></div>
                                </div>
                            </a></div>
                    </li>
                    <li class="nav-item dropdown auto-open animations-select"><a class="nav-link d-xxl-flex justify-content-xxl-center align-items-xxl-center" aria-expanded="false" data-bs-toggle="dropdown" href="#"><svg class="me-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                                <path d="M176 88v40H336V88c0-4.4-3.6-8-8-8H184c-4.4 0-8 3.6-8 8zm-48 40V88c0-30.9 25.1-56 56-56H328c30.9 0 56 25.1 56 56v40h28.1c12.7 0 24.9 5.1 33.9 14.1l51.9 51.9c9 9 14.1 21.2 14.1 33.9V304H384V288c0-17.7-14.3-32-32-32s-32 14.3-32 32v16H192V288c0-17.7-14.3-32-32-32s-32 14.3-32 32v16H0V227.9c0-12.7 5.1-24.9 14.1-33.9l51.9-51.9c9-9 21.2-14.1 33.9-14.1H128zM0 416V336H128v16c0 17.7 14.3 32 32 32s32-14.3 32-32V336H320v16c0 17.7 14.3 32 32 32s32-14.3 32-32V336H512v80c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64z"></path>
                            </svg>${t.nav.tools.title}<svg class="mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="-96 0 512 512" width="1em" height="1em" fill="currentColor">
                                <path d="M182.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8H288c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128z"></path>
                            </svg></a>
                        <div class="dropdown-menu shadow"><a class="dropdown-item d-flex justify-content-sm-start" href="${lang}/dices" rel="help" data-bs-target="https://rpg.arkanus.app">
                                <div class="d-flex justify-content-center align-items-center m-2"><svg class="fs-1 text-danger border rounded border-0 p-2 fme-2 d-none d-md-flex nav_icon_background me-2" xmlns="http://www.w3.org/2000/svg" viewBox="-32 0 512 512" width="1em" height="1em" fill="currentColor">
                                        <path d="M201 10.3c14.3-7.8 31.6-7.8 46 0L422.3 106c5.1 2.8 8.3 8.2 8.3 14s-3.2 11.2-8.3 14L231.7 238c-4.8 2.6-10.5 2.6-15.3 0L25.7 134c-5.1-2.8-8.3-8.2-8.3-14s3.2-11.2 8.3-14L201 10.3zM23.7 170l176 96c5.1 2.8 8.3 8.2 8.3 14V496c0 5.6-3 10.9-7.8 13.8s-10.9 3-15.8 .3L25 423.1C9.6 414.7 0 398.6 0 381V184c0-5.6 3-10.9 7.8-13.8s10.9-3 15.8-.3zm400.7 0c5-2.7 11-2.6 15.8 .3s7.8 8.1 7.8 13.8V381c0 17.6-9.6 33.7-25 42.1L263.7 510c-5 2.7-11 2.6-15.8-.3s-7.8-8.1-7.8-13.8V280c0-5.9 3.2-11.2 8.3-14l176-96z"></path>
                                    </svg>
                                    <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">${t.nav.dices.title}</span><span class="text-secondary lh-0">${t.nav.dices.desc}</span></div>
                                </div>
                            </a>
                            

                            <a class="dropdown-item d-flex justify-content-sm-start" href="${lang}/tools/names" rel="help" data-bs-target="${lang}/tools/names">
                                <div class="d-flex justify-content-center align-items-center m-2"><svg class="fs-1 text-primary border rounded border-0 p-2 me-2 d-none d-md-flex nav_icon_background" xmlns="http://www.w3.org/2000/svg" viewBox="0 -32 576 576" width="1em" height="1em" fill="currentColor">
                                        <path d="M368 32c41.7 0 75.9 31.8 79.7 72.5l85.6 26.3c25.4 7.8 42.8 31.3 42.8 57.9c0 21.8-11.7 41.9-30.7 52.7L400.8 323.5 493.3 416H544c17.7 0 32 14.3 32 32s-14.3 32-32 32H480c-8.5 0-16.6-3.4-22.6-9.4L346.9 360.2c11.7-36 3.2-77.1-25.4-105.7c-40.6-40.6-106.3-40.6-146.9-.1L101 324.4c-6.4 6.1-6.7 16.2-.6 22.6s16.2 6.6 22.6 .6l73.8-70.2 .1-.1 .1-.1c3.5-3.5 7.3-6.6 11.3-9.2c27.9-18.5 65.9-15.4 90.5 9.2c24.7 24.7 27.7 62.9 9 90.9c-2.6 3.8-5.6 7.5-9 10.9L261.8 416H352c17.7 0 32 14.3 32 32s-14.3 32-32 32H64c-35.3 0-64-28.7-64-64C0 249.6 127 112.9 289.3 97.5C296.2 60.2 328.8 32 368 32zm0 104a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"></path>
                                    </svg>
                                    <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">${t.nav.tools.names.title}</span><span class="text-secondary lh-0">${t.nav.tools.names.desc}</span></div>
                                </div>
                            </a><a class="dropdown-item d-flex justify-content-sm-start" href="${lang}/tools/tarot" rel="help">
                                <div class="d-flex justify-content-center align-items-center m-2"><svg class="fs-1 text-primary border rounded border-0 p-2 me-2 d-none d-md-flex nav_icon_background" xmlns="http://www.w3.org/2000/svg" viewBox="-64 0 512 512" width="1em" height="1em" fill="currentColor">
                                        <path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"></path>
                                    </svg>
                                    <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">${t.nav.tools.tarot.name}</span><span class="text-secondary lh-0">${t.nav.tools.tarot.desc}</span></div>
                                </div>
                            </a>
                            <a class="dropdown-item d-flex justify-content-sm-start" href="${lang}/tools/poker" rel="help">
                                <div class="d-flex justify-content-center align-items-center m-2"><svg class="fs-1 text-primary border rounded border-0 p-2 me-2 d-none d-md-flex nav_icon_background" xmlns="http://www.w3.org/2000/svg" viewBox="-64 0 512 512" width="1em" height="1em" fill="currentColor">
                                        <path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"></path>
                                    </svg>
                                    <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">${t.nav.tools.poker.name}</span><span class="text-secondary lh-0">${t.nav.tools.poker.desc}</span></div>
                                </div>
                            </a>
                            <a class="dropdown-item d-flex justify-content-sm-start" href="https://nutri.arkanus.app" rel="help" data-bs-target="https://nutri.arkanus.app">
                                <div class="d-flex justify-content-center align-items-center m-2"><svg class="fs-1 text-primary border rounded border-0 p-2 me-2 d-none d-md-flex nav_icon_background" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                                        <path d="M315.4 15.5C309.7 5.9 299.2 0 288 0s-21.7 5.9-27.4 15.5l-96 160c-5.9 9.9-6.1 22.2-.4 32.2s16.3 16.2 27.8 16.2H384c11.5 0 22.2-6.2 27.8-16.2s5.5-22.3-.4-32.2l-96-160zM288 312V456c0 22.1 17.9 40 40 40H472c22.1 0 40-17.9 40-40V312c0-22.1-17.9-40-40-40H328c-22.1 0-40 17.9-40 40zM128 512a128 128 0 1 0 0-256 128 128 0 1 0 0 256z"></path>
                                    </svg>
                                    <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">Ver todas as Ferramentas</span><span class="text-secondary">Tudo procura e mais um pouco.</span></div>
                                </div>
                            </a></div>
                    </li>
                    ${lang_selector(t, lang, rota)}
                </ul><a class="btn btn-primary fw-bold link-light border rounded border-0 d-lg-flex d-xxl-flex align-items-lg-center justify-content-xxl-center align-items-xxl-center px-3" role="button" href="https://www.instagram.com/direct/t/17847127176019261" target="_blank"><svg class="me-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 -32 576 576" width="1em" height="1em" fill="currentColor">
                        <path d="M309 106c11.4-7 19-19.7 19-34c0-22.1-17.9-40-40-40s-40 17.9-40 40c0 14.4 7.6 27 19 34L209.7 220.6c-9.1 18.2-32.7 23.4-48.6 10.7L72 160c5-6.7 8-15 8-24c0-22.1-17.9-40-40-40S0 113.9 0 136s17.9 40 40 40c.2 0 .5 0 .7 0L86.4 427.4c5.5 30.4 32 52.6 63 52.6H426.6c30.9 0 57.4-22.1 63-52.6L535.3 176c.2 0 .5 0 .7 0c22.1 0 40-17.9 40-40s-17.9-40-40-40s-40 17.9-40 40c0 9 3 17.3 8 24l-89.1 71.3c-15.9 12.7-39.5 7.5-48.6-10.7L309 106z"></path>
                    </svg>${t.nav.donate}</a>
            </div>
        </div>
    </nav>
</div>
`
}

function lang_selector(t, lang, rota) {
    return `
                        <li class="nav-item"><a class="nav-link d-xxl-flex justify-content-xxl-center align-items-xxl-center" href="${discord_invite}"><svg class="me-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 -64 640 640" width="1em" height="1em" fill="currentColor">
                                <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
                            </svg>${t.nav.support}</a></li>
                    <li class="nav-item auto-open dropdown"><a aria-label="${t.lang} Selected in Lang Selector" class="nav-link d-flex d-xxl-flex align-items-center justify-content-xxl-center align-items-xxl-center" aria-expanded="false" data-bs-toggle="dropdown" href="#"><img class="img-fluid me-1" src="${lang_FLAGS[t.lang]}" width="25" height="25" alt="${t.lang} Flag"/> <svg class="mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="-96 0 512 512" width="1em" height="1em" fill="currentColor">
                                <path d="M182.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8H288c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128z"></path>
                            </svg></a>
                        <div class="dropdown-menu shadow">
                            <a class="dropdown-item d-flex justify-content-xl-start align-items-xl-start" href="/pt${rota}" data-bs-target="https://rpg.arkanus.app"><span><img class="img-fluid me-2" src="/static/img/flags/br.svg" width="25" height="25" alt="Portuguese Lang selector"/>Português</span></a>
                            <a class="dropdown-item d-flex justify-content-xl-start align-items-xl-start" href="${rota}" data-bs-target="https://rpg.arkanus.app"><span><img class="img-fluid me-2" src="/static/img/flags/en.svg" width="25" height="25" alt="English Lang selector"/>English</span></a>
                            <a class="dropdown-item d-flex justify-content-xl-start align-items-xl-start" href="/es${rota}" data-bs-target="https://rpg.arkanus.app"><span><img class="img-fluid me-2" src="/static/img/flags/es.svg" width="25" height="25" alt="Spanish Lang selector" />Spanish</span></a>                            
                            <a class="dropdown-item d-flex justify-content-xl-start align-items-xl-start" href="/ru${rota}" data-bs-target="https://rpg.arkanus.app"><span><img class="img-fluid me-2" src="/static/img/flags/ru.svg" width="25" height="25" alt="Russian Lang selector"/>Russian</span></a></div>
                    </li>
                    `
}

function footer(t, rota) {
    
    let lang = idiomaR(t)
    rota = roteador(rota)
    return `<footer>
    <div class="container py-4 py-lg-5">
        <div class="row justify-content-center">
            <div class="col-sm-4 col-md-3 text-center text-lg-start d-flex flex-column item">
                <b class="fs-6 mb-0 pb-0">${t.footer.util} </b>
                <ul class="list-unstyled">
                    <li><a href="https://rpg.arkanus.app">${t.footer.start}</a></li>
                    <li><a href="https://rpg.arkanus.app/sitemap.xml">${t.footer.map}</a></li>
                    <li></li>
                </ul>
            </div>
            <div class="col-sm-4 col-md-3 text-center text-lg-start d-flex flex-column item">
                <b class="fs-6 mb-0 pb-0">${t.footer.about}</b>
                <ul class="list-unstyled">
                    <li><a href="https://arkanus.app/about">${t.footer.team}</a></li>
                    <li><a href="https://arkanus.app/about">${t.footer.quest}</a></li>
                    <li></li>
                </ul>
            </div> 
            <div class="col-sm-4 col-md-3 text-center text-lg-start d-flex flex-column item">
                <b class="fs-6 mb-0 pb-0">${t.footer.legal}</b>
                <ul class="list-unstyled">
                    <li><a href="${lang}/tos">${t.footer.tos}</a></li>
                    <li><a href="${lang}/privacy">${t.footer.priv}</a></li>
                    <li></li>
                </ul>
            </div>
            <div class="col-lg-3 text-center text-lg-start d-flex flex-column align-items-center order-first align-items-lg-start order-lg-last item social">
                <div class="fw-bold d-flex align-items-center"><img alt="Logo From Arkanus in White Color" width="30" height="30" loading="lazy" src="/static/img/icons/arkanus.svg" /><span class="ms-2">Powered by Arkanus</span></div>
                <p class="text-muted copyright">${t.footer.arkanus.desc}</p>
            </div>
        </div>
        <hr class="text-primary" />
        <div class="d-flex justify-content-between align-items-center pt-3">
            <p class="text-muted mb-0">Made by comunity for comunity</p>
            <ul class="list-inline mb-0">
                <li class="list-inline-item"><a aria-label="Fortuna Twitter Icon" title="twitter" alt="Twitter" href="https://twitter.com/MiniKrakenBOT"><svg class="text-primary" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                            <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
                        </svg></a></li>
                <li class="list-inline-item"><a aria-label="Fortuna Tiktok Link" title="Tiktok" alt="TikTok" href="https://www.tiktok.com/@minikrakenbot"><svg class="text-primary" xmlns="https://www.w3.org/2000/svg" viewBox="-32 0 512 512" width="1em" height="1em" fill="currentColor">
                            <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"></path>
                        </svg></a></li>
                <li class="list-inline-item"><a aria-label="Fortuna Instagram link" title="instagram" alt="Instagram" href="https://www.instagram.com/una_rpg/"><svg class="text-primary" xmlns="https://www.w3.org/2000/svg" viewBox="-32 0 512 512" width="1em" height="1em" fill="currentColor">
                            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                        </svg></a></li>
            </ul>
        </div>
    </div>
</footer>`
}

module.exports = {
    nav, footer
}