var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs')
var child_process = require('child_process')

var indexRouter = require('./routes/index');
var totemRouter = require('./routes/totem');
var gestioneRouter = require('./routes/gestione');
var qrRouter = require('./routes/qr')
var slideshow = require('./routes/slideshow')


var app = express();

var standardConfig = {
    'startCommand': 'chromium',
    'enabled': false,
    'endpoint': 'https://example.com',
    'token': 'token-di-esempio',
    'marquee': '⇨ Accedi al pannello di gestione per configurare il totem ⇦'
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var totem = {}

if(!fs.existsSync(__dirname + '/config.json')) {

    totem = standardConfig

    fs.writeFileSync(__dirname + '/config.json', JSON.stringify(standardConfig))

} else {
    totem = JSON.parse(fs.readFileSync(__dirname + '/config.json'))
}

try {
    child_process.exec(totem.startCommand + ' --kiosk --app="http://localhost:3000"')
} catch(e) {
    console.log(e)
}

app.use('/', indexRouter);
app.use('/totem', totemRouter);
app.use('/gestione', gestioneRouter);
app.use('/qr', qrRouter);
app.use('/slideshow', slideshow);

module.exports = app;
