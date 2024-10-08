const {discord_invite, bot_invite, url} = require('../config.json')
const {idiomaR, roteador} = require('../caminho')
function nav(t,rota) {

    let lang = idiomaR(t)
    rota = roteador(rota)

    return `
    <nav class="navbar navbar-expand-lg sticky-top bg-dark shadow">
    <div class="container-fluid"><a class="navbar-brand d-flex align-items-center" href="${lang}/"><img class="img-fluid pe-1" src="/static/img/icons/logo.svg" alt="Mini Kraken Bot" width="30px" height="30px" /><span class="m-1">Mini Kraken</span></a><button title="Open Dropdown" class="navbar-toggler border-0" data-bs-toggle="collapse" data-bs-target="#navcol"><span class="visually-hidden"></span><span class="navbar-toggler-icon text-primary"></span></button>
        <div id="navcol" class="collapse navbar-collapse justify-content-between">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item"><a class="nav-link" href="${lang}/#premium"><svg class="m-1" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                            <path d="M156.6 384.9L125.7 354c-8.5-8.5-11.5-20.8-7.7-32.2c3-8.9 7-20.5 11.8-33.8L24 288c-8.6 0-16.6-4.6-20.9-12.1s-4.2-16.7 .2-24.1l52.5-88.5c13-21.9 36.5-35.3 61.9-35.3l82.3 0c2.4-4 4.8-7.7 7.2-11.3C289.1-4.1 411.1-8.1 483.9 5.3c11.6 2.1 20.6 11.2 22.8 22.8c13.4 72.9 9.3 194.8-111.4 276.7c-3.5 2.4-7.3 4.8-11.3 7.2v82.3c0 25.4-13.4 49-35.3 61.9l-88.5 52.5c-7.4 4.4-16.6 4.5-24.1 .2s-12.1-12.2-12.1-20.9V380.8c-14.1 4.9-26.4 8.9-35.7 11.9c-11.2 3.6-23.4 .5-31.8-7.8zM384 168a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"></path>
                        </svg>Premium</a></li>
                <li class="nav-item dropdown"><a class="nav-link mouse-click-icon user-select-none" aria-expanded="false" data-bs-toggle="dropdown" data-bs-auto-close="outside"><svg class="m-1" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                            <path d="M512 256c0 .9 0 1.8 0 2.7c-.4 36.5-33.6 61.3-70.1 61.3H344c-26.5 0-48 21.5-48 48c0 3.4 .4 6.7 1 9.9c2.1 10.2 6.5 20 10.8 29.9c6.1 13.8 12.1 27.5 12.1 42c0 31.8-21.6 60.7-53.4 62c-3.5 .1-7 .2-10.6 .2C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm0-96a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 96a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"></path>
                        </svg>${t.nav.tools.title}<svg class="mb-2" xmlns="https://www.w3.org/2000/svg" viewBox="-96 0 512 512" width="1em" height="1em" fill="currentColor">
                            <path d="M182.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8H288c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128z"></path>
                        </svg></a>
                    <div class="dropdown-menu shadow"><a class="dropdown-item d-flex" href="${lang}/tools/names">
                            <div class="d-flex justify-content-center align-items-center mx-2"><svg class="bg-primary border rounded border-0 p-2 fs-2 me-2" xmlns="https://www.w3.org/2000/svg" viewBox="-32 0 512 512" width="1em" height="1em" fill="currentColor">
                                    <path d="M416 0c17.7 0 32 14.3 32 32c0 59.8-30.3 107.5-69.4 146.6c-28 28-62.5 53.5-97.3 77.4l-2.5 1.7c-11.9 8.1-23.8 16.1-35.5 23.9l0 0 0 0 0 0-1.6 1c-6 4-11.9 7.9-17.8 11.9c-20.9 14-40.8 27.7-59.3 41.5H283.3c-9.8-7.4-20.1-14.7-30.7-22.1l7-4.7 3-2c15.1-10.1 30.9-20.6 46.7-31.6c25 18.1 48.9 37.3 69.4 57.7C417.7 372.5 448 420.2 448 480c0 17.7-14.3 32-32 32s-32-14.3-32-32H64c0 17.7-14.3 32-32 32s-32-14.3-32-32c0-59.8 30.3-107.5 69.4-146.6c28-28 62.5-53.5 97.3-77.4c-34.8-23.9-69.3-49.3-97.3-77.4C30.3 139.5 0 91.8 0 32C0 14.3 14.3 0 32 0S64 14.3 64 32H384c0-17.7 14.3-32 32-32zM338.6 384H109.4c-10.1 10.6-18.6 21.3-25.5 32H364.1c-6.8-10.7-15.3-21.4-25.5-32zM109.4 128H338.6c10.1-10.7 18.6-21.3 25.5-32H83.9c6.8 10.7 15.3 21.3 25.5 32zm55.4 48c18.4 13.8 38.4 27.5 59.3 41.5c20.9-14 40.8-27.7 59.3-41.5H164.7z"></path>
                                </svg>
                                <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">${t.nav.tools.names.title}</span><span class="text-white">${t.nav.tools.names.desc} </span></div>
                            </div>
                        </a><a class="dropdown-item d-flex" href="${lang}/tools/poker">
                            <div class="d-flex justify-content-center align-items-center mx-2"><svg class="bg-primary border rounded border-0 p-2 fs-2 me-2" xmlns="https://www.w3.org/2000/svg" viewBox="25 0 640 512" width="1em" height="1em" fill="currentColor">
                                    <path d="M7.5 194.9c-15.4-26.6-6.3-60.7 20.4-76.1L220.7 7.5c26.6-15.4 60.7-6.3 76.1 20.4l167 289.3c15.4 26.6 6.2 60.7-20.4 76.1L250.5 504.5c-26.6 15.4-60.7 6.2-76.1-20.4L7.5 194.9zM197 159.6c-11.1-3-22.6 3.6-25.6 14.8l-7.2 26.9-20.4 76.1c-7 26 8.5 52.7 34.4 59.7s52.7-8.5 59.7-34.4l2.4-8.8c.1-.4 .2-.8 .3-1.1l17.7 30.7-12.1 7c-6.7 3.8-8.9 12.4-5.1 19s12.4 8.9 19 5.1l48.2-27.8c6.7-3.8 8.9-12.4 5.1-19s-12.4-8.9-19-5.1l-12.1 7-17.7-30.7c.4 .1 .8 .2 1.1 .3l8.8 2.4c26 7 52.7-8.5 59.7-34.4s-8.5-52.7-34.4-59.7l-76.1-20.4L197 159.6zM459.4 420.9c41.9-24.2 56.3-77.8 32.1-119.8L354.7 64.2c1.7-.2 3.5-.2 5.3-.2H584c30.9 0 56 25.1 56 56V456c0 30.9-25.1 56-56 56H360c-13.7 0-26.2-4.9-35.9-13l135.3-78.1zm74.5-183.3L582 187.6c14-14.5 13.2-38.5-2.2-51.9c-14-11.7-34.5-9.5-46.9 3.2l-4.7 5.2-5-5.2c-12.5-12.7-33.2-15-46.7-3.2c-15.7 13.5-16.5 37.5-2.5 51.9l48.4 49.9c3 3.2 8.2 3.2 11.5 0z"></path>
                                </svg>
                                <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">${t.nav.tools.poker.name}</span><span class="text-white">${t.nav.tools.poker.desc}</span></div>
                            </div>
                        </a><a class="dropdown-item d-flex" href="${lang}/tools/tarot">
                            <div class="d-flex justify-content-center align-items-center mx-2"><svg class="bg-primary border rounded border-0 p-2 fs-2 me-2" xmlns="https://www.w3.org/2000/svg" viewBox="-50 0 512 512" width="1em" height="1em" fill="currentColor">
                                    <path d="M0 64C0 28.7 28.7 0 64 0H320c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm180.7 84.7l-96 96c-6.2 6.2-6.2 16.4 0 22.6l96 96c6.2 6.2 16.4 6.2 22.6 0l96-96c6.2-6.2 6.2-16.4 0-22.6l-96-96c-6.2-6.2-16.4-6.2-22.6 0z"></path>
                                </svg>
                                <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-5">${t.nav.tools.tarot.name}</span><span class="text-white">${t.nav.tools.tarot.desc}</span></div>
                            </div>
                        </a></div>
                </li>
                <li class="nav-item dropdown"><a class="nav-link mouse-click-icon user-select-none" aria-expanded="false" data-bs-toggle="dropdown" data-bs-auto-close="outside"><svg class="m-1" xmlns="https://www.w3.org/2000/svg" viewBox="-32 0 512 512" width="1em" height="1em" fill="currentColor">
                            <path d="M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z"></path>
                        </svg>${t.nav.docs.title}<svg class="mb-2" xmlns="https://www.w3.org/2000/svg" viewBox="-96 0 512 512" width="1em" height="1em" fill="currentColor">
                            <path d="M182.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8H288c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128z"></path>
                        </svg></a>
                    <div class="dropdown-menu shadow">
                      <a class="dropdown-item d-flex justify-content-sm-start" href="https://dice-roller.github.io/documentation/guide/notation/dice" target="_blank">
                            <div class="d-flex justify-content-center align-items-center"><svg class="bg-primary border rounded border-0 p-2 fs-2 me-2" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                                    <path d="M48.7 125.8l53.2 31.9c7.8 4.7 17.8 2 22.2-5.9L201.6 12.1c3-5.4-.9-12.1-7.1-12.1c-1.6 0-3.2 .5-4.6 1.4L47.9 98.8c-9.6 6.6-9.2 20.9 .8 26.9zM16 171.7V295.3c0 8 10.4 11 14.7 4.4l60-92c5-7.6 2.6-17.8-5.2-22.5L40.2 158C29.6 151.6 16 159.3 16 171.7zM310.4 12.1l77.6 139.6c4.4 7.9 14.5 10.6 22.2 5.9l53.2-31.9c10-6 10.4-20.3 .8-26.9L322.1 1.4c-1.4-.9-3-1.4-4.6-1.4c-6.2 0-10.1 6.7-7.1 12.1zM496 171.7c0-12.4-13.6-20.1-24.2-13.7l-45.3 27.2c-7.8 4.7-10.1 14.9-5.2 22.5l60 92c4.3 6.7 14.7 3.6 14.7-4.4V171.7zm-49.3 246L286.1 436.6c-8.1 .9-14.1 7.8-14.1 15.9v52.8c0 3.7 3 6.8 6.8 6.8c.8 0 1.6-.1 2.4-.4l172.7-64c6.1-2.2 10.1-8 10.1-14.5c0-9.3-8.1-16.5-17.3-15.4zM233.2 512c3.7 0 6.8-3 6.8-6.8V452.6c0-8.1-6.1-14.9-14.1-15.9l-160.6-19c-9.2-1.1-17.3 6.1-17.3 15.4c0 6.5 4 12.3 10.1 14.5l172.7 64c.8 .3 1.6 .4 2.4 .4zM41.7 382.9l170.9 20.2c7.8 .9 13.4-7.5 9.5-14.3l-85.7-150c-5.9-10.4-20.7-10.8-27.3-.8L30.2 358.2c-6.5 9.9-.3 23.3 11.5 24.7zm439.6-24.8L402.9 238.1c-6.5-10-21.4-9.6-27.3 .8L290.2 388.5c-3.9 6.8 1.6 15.2 9.5 14.3l170.1-20c11.8-1.4 18-14.7 11.5-24.6zm-216.9 11l78.4-137.2c6.1-10.7-1.6-23.9-13.9-23.9H183.1c-12.3 0-20 13.3-13.9 23.9l78.4 137.2c3.7 6.4 13 6.4 16.7 0zM174.4 176H337.6c12.2 0 19.9-13.1 14-23.8l-80-144c-2.8-5.1-8.2-8.2-14-8.2h-3.2c-5.8 0-11.2 3.2-14 8.2l-80 144c-5.9 10.7 1.8 23.8 14 23.8z"></path>
                                </svg>
                                <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-6">${t.nav.docs.dices.names}</span><span class="text-white nav-drop-text">${t.nav.docs.dices.desc}</span></div>
                            </div>
                        </a><a class="dropdown-item d-flex justify-content-sm-start" href="${lang}/commands">
                            <div class="d-flex justify-content-center align-items-center"><svg class="bg-primary border rounded border-0 p-2 fs-2 me-2" xmlns="https://www.w3.org/2000/svg" viewBox="0 -64 640 640" width="1em" height="1em" fill="currentColor">
                                    <path d="M32 119.4C12.9 108.4 0 87.7 0 64C0 28.7 28.7 0 64 0c23.7 0 44.4 12.9 55.4 32H328.6C339.6 12.9 360.3 0 384 0c35.3 0 64 28.7 64 64c0 23.7-12.9 44.4-32 55.4V232.6c19.1 11.1 32 31.7 32 55.4c0 35.3-28.7 64-64 64c-23.7 0-44.4-12.9-55.4-32H119.4c-11.1 19.1-31.7 32-55.4 32c-35.3 0-64-28.7-64-64c0-23.7 12.9-44.4 32-55.4V119.4zM119.4 96c-5.6 9.7-13.7 17.8-23.4 23.4V232.6c9.7 5.6 17.8 13.7 23.4 23.4H328.6c5.6-9.7 13.7-17.8 23.4-23.4V119.4c-9.7-5.6-17.8-13.7-23.4-23.4H119.4zm192 384c-11.1 19.1-31.7 32-55.4 32c-35.3 0-64-28.7-64-64c0-23.7 12.9-44.4 32-55.4V352h64v40.6c9.7 5.6 17.8 13.7 23.4 23.4H520.6c5.6-9.7 13.7-17.8 23.4-23.4V279.4c-9.7-5.6-17.8-13.7-23.4-23.4h-46c-5.4-15.4-14.6-28.9-26.5-39.6V192h72.6c11.1-19.1 31.7-32 55.4-32c35.3 0 64 28.7 64 64c0 23.7-12.9 44.4-32 55.4V392.6c19.1 11.1 32 31.7 32 55.4c0 35.3-28.7 64-64 64c-23.7 0-44.4-12.9-55.4-32H311.4z"></path>
                                </svg>
                                <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-6">${t.nav.docs.cmds.title}</span><span class="text-white nav-drop-text">${t.nav.docs.cmds.docs}</span></div>
                            </div>
                        </a>
                        <div class="dropdown-divider"></div><a class="dropdown-item d-flex justify-content-sm-start" href="${lang}/changelog">
                            <div class="d-flex justify-content-center align-items-center"><svg class="bg-primary border rounded border-0 p-2 fs-2 me-2" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                                    <path d="M96 96c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H80c-44.2 0-80-35.8-80-80V128c0-17.7 14.3-32 32-32s32 14.3 32 32V400c0 8.8 7.2 16 16 16s16-7.2 16-16V96zm64 24v80c0 13.3 10.7 24 24 24H296c13.3 0 24-10.7 24-24V120c0-13.3-10.7-24-24-24H184c-13.3 0-24 10.7-24 24zm208-8c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H384c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H384c-8.8 0-16 7.2-16 16zM160 304c0 8.8 7.2 16 16 16H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16z"></path>
                                </svg>
                                <div class="d-flex flex-column"><span class="focus-ring focus-ring-primary fs-6">${t.nav.docs.changelogs.name}</span><span class="text-white nav-drop-text">${t.nav.docs.changelogs.desc}</span></div>
                            </div>
                        </a>
                    </div>
                </li>
                <li class="nav-item d-none"><a class="nav-link mouse-click-icon user-select-none" ><svg class="m-1" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                            <path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"></path>
                        </svg>Blog</a></li>
                <li class="nav-item"><a class="nav-link" href="${discord_invite}" target="_blank" rel="external"><svg class="m-1" xmlns="https://www.w3.org/2000/svg" viewBox="0 -64 640 640" width="1em" height="1em" fill="currentColor">
                            <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
                        </svg>Discord</a></li>
            </ul>
            <ul class="navbar-nav ms-auto">
                <li class="nav-item dropdown"><a class="dropdown-toggle nav-link me-1 mouse-click-icon user-select-none" aria-expanded="false" data-bs-toggle="dropdown">${t.nav.lang.title}<svg class="ms-1" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
                            <path d="M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z"></path>
                        </svg></a>
                    <div class="dropdown-menu dropdown-menu-end">
                    <a class="dropdown-item" href="${rota}" rel="alternate"><img alt="English Lang Selector" class="img-fluid m-1 me-2" src="/static/img/flags/en.svg" width="25px" />English</a>
                    <a class="dropdown-item" href="/pt${rota}" rel="alternate"><img alt="Portuguese Lang Selector" class="img-fluid m-1 me-2" src="/static/img/flags/br.svg" width="25px" />Português</a>
                    </div>
                </li>
                <li class="nav-item"><a class="btn btn-primary fw-bold link-light border-0" role="button" href="${bot_invite}" target="_blank" rel="external">${t.nav.add}</a></li>
            </ul>
        </div>
    </div>
</nav>`
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
                    <li><a href="https://arkanus.app/team">${t.footer.team}</a></li>
                    <li><a href="https://arkanus.app/quest">${t.footer.quest}</a></li>
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
                <div class="fw-bold d-flex align-items-center"><img alt="Logo From Arkanus in White Color" width="30" height="30" src="/static/img/icons/arkanus.svg" /><span class="ms-2">Powered by Arkanus</span></div>
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