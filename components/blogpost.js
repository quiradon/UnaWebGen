function blog(title, categories, img, content) {
    let tags = categories.split(',').map(category => `<span class="badge bg-primary text-light m-1">${category}</span>`).join('');

    return `
        <div class="col m-md-3">
            <div class="container border rounded border-0 p-0 shadow-lg shadow">
                <div class="p-5 mb-3 img-fluid rounded-top" style="background: url('${img}') center / cover;">${tags}
                    <h1 class="text-light pb-5 pt-2 border-2 text-shadow-l">${title}</h1>
                </div>
                <div class="px-3 pb-3">
                    <div>
                        ${content}
                    </div>
                </div>
            </div>
        </div>
    `
}

function PlaceParagraphs(title, text,color) {
    //faça a quebra de linhas com um /n
    text = text.split('\n').map(paragraph => `<p class="text-light">${paragraph}</p>`).join('');

    return `
    <div>
        <h2 class="text-${color ?? 'primary'} mt-3 mb-0">${title}</h2>
            <div>
                <article class="p-1 pb-0">
                    ${text}
                </article>
            </div>
    </div>
    `
}

function PlaceSmallParagraphs(title, text) {
    //faça a quebra de linhas com um /n
    text = text.split('\n').map(paragraph => `<p class="text-light">${paragraph}</p>`).join('');
    return `
    <div class="col">
            <h2 class="text-primary mt-3 mb-0">${title}</h2>
            <div>
                ${text}
            </div>
        </div>`
}

function TextAndImage(title,text,img,alt){
    return `
    <div class="row mb-2">
        <div class="col-md-6 col-lg-6 col-xl-6">
            <div>
                <h2 class="text-primary">${title}</h2>
                <p class="text-light lead">${text}</p> 
            </div>
        </div>
        <div class="col-md-6 col-lg-6 col-xl-6 text-center mb-3">
            <img class="img-fluid" src="${img}" alt="${alt}" loading="auto" />
        </div>
    </div>
    `
}

function CodeBlock(code) {
    return `
    <div class="code-block">
        <code>${code}</code>
    </div>
    `

}


module.exports = {
    blog,
    PlaceParagraphs,
    PlaceSmallParagraphs,
    CodeBlock,
    TextAndImage
}