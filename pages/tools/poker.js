const {nav, footer} = require('../../components/navbar')
const scripts = require('../../components/bootscripts')
const {head} = require('../../components/head')

function page(idioma, rota) {
    const t = idioma
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.poker.title}`)}
<body>
    ${nav(t, rota)}

    <section class="d-lg-flex justify-content-lg-center my-5">
        <div class="container">
            <div class="row g-0">
                <div class="col-md-6 order-first order-md-last p-5 pt-2 pb-0"><img class="rounded img-fluid w-100 h-100 fit-cover CardPoker" id="cardshow" src="https://apis.arkanus.app/poker-card/2/10.webp" loading="auto" alt="Carta de baralho aleatoria"></div>
                <div class="col d-flex justify-content-center align-items-center align-content-center order-last">
                    <div class="text-white">
                        <h1 class="fw-bold text-white">${t.poker.article.title}</h1>
                        <p>${t.poker.article.desc}</p>
                        <div class="d-lg-flex d-xl-flex justify-content-lg-start align-items-lg-center justify-content-xl-start align-items-xl-center"><button class="btn btn-primary btn-lg link-light m-2" id="cardsrun" type="button">Gerar Carta</button><select class="border rounded form-select-lg m-2 p-2" id="cardstype" name="card">
                                <option value="random" selected="">${t.poker.cards.type[0]}</option>
                                <option value="0">${t.poker.cards.type[1]} (♠)</option>
                                <option value="1">${t.poker.cards.type[2]} (♣)</option>
                                <option value="2">${t.poker.cards.type[3]} (♥)</option>
                                <option value="3">${t.poker.cards.type[4]} (♦)</option>
                            </select></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    ${footer(t,rota)}
    ${scripts}
    <script>
    document.getElementById("cardsrun").onclick = card;
    //de play no audio da carta
    let audio = "/static/audio/play-card.mp3"
    function card() {
        let cardTypes = ["hearts", "diamonds", "clubs", "spades"];
        let a = document.getElementById("cardstype").value ?? 0;
        if (a === "random") {
            a = Math.floor(4 * Math.random());
        }
        var audioElement = new Audio(audio);
        audioElement.volume = 0.5
        audioElement.play();
        var cardNumber = Math.floor(13 * Math.random()) + 1;
        var cardimg = \`https://apis.arkanus.app/poker-card/\${a}/\${cardNumber}.webp\`;
        var cardElement = document.getElementById("cardshow");
        cardElement.src = cardimg;
        cardElement.classList.add('flip');
        setTimeout(() => {
            cardElement.classList.remove('flip');
        }, 1000);
    }
    </script>
</body>
</html>
`
}

module.exports = {
    page
}