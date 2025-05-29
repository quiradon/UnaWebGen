function blog(title, categories, img, content) {
    let tags = categories.split(',').map(category =>
        `<span class="badge bg-primary text-light m-1">${category}</span>`
    ).join('');

    return `
        <div class="container-lg d-flex justify-content-center my-5"
            style="max-width: 1100px;">
            <div class="card border-0 shadow-sm w-100">
                <div class="position-relative">
                    <!-- Imagem principal do post -->
                    <img 
                        src="${img}" 
                        alt="${title}" 
                        class="w-100 rounded px-3" 
                        loading="eager"
                    />
                </div>
                <div class="card-body px-4 py-4">
                    <div class="mb-3">
                        <div class="d-flex flex-wrap">
                            ${tags}
                        </div>
                        <h1 class="text-light fw-bold text-shadow mt-2">
                            ${title}
                        </h1>
                    </div>
                    <div class="content">
                        ${content}
                    </div>
                </div>
            </div>
        </div>
    `;
}










function PlaceParagraphs(title, text,color) {
    //faça a quebra de linhas com um /n
    text = text.split('\n').map(paragraph => `<p class="text-secondary">${paragraph}</p>`).join('');

    return `
    <div>
        <h2 class="text-${color ?? 'light'} mt-3 mb-0">${title}</h2>
            <div>
                <article class="pb-0 lead lead text-secondary">
                    ${text}
                </article>
            </div>
    </div>
    `
}

function PlaceSmallParagraphs(title, text) {
    //faça a quebra de linhas com um /n
    text = text.split('\n').map(paragraph => `<p class="text-secondary">${paragraph}</p>`).join('');
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
                <h2 class="text-light">${title}</h2>
                <p class="text-secondary lead">${text}</p> 
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

function TitleAndSubtitle(title,paragraph) {
    paragraph = paragraph || ''
    paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<span class="text-primary">$1</span>')
    return `
            <div class="mb-3 text-center">
            <h1 class="display-5 fw-bold mt-0 text-center">${title}</h1>
            <p class="lead text-secondary -3 text-center">${paragraph}</p>
        </div>
        `
}

/**
 * Renders markdown content as HTML within a blog post
 * @param {string} markdown - The markdown content to render
 * @returns {string} - The HTML representation of the markdown
 */
function MarkdownContent(markdown) {
    const { markdownToHtml } = require('./markdown');
    return `
    <div class="markdown-content">
        ${markdownToHtml(markdown)}
    </div>
    `;
}

module.exports = {
    blog,
    PlaceParagraphs,
    PlaceSmallParagraphs,
    CodeBlock,
    TextAndImage,
    TitleAndSubtitle,
    MarkdownContent
}