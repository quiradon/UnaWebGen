const { traduz } = require('./translation.js')
const fs = require('fs')
const path = require('path')


function compilePages() {
    const languages = ['pt', 'en']
    const pages = fs.readdirSync(path.join(__dirname, 'pages'))
    const exportFolder = path.join(__dirname, 'export')
    if (!fs.existsSync(exportFolder)) {
        fs.mkdirSync(exportFolder)
    }

    languages.forEach(language => {
        const t = traduz(language)
        const languageFolder = language === 'en' ? exportFolder : path.join(exportFolder, language)
        if (!fs.existsSync(languageFolder)) {
            fs.mkdirSync(languageFolder)
        }

        pages.forEach(page => {
            const pagePath = path.join(__dirname, 'pages', page)
            const pageStat = fs.statSync(pagePath)
            if (pageStat.isDirectory()) {
                const pageFiles = fs.readdirSync(pagePath)
                const exportPageFolder = path.join(languageFolder, page)
                if (!fs.existsSync(exportPageFolder)) {
                    fs.mkdirSync(exportPageFolder)
                }
                pageFiles.forEach(file => {
                    const filePath = path.join(pagePath, file)
                    const fileStat = fs.statSync(filePath)
                    if (fileStat.isFile()) {
                        const pageFunction = require(filePath)
                        const route = '/' + page + '/' + path.basename(file, path.extname(file))
                        const html = pageFunction.page(t, route)
                        const exportFilePath = path.join(exportPageFolder, path.basename(file, path.extname(file)) + '.html')
                        fs.writeFileSync(exportFilePath, html)
                    }
                })
            } else {
                const route = '/' + path.basename(page, path.extname(page))
                const pageFunction = require(pagePath)
                const html = pageFunction.page(t, route)
                const exportFilePath = path.join(languageFolder, path.basename(page, path.extname(page)) + '.html')
                fs.writeFileSync(exportFilePath, html)
            }
        })
    })
}

// Chame a função para executar a compilação das páginas
compilePages()
console.log('[Páginas compiladas com sucesso!]')

module.exports = {
    compilePages
}