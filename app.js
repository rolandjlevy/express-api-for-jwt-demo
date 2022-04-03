const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

const routes = require('./routes.js');
app.use('/', routes);

module.exports = app;