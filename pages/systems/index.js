const { nav, footer } = require('../../components/navbar');
const scripts = require('../../components/bootscripts');
const { head } = require('../../components/head');
const { sistemas_tags_asrray } = require('../index');

function systemCard(title, description, img, url, autoSheet) {
    let iconComponent = autoSheet
        ? `<div class="bg-secondary-subtle border rounded-circle border-0 position-absolute end-0 mt-3 me-3" title="Suporte a Fichas &amp; Rolagem Automática">
            <svg class="text-secondary p-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor" style="font-size: 32px;">
                <path d="M176 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64c-35.3 0-64 28.7-64 64H24c-13.3 0-24 10.7-24 24s10.7 24 24 24H64v56H24c-13.3 0-24 10.7-24 24s10.7 24 24 24H64v56H24c-13.3 0-24 10.7-24 24s10.7 24 24 24H64c0 35.3 28.7 64 64 64v40c0 13.3 10.7 24 24 24s24-10.7 24-24V448h56v40c0 13.3 10.7 24 24 24s24-10.7 24-24V448h56v40c0 13.3 10.7 24 24 24s24-10.7 24-24V448c35.3 0 64-28.7 64-64h40c13.3 0 24-10.7 24-24s-10.7-24-24-24H448V280h40c13.3 0 24-10.7 24-24s-10.7-24-24-24H448V176h40c13.3 0 24-10.7 24-24s-10.7-24-24-24H448c0-35.3-28.7-64-64-64V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H280V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H176V24zM160 128H352c17.7 0 32 14.3 32 32V352c0 17.7-14.3 32-32 32H160c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32zm192 32H160V352H352V160z"></path>
            </svg>
        </div>`
        : '';

    return `
        <div class="col d-flex">
            <div class="card w-100 d-flex flex-column shadow-lg border-1 p-3">
                ${iconComponent}
                <div class="card-body d-flex flex-column">
                    <a href="${url.replace("systems/","")}" class="link-unstyled">
                        <div class="bs-icon-xl d-flex justify-content-center align-items-center d-inline-block mb-2 bs-icon">
                            <img class="img-fluid user-select-none" alt="${title} Icon" src="${img}" />
                        </div>
                        <h4 class="card-title user-select-none text-primary">
                            ${title}
                        </h4>
                    </a>
                    <p class="card-text user-select-none flex-grow-1">${description}</p>
                </div>
            </div>
        </div>
    `;
}

function sistemList(t) {
    return `
    <section class="py-3">
        <div class="container">
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                ${Object.keys(t.posts.sistemas)
                    .map((key) => {
                        const sistema = t.posts.sistemas[key];
                        return systemCard(
                            sistema.card.title,
                            sistema.card.desc,
                            sistema.icon,
                            `./systems/${sistema.path}`,
                            sistemas_tags_asrray[key]
                        );
                    })
                    .join('')}
            </div>
        </div>
    </section>
    `;
}

function page(idioma, rota) {
    const t = idioma;

    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(
        `${t.lang}${rota}`,
        `${t.systems.title}`,
        t.systems.desc,
        "/assets/img/bg/newbg2.webp",
    )}
<body>
    ${nav(t, rota)}
    <div class="container">
        <h1 class="display-5 fw-bold mt-0">${t.systems.title}</h1>
        <p class="lead text-secondary">${t.systems.desc}</p>
    </div>
    ${sistemList(t)}
    ${footer(t, rota)}
    ${scripts}
</body>
</html>
`;
}

module.exports = {
    page
};
