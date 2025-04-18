const fs = require('fs-extra')
const path = require('path')
const exportFolder = path.join(__dirname, 'dist')
const i18nPath = path.join(__dirname, 'i18n');
const zlib = require('zlib'); // Para compressão do sitemap
let urlBase = 'https://rpg.arkanus.app' // URL base do seu site

async function generateSitemap() {
    const sitemapPath = path.join(exportFolder, 'sitemap.xml');
    const languages = (await fs.readdir(i18nPath)).map(file => path.basename(file, path.extname(file)));
    const pages = await fs.readdir(path.join(__dirname, 'pages'));
    const buildDate = new Date().toISOString(); // Data de build no formato ISO

    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemapContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    for (const language of languages) {
        const languageFolder = language === 'en' ? '' : `/${language}`;
        for (const page of pages) {
            const pagePath = path.join(__dirname, 'pages', page);
            const pageStat = await fs.stat(pagePath);

            if (pageStat.isDirectory()) {
                const pageFiles = await fs.readdir(pagePath);
                for (const file of pageFiles) {
                    let route = `${languageFolder}/${page}/${path.basename(file, path.extname(file))}`;
                    if (path.basename(file, path.extname(file)) === 'index') {
                        route = `${languageFolder}/${page}`; // Remove '/index'
                    }
                    if (language === 'en') {
                        const priority = calculatePriority(route);
                        sitemapContent += `  <url>\n    <loc>${urlBase}${route}</loc>\n    <lastmod>${buildDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n`;
                        for (const altLang of languages) {
                            const altLangFolder = altLang === 'en' ? '' : `/${altLang}`;
                            let altRoute = `${altLangFolder}/${page}/${path.basename(file, path.extname(file))}`;
                            if (path.basename(file, path.extname(file)) === 'index') {
                                altRoute = `${altLangFolder}/${page}`; // Remove '/index'
                            }
                            sitemapContent += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${urlBase}${altRoute}" />\n`;
                        }
                        sitemapContent += `  </url>\n`;
                    }
                }
            } else {
                let route = `${languageFolder}/${path.basename(page, path.extname(page))}`;
                if (path.basename(page, path.extname(page)) === 'index') {
                    route = `${languageFolder}`; // Remove '/index'
                }
                if (language === 'en') {
                    const priority = calculatePriority(route);
                    sitemapContent += `  <url>\n    <loc>${urlBase}${route}</loc>\n    <lastmod>${buildDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n`;
                    for (const altLang of languages) {
                        const altLangFolder = altLang === 'en' ? '' : `/${altLang}`;
                        let altRoute = `${altLangFolder}/${path.basename(page, path.extname(page))}`;
                        if (path.basename(page, path.extname(page)) === 'index') {
                            altRoute = `${altLangFolder}`; // Remove '/index'
                        }
                        sitemapContent += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${urlBase}${altRoute}" />\n`;
                    }
                    sitemapContent += `  </url>\n`;
                }
            }
        }
    }

    // Adiciona a rota principal apenas para 'en'
    sitemapContent += `  <url>\n    <loc>${urlBase}/</loc>\n    <lastmod>${buildDate}</lastmod>\n    <priority>1.0</priority>\n`;
    for (const altLang of languages) {
        const altLangFolder = altLang === 'en' ? '' : `/${altLang}`;
        sitemapContent += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${urlBase}${altLangFolder}/" />\n`;
    }
    sitemapContent += `  </url>\n`;

    sitemapContent += `</urlset>`;
    await fs.writeFile(sitemapPath, sitemapContent);
    console.log('[Sitemap criado com sucesso!]');

    // Compressão do sitemap
    const compressedSitemapPath = `${sitemapPath}.gz`;
    const compressedContent = zlib.gzipSync(sitemapContent);
    await fs.writeFile(compressedSitemapPath, compressedContent);
    console.log('[Sitemap compactado criado com sucesso!]');
}

function calculatePriority(route) {
    const depth = route.split('/').filter(Boolean).length; // Calcula a profundidade da rota
    return (1.0 - (depth * 0.1)).toFixed(1); // Reduz a prioridade com base na profundidade
}

module.exports = {
    generateSitemap
}
