
function initDiceRoll() {
    const audio = new Audio('/audio/dice.webm');
    let lastResultDiv = null;
    let removeTimeout = null;

    const button = document.getElementById('diceRoll');
    const input = document.getElementById('diceString');

    if (!button || !input) return;

    // Remove existing event listeners to avoid duplicates
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);

    function getData() {
        // @ts-ignore
        if (typeof diceRoller === 'undefined' || !diceRoller) {
            console.error('diceRoller is not initialized yet');
            return;
        }

        const diceString = newInput.value;
        const formatedDiceString = formateDiceNotation(diceString);

        try {
            // @ts-ignore
            const result = diceRoller.roll(formatedDiceString);
            audio.play();
            if (lastResultDiv) {
                lastResultDiv.remove();
            }

            const div = document.createElement('div');
            div.innerHTML = `
            <div class="alert alert-primary alert-dismissible fade show custom-alert" role="alert">
                <strong>${result.output}</strong>
            </div>
            `;
            document.body.prepend(div);

            lastResultDiv = div;

            if (removeTimeout) {
                clearTimeout(removeTimeout);
            }

            removeTimeout = setTimeout(() => {
                div.remove();
                lastResultDiv = null;
                removeTimeout = null;
            }, 5000);
        } catch (error) {
            console.error(error);
            if (lastResultDiv) {
                lastResultDiv.remove();
            }

            const div = document.createElement('div');
            div.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show custom-alert" role="alert">
                <strong>Sintax Error</strong>
            </div>
            `;
            document.body.prepend(div);

            lastResultDiv = div;

            if (removeTimeout) {
                clearTimeout(removeTimeout);
            }

            removeTimeout = setTimeout(() => {
                div.remove();
                lastResultDiv = null;
                removeTimeout = null;
            }, 5000);
        }
    }

    function formateDiceNotation(dice_notation) {
        dice_notation = dice_notation.replace(/\bd\b/g, "d20");
        dice_notation = dice_notation.replace(/(\d)d\b/g, "$1d20");
        dice_notation = dice_notation.replace(/\bf(?!%)/g, "4dF");
        dice_notation = dice_notation.replace(/(\d)f/g, "dF");
        dice_notation = dice_notation.replace(/df/g, "dF");
        dice_notation = dice_notation.replace(/ei/g, "!");
        dice_notation = dice_notation.replace(/!(\d)/g, "!>=$1");
        dice_notation = dice_notation.replace(/km/g, "kl");
        dice_notation = dice_notation.replace(/kl(?!\d)/g, "kl1");
        dice_notation = dice_notation.replace(/k(?![\d|l])/g, "k1");
        return dice_notation;
    }

    newInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            getData();
        }
    });

    newButton.addEventListener('click', getData);
}

// Auto-init on script load
initDiceRoll();
window.initDiceRoll = initDiceRoll;
