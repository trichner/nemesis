
var session = require('express-session');
var eveHeader = require('eve-header');
var FileStore = require('session-file-store')(session);
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

var minions = require('./../minions/minions');
var config    = require('./../config');

module.exports = [
        cookieParser(),
        bodyParser.json(),
        bodyParser.urlencoded({ extended: false, type: 'application/x-www-form-urlencoded' }),
        eveHeader,
        session({
            secret: minions.getSessionSecret(),
            store: new FileStore(),
            name: config.prefix + '.sid',
            proxy: true,
            resave: true,
            rolling: true,
            saveUninitialized: true
        })
    ];