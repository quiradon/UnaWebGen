const {nav, footer} = require('../../components/navbar')
const scripts = require('../../components/bootscripts')
const {head} = require('../../components/head')
const names = require('../../data/names.json')
listaNames = JSON.stringify(names)

function page(idioma, rota) {
    const t = idioma
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.names.article.title}`)}
<body>
    <style>
    .fade-in.delay-1 {animation-delay: 0.2s;}
    .fade-in.delay-2 {animation-delay: 0.4s;}
    .fade-in.delay-3 {animation-delay: 0.6s;}
    .fade-in.delay-4 {animation-delay: 0.8s;}
    .fade-in.delay-5 {animation-delay: 1s;}
    @keyframes fadeIn {
        0% {opacity: 0;}
        100% {opacity: 1;}
      }
      .fade-in {
        animation: fadeIn 1s;
        animation-fill-mode: both;
      }
    </style>
    ${nav(t, rota)}
    <section class="py-4 py-xl-5">
    <div class="container">
        <div class="row row-cols-md-2 d-flex flex-grow-1">
            <div class="col-auto col-sm-12 col-md-6 d-flex align-self-baseline order-first order-md-last"><img class="img-fluid d-flex" src="/static/img/misc/names_generate.webp" alt="Inanimalia Fortuna Mini Kraken gerador de nome de personagens" loading="auto" width="auto" /></div>
            <div class="col-md-6 col-xl-6 order-last mt-5">
                <div class="text-white">
                    <h1 class="fw-bold text-white mb-3">${t.names.article.title}</h1>
                    <p class="mb-4">${t.names.article.desc}</p>
                    <div class="custom-control custom-radio"><input id="customRadio1" class="custom-control-input form-check-input" type="radio" name="config" checked /><label class="form-label custom-control-label ms-1" for="customRadio1">Todos</label></div>
                    <div class="custom-control custom-radio"><input id="customRadio2" class="custom-control-input form-check-input" type="radio" name="config" xml:id="m" /><label class="form-label custom-control-label ms-1" for="customRadio2">Masculino</label></div>
                    <div class="custom-control custom-radio"><input id="customRadio3" class="custom-control-input form-check-input" type="radio" name="config" xml:id="f" /><label class="form-label custom-control-label ms-1" for="customRadio3">Feminino</label></div>
                </div>
                <div><button id="gerar" class="btn btn-primary link-light mt-2 mb-2" type="button">${t.names.article.btn}</button></div>
            </div>
        </div>
    </div>
    <div class="container">
    <div class="d-flex justify-content-center align-items-center">
    <span id="fake_load" class="d-none spinner-border text-primary mt-1" role="status"></span>
        </div>
        <div id="cardsList" class="row g-0 d-xl-flex justify-content-xl-center align-items-xl-center">
            </div>

        </div>
    </div>
</section>
    
    ${footer(t,rota)}
    ${scripts}
    <script>
    function copyToClipboard(text) {
        const el = document.createElement('textarea')
        el.value = text
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
    }
function genCard(name) {
    return \`
    <div class="card m-1">
    <div class="card-body">
        <div class="row">
            <div class="col-md-9 col-lg-10 col-xl-10 d-flex d-md-flex justify-content-center align-items-center justify-content-md-center align-items-md-center">
                <h4 class="text-primary d-flex flex-grow-1 justify-content-sm-center justify-content-lg-start mb-0">\${name}</h4>
            </div>
            <div class="col d-flex justify-content-center justify-content-sm-center align-items-sm-center justify-content-md-end"><button onclick="copyToClipboard('\${name}')" class="btn btn-primary d-flex justify-content-center align-items-center justify-content-xxl-center align-items-xxl-center mt-1" type="button"><svg class="me-1" xmlns="http://www.w3.org/2000/svg" viewBox="-32 0 512 512" width="1em" height="1em" fill="currentColor">
                        <path d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"></path>
                    </svg>${t.comum.copy}</button></div>
        </div>
    </div>
</div>\` 
}
const CardsList = document.getElementById("cardsList")
function showLoad(){document.getElementById("fake_load").classList.remove("d-none")}
function hideLoad(){document.getElementById("fake_load").classList.add("d-none")}
let names = ${listaNames}
function randomName(sex) {
    names.t = names.m.concat(names.f)
      const name = names[sex][Math.floor(Math.random() * names[sex].length)]
      const lastname = names.l[Math.floor(Math.random() * names.l.length)]
      return (\`\${name} \${lastname}\`)

}
function getType(){
    let type = document.querySelector('input[name="config"]:checked').id
    if(type == "customRadio2"){
        return "m"
    } else if(type == "customRadio3"){
        return "f"
    } else {
        return "t"
    }
}
const GenerateBtn = document.getElementById("gerar")
GenerateBtn.addEventListener("click", function(){
    CardsList.innerHTML = ""
    showLoad()
    for (let i = 0; i < 5; i++) {
        const card = genCard(randomName(getType()))
        const cardElement = document.createElement('div')
        cardElement.innerHTML = card
        cardElement.classList.add('fade-in')
        cardElement.classList.add('delay-' + (i + 1))
        CardsList.appendChild(cardElement)
    }
    setTimeout(() => {
        hideLoad()
    }, 500);
})
</script>
</body>
</html>
`
}
module.exports = {
    page
}