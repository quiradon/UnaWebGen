function flipCoin(coin) {
    coin.classList.add('spinning');

    setTimeout(() => {
      coin.classList.remove('spinning');
      const isHeads = Math.random() < 0.5;
      coin.style.transform = isHeads ? 'rotateY(0deg)' : 'rotateY(180deg)';
    }, 1000);
}

function addCoin() {
    const coinsContainer = document.getElementById('coins-container');
    if (coinsContainer.children.length >= 20) return; // Limite máximo de 20 moedas
    const newCoin = document.createElement('div');
    newCoin.className = 'coin animate';
    newCoin.onclick = () => flipCoin(newCoin);
    newCoin.innerHTML = `
      <div class="side front"></div>
      <div class="side back"></div>
    `;
    coinsContainer.appendChild(newCoin);
    setTimeout(() => {
        newCoin.classList.remove('animate'); // Remover a classe de animação após a animação de entrada
        flipCoin(newCoin); // Make the new coin flip immediately
    }, 300); // Tempo da animação de growIn
    updateStackSize();
}

function removeCoin() {
    const coinsContainer = document.getElementById('coins-container');
    if (coinsContainer.children.length > 0) {
        const lastCoin = coinsContainer.lastChild;
        lastCoin.classList.remove('animate');
        lastCoin.style.animation = 'shrinkOut 0.3s forwards';
        setTimeout(() => {
            coinsContainer.removeChild(lastCoin);
            updateStackSize();
        }, 300); // Tempo da animação de shrinkOut
    }
}

function rerollAll() {
    document.querySelectorAll('.coin').forEach(coin => {
        flipCoin(coin);
    });
}

function clearCoins() {
    document.getElementById('coins-container').innerHTML = '';
    updateStackSize();
}

function updateStackSize() {
    const stackSizeInput = document.getElementById('stack-size');
    const coinsContainer = document.getElementById('coins-container');
    stackSizeInput.value = coinsContainer.children.length;
}

function increaseStack() {
    const stackSizeInput = document.getElementById('stack-size');
    if (parseInt(stackSizeInput.value) < 20) { // Limite máximo de 20 moedas
        stackSizeInput.value = parseInt(stackSizeInput.value) + 1;
        addCoin();
    }
}

function decreaseStack() {
    const stackSizeInput = document.getElementById('stack-size');
    if (stackSizeInput.value > 1) {
      stackSizeInput.value = parseInt(stackSizeInput.value) - 1;
      removeCoin();
    }
}

function setStackSize() {
    const stackSizeInput = document.getElementById('stack-size');
    let stackSize = parseInt(stackSizeInput.value);
    if (stackSize > 20) stackSize = 20; // Limite máximo de 20 moedas
    const coinsContainer = document.getElementById('coins-container');
    coinsContainer.innerHTML = '';
    for (let i = 0; i < stackSize; i++) {
        addCoin();
    }
}