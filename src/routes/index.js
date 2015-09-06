var express = require('express');
var path = require('path');
var logger = require('morgan');

var api = require('./api');
var app = express();

// uncomment after placing your favicon in /public
app.use(logger('dev'));

// static content
app.use('/img', express.static(path.resolve(__dirname, '../../public/img'),{ maxAge: 31557600000 }));
//app.use('/components', express.static(path.resolve(__dirname, '../../public/components'),{ maxAge: 31557600000 }));
app.use('/', express.static(path.resolve(__dirname, '../../public')));

// API
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
