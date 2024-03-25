const express = require('express');
const app = express();
const path = require('path');

app.use(express.static('export', { extensions: ['html'] }));
app.use('/static', express.static('static', { extensions: ['html'] }));

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});