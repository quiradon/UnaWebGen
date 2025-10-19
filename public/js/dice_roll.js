
audio = new Audio('/audio/dice.webm');
//caso alguém aperte enter no input diceString chame a função getD 
let lastResultDiv = null;
let removeTimeout = null;

function getData() {

    const diceString = document.getElementById('diceString').value;
    const formatedDiceString = formateDiceNotation(diceString);

    try {
        const result = diceRoller.roll(formatedDiceString);
        audio.play();
        if (lastResultDiv) {
            lastResultDiv.remove();
        }

        // Cria um elemento para exibir o resultado
        const div = document.createElement('div');
        div.innerHTML = `
        <div class="alert alert-primary alert-dismissible fade show custom-alert" role="alert">
            <strong>${result.output}</strong>
        </div>
        `;
        document.body.prepend(div); // Adiciona o elemento no início do corpo do documento

        // Armazena a referência ao novo resultado
        lastResultDiv = div;

        // Limpa o temporizador anterior, se existir
        if (removeTimeout) {
            clearTimeout(removeTimeout);
        }

        // Define um novo temporizador para remover o elemento após 5 segundos
        removeTimeout = setTimeout(() => {
            div.remove();
            lastResultDiv = null; // Limpa a referência após a remoção
            removeTimeout = null; // Limpa o temporizador após a remoção
        }, 5000);
    } catch (error) {
        console.error(error);

        // Remove o último resultado, se existir
        if (lastResultDiv) {
            lastResultDiv.remove();
        }

        // Cria um elemento para exibir a mensagem de erro
        const div = document.createElement('div');
        div.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show custom-alert" role="alert">
            <strong>Sintax Error</strong>
        </div>
        `;
        document.body.prepend(div); // Adiciona o elemento no início do corpo do documento

        // Armazena a referência ao novo resultado
        lastResultDiv = div;

        // Limpa o temporizador anterior, se existir
        if (removeTimeout) {
            clearTimeout(removeTimeout);
        }

        // Define um novo temporizador para remover o elemento de erro após 5 segundos
        removeTimeout = setTimeout(() => {
            div.remove();
            lastResultDiv = null; // Limpa a referência após a remoção
            removeTimeout = null; // Limpa o temporizador após a remoção
        }, 5000);
    }
}
function formateDiceNotation(dice_notation) {
    // Caso exista uma letra d isolada ou seja sem nem um numero antes ou depois substitua por d20
    dice_notation = dice_notation.replace(/\bd\b/g, "d20");
    // Caso um d tenha um numero antes dele mas não tenha um numero depois substitua por d20
    dice_notation = dice_notation.replace(/(\d)d\b/g, "$1d20");
    // Caso Exista um f isolado que não possui um numero antes ou depois substitua por 4dF
    dice_notation = dice_notation.replace(/\bf(?!%)/g, "4dF");
    // caso exista um f que possui um numero antes ou depois substitua por dF
    dice_notation = dice_notation.replace(/(\d)f/g, "dF");
    // Substitua qualquer df por dF
    dice_notation = dice_notation.replace(/df/g, "dF");
    //Caso Exista algum "ei" substitua por !
    dice_notation = dice_notation.replace(/ei/g, "!");
    // Caso a Exclamação seja seguida de um numero substitua ! por !>=
    dice_notation = dice_notation.replace(/!(\d)/g, "!>=$1");
    // Substitua todos os km por kl
    dice_notation = dice_notation.replace(/km/g, "kl");
    //*substitua todo kl que não possui um numero depois por kl1
    // Substitua "kl" que não é seguido por um número por "kl1"
    dice_notation = dice_notation.replace(/kl(?!\d)/g, "kl1");
    //* Substitua todo k que não possui um número ou "l" depois por k1
    dice_notation = dice_notation.replace(/k(?![\d|l])/g, "k1");
    return dice_notation;
}


addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        getData();
    }
});
button = document.getElementById('diceRoll');
button.addEventListener('click', getData);