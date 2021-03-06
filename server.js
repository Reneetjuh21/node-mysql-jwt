//
// server.js
//
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser')
var logger = require('morgan');
var routesStudent = require('./api/studentenhuis.routes');
var routesMaaltijd = require('./api/maaltijd.routes');
var routesDeelnemers = require('./api/deelnemers.routes');
var routesAuth = require('./api/authentication.routes');
var config = require('./config/config');
var db = require('./config/db');


var expressJWT = require('express-jwt');
// var jwt = require('jwt-simple');

var app = express();

// bodyParser zorgt dat we de body uit een request kunnen gebruiken,
// hierin zit de inhoud van een POST request.
app.use(bodyParser.urlencoded({ 'extended': 'true' })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.use(expressJWT({
    secret: config.secretkey
}).unless({
    path: [
        '/api/login',
        '/api/register'
    ]
    
}));

// configureer de app
app.set('port', (process.env.PORT || config.webPort));
// app.set('env', (process.env.ENV | 'development'))

// Installeer Morgan als logger
app.use(logger('dev'));

// Deze route is de 'preprocessor'.
// Hier gaan we later bv. testen of de gebruiker ingelogd is.
// next() zorgt ervoor dat we 'doorvallen' naar de volgende URL.
app.use('*', function(req, res, next) {
    // console.log('aangeroepen.');
    next();
});

// Installeer de routers die we gebruiken.
app.use('/api', routesAuth);
app.use('/api', routesStudent);
app.use('/api', routesMaaltijd);
app.use('/api', routesDeelnemers);

app.use(function(err, req, res, next) {
    var error = {
        message: err.message,
        code: err.code,
        name: err.name,
        status: err.status,
        date: Date()
    }
    res.status(401).send(error);
});


// Fallback - als geen enkele andere route slaagt wordt deze uitgevoerd. 
app.use('*', function(req, res) {
    res.status(400);
    res.json({
        'error': 'Deze URL is niet beschikbaar.'
    });
});



// Installatie klaar; start de server.
app.listen(app.get('port'), function() {
    console.log('De server luistert op port ' + app.get('port'));
});

// Voor testen met mocha/chai moeten we de app exporteren.
module.exports = app;