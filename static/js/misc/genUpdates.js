function createCard(version, text, img) {
    let card = document.createElement("div");
    card.classList.add("col");
    text = text.replace(/\n/g, '<br />');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/@(\w+)/g, '<span class="text-primary">@$1</span>');
    text = text.replace(/`(.*?)`/g, '<span class="text-bg-primary">$1</span>');
    card.innerHTML = `
        <div class="border rounded border-1 border-primary-subtle px-4 py-2 m-2">
            <h2 class="text-center text-primary">${version}</h2>
            <hr class="text-primary" />
            <p class="text-break text-light">${text}</p>
            <hr class="text-primary" />
            ${img ? `<img class="rounded img-fluid" src="${img}" />` : ''}
        </div>
    `;
    return card;
}

fetch("https://api.github.com/gists/5f1626d5284c8bbf30dd47df706d6bfa")
    .then(response => response.json())
    .then(data => {
        data = JSON.parse(data.files["updates.json"].content);
        /* Data Structure
        {v : [
            {version: "1.0.0", text: {
                en: "text",
                pt: "texto"
            },
            img: "url" or null
        }
        ]}
        */
        let container = document.getElementById("updates");
        for (let i = 0; i < data.v.length; i++) {
            let version = data.v[i].version;
            let text = data.v[i].text["pt-BR"];
            let img = data.v[i].img;
            container.appendChild(createCard(version, text, img));
        }
    
});