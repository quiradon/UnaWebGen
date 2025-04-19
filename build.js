const { traduz } = require('./translation.js');
const fg = require('fast-glob'); // Substitui fs-extra para leitura de diretórios
const fs = require('fs/promises'); // Substitui fs pelo fs/promises
const path = require('path');
const cliProgress = require('cli-progress'); // Importa o pacote cli-progress
const exportFolder = path.join(__dirname, 'dist');
const { generateSitemap } = require('./gensitemap.js');

async function getLanguages() {
    console.log('[Carregando idiomas...]');
    const files = await fg(`./i18n/*`, { onlyFiles: true });
    if (files.length === 0) {
        console.error('[Erro]: Nenhum idioma encontrado no diretório i18n.');
        return [];
    }
    console.log(`[Idiomas encontrados]: ${files}`);
    return files.map(file => path.basename(file, path.extname(file)));
}

async function getPages() {
    console.log('[Carregando páginas...]');
    const pages = await fg(`./pages/**/*`, { onlyFiles: false });
    if (pages.length === 0) {
        console.error('[Erro]: Nenhuma página encontrada no diretório pages.');
        return [];
    }
    console.log(`[Páginas encontradas]: ${pages}`);
    return pages;
}

async function compilePages() {
    console.log('[Iniciando compilação de páginas...]');
    const languages = await getLanguages();
    if (languages.length === 0) {
        console.error('[Erro]: Processo abortado. Nenhum idioma disponível.');
        return;
    }

    const pages = await getPages();
    if (pages.length === 0) {
        console.error('[Erro]: Processo abortado. Nenhuma página disponível.');
        return;
    }

    await fs.mkdir(exportFolder, { recursive: true });
    console.log(`[Diretório de exportação criado]: ${exportFolder}`);

    // Barra de progresso total
    const totalProgress = new cliProgress.SingleBar({
        format: '[Progresso Total] {bar} {percentage}% | {value}/{total} idiomas',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
    totalProgress.start(languages.length, 0);

    await Promise.all(languages.map(async language => {
        console.log(`[Processando idioma]: ${language}`);
        const t = traduz(language);
        const languageFolder = language === 'en' ? exportFolder : path.join(exportFolder, language);
        await fs.mkdir(languageFolder, { recursive: true });
        console.log(`[Diretório do idioma criado]: ${languageFolder}`);

        // Barra de progresso por idioma
        const languageProgress = new cliProgress.SingleBar({
            format: `[${language}] {bar} {percentage}% | {value}/{total} páginas`,
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });
        languageProgress.start(pages.length, 0);

        await Promise.all(pages.map(async page => {
            const pagePath = path.resolve(page);
            const relativePath = path.relative('./pages', pagePath); // Caminho relativo para manter a estrutura
            const exportPath = path.join(languageFolder, relativePath);

            const pageStat = await fs.stat(pagePath);

            if (pageStat.isDirectory()) {
                await fs.mkdir(exportPath, { recursive: true });
            } else {
                const exportFilePath = exportPath.replace(/\.js$/, '.html'); // Substitui extensão .js por .html
                const route = `/${relativePath.replace(/\.js$/, '')}`; // Define a rota com base no caminho relativo
                await fs.mkdir(path.dirname(exportFilePath), { recursive: true }); // Garante que o diretório exista
                const html = await processPage(pagePath, t, route);
                await fs.writeFile(exportFilePath, html);
            }
            languageProgress.increment(); // Incrementa a barra de progresso por idioma
        }));

        languageProgress.stop(); // Finaliza a barra de progresso por idioma
        totalProgress.increment(); // Incrementa a barra de progresso total
    }));

    totalProgress.stop(); // Finaliza a barra de progresso total
    console.log('[Páginas compiladas com sucesso!]');
}

async function processPage(filePath, t, route) {
    console.log(`[Carregando módulo]: ${filePath}`);
    const pageFunction = require(filePath); // Lazy loading
    console.log(`[Processando página]: ${route}`);
    return await pageFunction.page(t, route);
}

(async () => {
    console.log('[Iniciando geração do sitemap...]');
    await generateSitemap();
    console.log('[Sitemap gerado com sucesso!]');
    await compilePages();
})();