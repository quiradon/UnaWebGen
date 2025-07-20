const { nav, footer } = require("../components/navbar");
const scripts = require("../components/bootscripts");
const { head } = require("../components/head");

async function getCommands() {
    const url = "https://una-api.arkanus.app/commands";
    const response = await fetch(url);
    const data = await response.json();
    return data || [];
}

function replaceText(text) {
    if (!text) return "";
    text = text.replace(/\n/g, "<br />");
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/@(\w+)/g, '<span class="text-primary">@$1</span>');
    text = text.replace(/`(.*?)`/g, '<span class="text-bg-primary">$1</span>');
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    return text;
}

function formatName(cmd, lang) {
    return cmd.name_localizations ? (cmd.name_localizations[lang] ? cmd.name_localizations[lang] : cmd.name) : cmd.name;
}

function formatDescription(cmd, lang) {
    return cmd.description_localizations ? (cmd.description_localizations[lang] ? cmd.description_localizations[lang] : cmd.description) : cmd.description;
}

function GenerateCard(cmd, lang, parentName = "") {
    // Oculta o comando 'zdev'
    if (cmd.name === 'zdev') {
        return '';
    }

    let optionsSpans = "";
    let optionsDescriptions = "";
    let subCommandCards = "";

    if (cmd.options) {
        optionsSpans = cmd.options.map(option => {
            const optionName = formatName(option, lang);

            return `
                <span class="badge rounded-pill bg-primary text-center d-flex d-xxl-flex justify-content-center align-items-center justify-content-xxl-center me-1">
                    <span style="color: rgb(238, 238, 238);">${optionName}</span>
                </span>
            `;
        }).join("");

        optionsDescriptions = cmd.options.map(option => {
            const optionName = formatName(option, lang);
            const optionDescription = replaceText(formatDescription(option, lang));

            return `🞄 ${optionName}: ${optionDescription}<br />`;
        }).join("");

        subCommandCards = cmd.options.filter(option => option.type === 1 || option.type === 2).map(option => {
            return GenerateCard(option, lang, `${parentName} ${formatName(cmd, lang)}`);
        }).join("");
    }

    const name = formatName(cmd, lang);
    const description = replaceText(formatDescription(cmd, lang));
    const fullName = parentName ? `${parentName} ${name}` : `${name}`;

    // Verifica se é um comando final (não possui subcomandos do tipo 1 ou 2)
    const isFinalCommand = !cmd.options || cmd.options.every(option => option.type !== 1 && option.type !== 2);

    if (isFinalCommand) {
        return `
            <div class="col mt-1 mb-1">
                <div class="card border-primary border-1 shadow-none">
                    <div class="card-body border-secondary">
                        <div class="d-flex align-items-center align-content-center flex-wrap">
                            <h3 class="text-light d-inline-block pt-2 me-2">/${fullName.replace(" ","")}</h3>
                            ${optionsSpans}
                        </div>
                        <p class="card-text">${description}<br /><br />${optionsDescriptions}</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        return subCommandCards;
    }
}
function TitleAndSubtitle(title,paragraph) {
    paragraph = paragraph || ''
    paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<span class="text-primary">$1</span>')
    return `
            <div class="mb-1">
            <h1 class="display-5 fw-bold mt-0">${title}</h1>
            <p class="lead text-secondary ">${paragraph}</p>
        </div>
        `
}

async function page(language, route) {
    let lang = language.lang;
    let realLang = lang;
    if (lang === "pt") lang = "pt-BR";
    let commands = await getCommands();
    if (!Array.isArray(commands) || commands.length === 0) {
        commands = [];
    }
    const cards = commands.map(cmd => GenerateCard(cmd, lang)).join("");

    return `
    <!DOCTYPE html>
    <html lang="${realLang}" data-bs-theme="dark">
        ${head(`${realLang}${route}`, `${language.cmds.title}`, language.cmds.seo)}
        <body>
            ${nav(language, route)}
            <section>
                <div class="container-fluid pt-5">
                    <div class="row flex-column justify-content-center align-items-center">

                        
                        
                        <div class="col-9 col-sm-10 col-md-10 col-lg-10 col-xl-11 col-xxl-10 offset-0 offset-sm-0 offset-md-0 offset-lg-0 offset-xl-0 d-block">
                                ${TitleAndSubtitle(language.cmds.title, language.cmds.desc)}
                            <div id="cards" class="row g-0 row-cols-1">
                                ${cards}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            ${footer(language, route)}
            ${scripts}
        </body>
    </html>
    `;
}

module.exports = {
    page
}