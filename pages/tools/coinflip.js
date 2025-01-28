const {nav, footer} = require('../../components/navbar')
const scripts = require('../../components/bootscripts')
const {head} = require('../../components/head')

function page(idioma, rota) {
    const t = idioma
    return `
  <!DOCTYPE html>
  <html lang="${t.lang}" data-bs-theme="dark">
  ${head(`${t.lang}${rota}`,`${t.flip_coin.title}`,`${t.flip_coin.seo}`)}
    <style>
    .coin {
      width: 100px;
      height: 100px;
      position: relative;
      perspective: 1000px;
      transform-style: preserve-3d;
      transition: transform 1s;
      cursor: pointer;
    }

    .coin.animate {
      transform: scale(0);
      animation: growIn 0.3s forwards;
    }

    .coin .side {
      width: 100%;
      height: 100%;
      position: absolute;
      backface-visibility: hidden;
      border-radius: 50%;
      transition: transform 0.6s ease-in-out;
    }

    .coin .front {
      background-image: url('/static/img/geradores/coin/cara.webp'); /* Replace with coin front image */
      background-size: cover;
      transform: rotateY(0deg);
    }

    .coin .back {
      background-image: url('/static/img/geradores/coin/coroa.webp');
      background-size: cover;
      transform: rotateY(180deg);
    }

    .spinning {
      animation: spin 1s ease-in-out;
    }

    .coin.spinning {
      pointer-events: none;
    }

    @keyframes spin {
      0% { transform: rotateY(0deg); }
      50% { transform: rotateY(180deg); }
      100% { transform: rotateY(360deg); }
    }

    @keyframes growIn {
      to { transform: scale(1); }
    }

    @keyframes shrinkOut {
      to { transform: scale(0); }
    }

    .button-container {
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    </style>
  <body>

    ${nav(t, rota)}

    <section class="justify-content-lg-center pt-2 mt-3 mb-4">
      <div class="container align-items-center">
      <div>
            <div class="text-white">
            <h1 class="fw-bold text-white mb-3">${t.flip_coin.title}</h1>
            <p class="mb-4 text-secondary">${t.flip_coin.desc}</p>
            </div>
      </div>
      
    <div id="coins-container" class="d-flex flex-wrap justify-content-center gap-2">
      <div class="coin" onclick="flipCoin(this)">
      <div class="side front"></div>
      <div class="side back"></div>
      </div>
    </div>
    <div class="button-container mt-3">
      <button class="btn btn-primary" onclick="rerollAll()">${t.flip_coin.btn}</button>
    </div>
    <div class="button-container stack-controls mt-3">
      <button class="btn btn-secondary" onclick="decreaseStack()">-</button>
       <input type="number" disabled id="stack-size" class="form-control d-inline-block w-auto" value="1" min="1" max="24" onchange="setStackSize()">
      <button class="btn btn-secondary" onclick="increaseStack()">+</button>
    </div>
      </div>
    </section>
    ${footer(t,rota)}
    ${scripts}
    <script src="/static/js/coin_flip.js"></script>
  </body>
  </html>
  `
}

module.exports = {
    page
}