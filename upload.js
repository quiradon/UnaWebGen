//delete todos os itens da pasta upload
const fs = require('fs');
const path = require('path');

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file, index) => {
            const curPath = path + '/' + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

function copyFolderRecursive(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target);
    }

    if (fs.lstatSync(source).isDirectory()) {
        fs.readdirSync(source).forEach(file => {
            const curSource = path.join(source, file);
            const curTarget = path.join(target, file);

            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursive(curSource, curTarget);
            } else {
                fs.copyFileSync(curSource, curTarget);
            }
        });
    }
}

const exportPath = path.join(__dirname, 'export');
const uploadPath = path.join(__dirname, 'upload');

deleteFolderRecursive(uploadPath);
fs.mkdirSync(uploadPath);
copyFolderRecursive(exportPath, uploadPath);
//crie uma pasta static dentro de upload e coloque os arquivos da pasta static
const staticPath = path.join(uploadPath, 'static');
fs.mkdirSync(staticPath);
copyFolderRecursive(path.join(__dirname, 'static'), staticPath);
//copie robots.txt para a pasta upload
fs.copyFileSync(path.join(__dirname, 'robots.txt'), path.join(uploadPath, 'robots.txt'));
console.log('[Upload realizado com sucesso!]');
