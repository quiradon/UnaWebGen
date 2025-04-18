const { traduz } = require('./translation.js');
const fs = require('fs-extra');
const path = require('path');
const exportFolder = path.join(__dirname, 'dist');
const i18nPath = path.join(__dirname, 'i18n');
const { generateSitemap } = require('./gensitemap.js');

let cachedLanguages = null;
let cachedPages = null;

async function getLanguages() {
    if (!cachedLanguages) {
        cachedLanguages = (await fs.readdir(i18nPath)).map(file => path.basename(file, path.extname(file)));
    }
    return cachedLanguages;
}

async function getPages() {
    if (!cachedPages) {
        cachedPages = await fs.readdir(path.join(__dirname, 'pages'));
    }
    return cachedPages;
}

async function copyFolderRecursiveSync(source, target) {
    await fs.ensureDir(target);
    const items = await fs.readdir(source);
    await Promise.all(items.map(async item => {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);
        const stat = await fs.lstat(srcPath);
        if (stat.isDirectory()) {
            await copyFolderRecursiveSync(srcPath, destPath);
        } else {
            await fs.copy(srcPath, destPath);
        }
    }));
}

async function compilePages() {
    const languages = await getLanguages();
    const pages = await getPages();
    await fs.ensureDir(exportFolder);

    await Promise.all(languages.map(async language => {
        const t = traduz(language);
        const languageFolder = language === 'en' ? exportFolder : path.join(exportFolder, language);
        await fs.ensureDir(languageFolder);

        await Promise.all(pages.map(async page => {
            const pagePath = path.join(__dirname, 'pages', page);
            const pageStat = await fs.stat(pagePath);
            if (pageStat.isDirectory()) {
                const pageFiles = await fs.readdir(pagePath);
                const exportPageFolder = path.join(languageFolder, page);
                await fs.ensureDir(exportPageFolder);
                await Promise.all(pageFiles.map(async file => {
                    const filePath = path.join(pagePath, file);
                    const html = await processPage(filePath, t, `/${page}/${path.basename(file, path.extname(file))}`);
                    const exportFilePath = path.join(exportPageFolder, path.basename(file, path.extname(file)) + '.html');
                    await fs.writeFile(exportFilePath, html);
                }));
            } else {
                const html = await processPage(pagePath, t, `/${path.basename(page, path.extname(page))}`);
                const exportFilePath = path.join(languageFolder, path.basename(page, path.extname(page)) + '.html');
                await fs.writeFile(exportFilePath, html);
            }
        }));
    }));
    console.log('[Páginas compiladas com sucesso!]');
}

async function processPage(filePath, t, route) {
    const pageFunction = require(filePath);
    return await pageFunction.page(t, route);
}

async function copyStaticFiles() {
    const staticFolder = path.join(__dirname, 'static');
    const targetFolder = path.join(exportFolder, 'static');
    await copyFolderRecursiveSync(staticFolder, targetFolder);
    console.log('[Arquivos estáticos copiados com sucesso!]');
}

async function copyExtraFiles() {
    const extraFiles = ['robots.txt', '_redirects', 'manifest.json'];
    await Promise.all(extraFiles.map(async file => {
        const filePath = path.join(__dirname, file);
        const exportFilePath = path.join(exportFolder, file);
        await fs.copy(filePath, exportFilePath);
    }));
    console.log('[Arquivos extras copiados com sucesso!]');
}

(async () => {
    await compilePages();
    await copyStaticFiles();
    await copyExtraFiles();
    await generateSitemap();
})();