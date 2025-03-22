/**
 * Example of using the markdown parser in a blog post
 */

const { nav, footer } = require('../components/navbar');
const scripts = require('../components/bootscripts');
const { head } = require('../components/head');
const { blog, MarkdownContent } = require('../components/blogpost');

function page(idioma, rota) {
    const t = idioma;
    
    // Example markdown content
    const markdownContent = `
# Welcome to My Blog

This is a paragraph with **bold** and *italic* text.

## Lists

- Item 1
- Item 2
- Item 3

## Code

\`\`\`javascript
function hello() {
    console.log("Hello, world!");
}
\`\`\`

## Links

[Visit MiniKraken](https://minikraken.com)

![MiniKraken Logo](https://example.com/logo.png)

---

That's all for now!
`;

    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`, "Markdown Blog Example", "An example of using markdown in a blog post", "/static/img/bg/blog.jpg")}
<body>
    ${nav(t, rota)}

    ${blog("Markdown Blog Example", "markdown,example,blog", "/static/img/bg/blog.jpg", `
        ${MarkdownContent(markdownContent)}
    `)}

    ${footer(t, rota)}
    ${scripts}
</body>
</html>
`;
}

module.exports = {
    page
};