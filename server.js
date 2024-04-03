const express = require('express');
const app = express();
const path = require('path');

function start() {

app.use(express.static('export', { extensions: ['html'] }));
app.use('/static', express.static('static', { extensions: ['html'] }));

// Adicione este middleware no final da cadeia de middleware
app.use((req, res) => {
    if (req.url.startsWith('/pt/')) {
        res.status(404).sendFile(path.join(__dirname, 'export', 'pt', '404.html'));
    } else {
        res.status(404).sendFile(path.join(__dirname, 'export', '404.html'));
    }
});

app.listen(3001, () => {
    console.log('Servidor rodando na porta 3001');
});

}


module.exports = {  
    start
}