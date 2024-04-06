const {nav, footer} = require('../../components/navbar')
const scripts = require('../../components/bootscripts')
const {head} = require('../../components/head')

function page(idioma, rota) {
    const t = idioma
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`,`${t.tarot.title}`)}
<body>
    ${nav(t, rota)}

    <section class="justify-content-lg-center pt-2 mt-4 mb-4">
        <div class="container">
            <div class="row g-0 d-flex d-md-flex justify-content-center justify-content-md-center">
                <div class="col-10 col-md-5 order-first order-md-last"><img class="rounded img-fluid w-100 h-100 fit-cover CardPoker" id="cardshow" src="https://apis.arkanus.app/tarot-card/22.webp" loading="auto" alt="Carta de Tarot aleatoria"></div>
                <div class="col-12 col-md-7 d-flex justify-content-center align-items-center align-content-center order-last p-4">
                    <div class="text-white">
                        <h1 class="fw-bold text-white">${t.tarot.article.title}</h1>
                        <p>${t.tarot.article.desc}</p>
                        <div class="d-lg-flex d-xl-flex justify-content-lg-start align-items-lg-center justify-content-xl-start align-items-xl-center"><button class="btn btn-primary btn-lg link-light m-2 ms-0" id="cardsrun" type="button">${t.misc.btn.gencard}</button></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    ${footer(t,rota)}
    ${scripts}
    <script>
    const audio = "/static/audio/play-card.mp3"
        const cardsrun = document.getElementById('cardsrun');
        const cardshow = document.getElementById('cardshow');
        cardsrun.addEventListener('click', async () => {
            let audioElement = new Audio(audio);
            audioElement.volume = 0.5
            audioElement.play();
            const randomCard = Math.floor(Math.random() * 22);
            cardshow.src = 'https://apis.arkanus.app/tarot-card/' + randomCard + '.webp';
            cardshow.classList.add('flip');
            setTimeout(() => cardshow.classList.remove('flip'), 1000);
        }); 
    </script>
</body>
</html>
`
}

module.exports = {
    page
}