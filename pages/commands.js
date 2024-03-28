const {nav, footer} = require('../components/navbar')
const scripts = require('../components/bootscripts')
const {head} = require('../components/head')
let cmds = require('../data/cmds.json')
const commands = cmds.cmds

function replaceText(text) {
    text = text.replace(/\n/g, '<br />');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/@(\w+)/g, '<span class="text-primary">@$1</span>');
    text = text.replace(/`(.*?)`/g, '<span class="text-bg-primary">$1</span>');
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    return text;
}

function GenerateCard(name, description, params, lang) {
    let paramsSpans = '';
    let paramsDescriptions = '';
    if (params) {
        paramsSpans = params.map(param => {
            let paramName = param.name[lang];
            if (paramName.startsWith('?')) {
                paramName = paramName.slice(1) + ' (opcional)';
            }
            return `
                <span class="badge rounded-pill bg-primary text-center d-flex d-xxl-flex justify-content-center align-items-center justify-content-xxl-center me-1">
                    <span style="color: rgb(238, 238, 238);">${paramName}</span>
                </span>
            `;
        }).join('');
        paramsDescriptions = params.map(param => {
            let paramName = param.name[lang];
            if (paramName.startsWith('?')) {
                paramName = paramName.slice(1) + ' (opcional)';
            }
            return `🞄 ${paramName}: ${replaceText(param.description[lang])}<br />`;
        }).join('');
    }
    return `
        <div class="col mt-1 mb-1">
            <div class="card border-primary border-1 shadow-none">
                <div class="card-body border-secondary">
                    <div class="d-flex align-items-center align-content-center flex-wrap">
                        <h3 class="text-light d-inline-block pt-2 me-2">/${name[lang]}</h3>
                        ${paramsSpans}
                    </div>
                    <p class="card-text">${replaceText(description[lang])}<br /><br />${paramsDescriptions}</p>
                </div>
            </div>
        </div>
    `;
}

function GenerateCards(cmds, lang) {
    let cards = cmds.map(cmd => GenerateCard(cmd.name, cmd.description, cmd.params, lang)).join('');
    return cards
}

function OrdenarComandosOrdemAlfabetica(commands, lang) {
    commands.sort((a, b) => {
        if (a.name[lang] < b.name[lang]) {
            return -1;
        }
        if (a.name[lang] > b.name[lang]) {
            return 1;
        }
        return 0;
    });

    return commands;
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
${head(`${t.lang}${rota}`,`${t.cmds.title}`)}
<body>
    ${nav(t, rota)}
    <section>
    <div class="container-fluid pt-5">
        <div class="row flex-column justify-content-center align-items-center">
            <div class="col-9 col-sm-10 col-md-10 col-lg-10 col-xl-11 col-xxl-10 offset-0 offset-sm-0 offset-md-0 offset-lg-0 offset-xl-0 d-block">
                <div id="cards" class="row g-0 row-cols-1">
                ${GenerateCards(OrdenarComandosOrdemAlfabetica(commands,idiomaUpdates), idiomaUpdates)}
                </div>
            </div>
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