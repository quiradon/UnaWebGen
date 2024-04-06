const {nav, footer} = require('../components/navbar')
const scripts = require('../components/bootscripts')
const {head} = require('../components/head')
const {blog, PlaceParagraphs, PlaceSmallParagraphs} = require('../components/blogpost')

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
    
    return string
}


function page(idioma, rota) {
    const t = idioma
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.dices.title}`)}
<body>
    ${nav(t, rota)}

    ${blog(t.dices.title,t.dices.tags,"/static/img/bg/space.webp",`
    ${PlaceParagraphs(t.tos[0].title,Formatador(t.dices.guide[0].desc))}
    <div class="row row-cols-1 row-cols-lg-2">
        ${PlaceParagraphs(t.dices.guide[1].title,Formatador(t.dices.guide[1].desc))}
        ${PlaceParagraphs(t.dices.guide[2].title,Formatador(t.dices.guide[2].desc))}
        ${PlaceParagraphs(t.dices.guide[3].title,Formatador(t.dices.guide[3].desc))}
        ${PlaceParagraphs(t.dices.guide[4].title,Formatador(t.dices.guide[4].desc))}
        ${PlaceParagraphs(t.dices.guide[5].title,Formatador(t.dices.guide[5].desc))}
        ${PlaceParagraphs(t.dices.guide[6].title,Formatador(t.dices.guide[6].desc))}
        ${PlaceParagraphs(t.dices.guide[7].title,Formatador(t.dices.guide[7].desc))}
    </div>
</div>

    `)}

    ${footer(t,rota)}
    ${scripts}
</body>
</html>
`
}

module.exports = {
    page
}