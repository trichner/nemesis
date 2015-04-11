var express = require('express');
var path = require('path');
var minions = require('./minions/Minions');

var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var authenticator = require('./routes/authenticator');
var FileStore = require('session-file-store')(session);
var eveHeader = require('eve-header');

var api = require('./routes/api');

var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, type: 'application/x-www-form-urlencoded' }));

// PUBLIC
app.use('/', express.static('public'));

// API
app.use('/api',eveHeader);
app.use('/api',session({
  secret: minions.randomAlphanumericString(16), // Random for dev purposes, should be persisted
  store: new FileStore()
}))
app.use('/api',authenticator('/verify'));
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).end();
});


module.exports = app;
