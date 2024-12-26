const {nav, footer} = require('../components/navbar')
const scripts = require('../components/bootscripts')
const {head} = require('../components/head')
function Formatador(string) {
    let regex
    string = string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    //todos os operadores matemáticos devem ficar primary + - * / % 
    regex = /([+*%\/-])/g
    string = string.replace(regex, `<span class="text-primary">$1</span>`);

    //todo numero seguido de um numero ou operador mateatico deve ficar amarelo
    regex = /(\d+)([+*\/-])(\d+)/g
    string = string.replace(regex, `<span class="text-warning">$1</span>$2<span class="text-warning">$3</span>`)    

    //todos os itens dentro de {} devem ficar verdes
    regex = /({)(.*?)(})/g
    string = string.replace(regex, `<span class="text-success">$1$2$3</span>`)


    // toda letra d antes, depois ou entre dois números deve ficar azul
    regex = /(\d+)([d])(\d+)/g
    string = string.replace(regex, `<span class="text-danger">$1</span><span class="text-secondary">$2</span><span class="text-warning">$3</span>`);

    regex = /([d])(\d+)/g
    string = string.replace(regex, `<span class="text-danger">$1</span><span class="text-warning">$2</span>`);

    regex = /(\d+)([d])/g
    string = string.replace(regex, `<span class="text-danger">$1</span><span class="text-secondary">$2</span>`);

    //todo d seguido de : 
    regex = /([d])(:)/g
    string = string.replace(regex, `<span class="text-secondary">$1</span><span class="text-warning">$2</span>`);

    //todo e & ei seguidos de : devem ficar vermelhos
    regex = /(e)(:)/g
    string = string.replace(regex, `<span class="text-danger">$1</span>`);
    regex = /(ei)(:)/g
    string = string.replace(regex, `<span class="text-danger">$1</span>`);

    //todo ei seguido de um número deve ficar vermelho
    regex = /(ei)(\d+)/g
    string = string.replace(regex, `<span class="text-danger">$1</span>`);
    //todo e seguido de um número deve ficar vermelho
    regex = /(e)(\d+)/g
    string = string.replace(regex, `<span class="text-danger">$1</span>`);
    
        //todo texto dentro de **ata** deve ficar em negrito
        regex = /(\_)(.*?)(\_)/g
        string = string.replace(regex, `<strong class="text-primary fw-bold">$2</strong>`)
    
    //todo \n deve ser substituido por <br>
    string = string.replace(/\n/g, "<br>")

    return string
}

function page(idioma, rota) {
    const t = idioma
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,t.dices.title,t.dices.desc)}
<body>
    <script src="https://unpkg.com/mathjs@11.8.2/lib/browser/math.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/random-js@2.1.0/dist/random-js.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@dice-roller/rpg-dice-roller/lib/umd/bundle.min.js"></script>
    <script>
    var diceRoller = new rpgDiceRoller.DiceRoller();
    </script>

    ${nav(t, rota)}


<section>
    <div class="container">
        <div class="row mt-5 m-1">
            <div>
                <h1 class="display-5 fw-bold mt-0">${t.dices.page.title1}</h1>
                <p class="lead text-secondary">${t.dices.page.desc}</p>
                <div class="input-group input-group-lg">
                    <input id="diceString" class="form-control" type="text" placeholder="5d20+3" name="dice" />
                    <button id="diceRoll" class="btn btn-primary d-xl-flex align-items-xl-center" type="button">
                        <svg class="me-2" xmlns="http://www.w3.org/2000/svg" viewBox="-32 0 512 512" width="1em" height="1em" fill="currentColor">
                            <path d="M201 10.3c14.3-7.8 31.6-7.8 46 0L422.3 106c5.1 2.8 8.3 8.2 8.3 14s-3.2 11.2-8.3 14L231.7 238c-4.8 2.6-10.5 2.6-15.3 0L25.7 134c-5.1-2.8-8.3-8.2-8.3-14s3.2-11.2 8.3-14L201 10.3zM23.7 170l176 96c5.1 2.8 8.3 8.2 8.3 14V496c0 5.6-3 10.9-7.8 13.8s-10.9 3-15.8 .3L25 423.1C9.6 414.7 0 398.6 0 381V184c0-5.6 3-10.9 7.8-13.8s10.9-3 15.8-.3zm400.7 0c5-2.7 11-2.6 15.8 .3s7.8 8.1 7.8 13.8V381c0 17.6-9.6 33.7-25 42.1L263.7 510c-5 2.7-11 2.6-15.8-.3s-7.8-8.1-7.8-13.8V280c0-5.9 3.2-11.2 8.3-14l176-96z"></path>
                        </svg>
                        ${t.dices.page.btn}
                    </button>
                </div>
            </div>

                <h2 class="fw-bold mt-5">Documentação completa.</h2>
                <p class="lead text-secondary">${t.dices.page.link}</p>
            </div>
        </div>
    </div>
</section>

<div class="footer-spacer" style="flex-grow: 1;"></div>

    ${footer(t,rota)}
    ${scripts}
    <script src="/static/js/dice_roll.js"></script>
</body>
</html>
`
}

module.exports = {
    page
}