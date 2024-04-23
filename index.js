const {compilePages} = require('./compile.js');
const {start} = require('./server.js');
compilePages();

start();
