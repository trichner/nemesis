var service = require('./../minions/service');
var minions = require('./../minions/Minions');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var session = require('express-session');
var eveHeader = require('eve-header');
var FileStore = require('session-file-store')(session);

var Q = require('q');
var express = require('express');

var app = express();

// setup passport
var passport = require('passport')
var OAuth2Strategy = require('passport-oauth2').Strategy;
var credentials = minions.getEveSSOCredentials();
passport.use(new OAuth2Strategy({
        authorizationURL: 'https://login.eveonline.com/oauth/authorize',
        tokenURL: 'https://login.eveonline.com/oauth/token',
        clientID: credentials.clientID,
        clientSecret: credentials.clientSecret,
        callbackURL: "https://k42.ch/nemesis/api/auth/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        var err = null;
        return done(err, "SomeUser");
    }
));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, type: 'application/x-www-form-urlencoded' }));
app.use(session({
    secret: minions.getSessionSecret(),
    store: new FileStore()
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(eveHeader);

app.get('/auth', passport.authenticate('oauth2'));

app.get('/auth/callback',
    passport.authenticate('oauth2', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

/* GET all owned lists*/
app.get('/waitlist', function(req, res, next) {
  //res.send('respond with a resource');
  res.json({wait:'lists'})
});

/* GET waitlist by id*/
app.get('/waitlist/:id', function(req, res, next) {
  //res.send('respond with a resource');
  var externalId = req.params.id;
  service.getList(externalId).
      then(function (list) {
        res.json(list);
      })
      .catch(function (e) {
        next(e);
      })
});

/* GET create new waitlist*/
app.post('/waitlist', function(req, res, next) {
  var pilotId = req.session.pilotId;
  service.createList(pilotId)
      .then(function (list) {
        res.json(list);
      })
      .catch(function (e) {
        next(e);
      })
});

/* POST add entry to waitlist*/
app.post('/waitlist/:id', function(req, res, next) {
    //res.send('respond with a resource');
    var externalId = req.params.id;
    var pilotId = req.session.pilotId;
    var shipString   = req.body.shipString;
    service.addToList(pilotId,externalId,shipString)
        .then(function (itemId) {
            res.json({id: itemId});
        })
        .catch(function (e) {
            next(e);
        })
});

/* GET create new waitlist*/
app.get('/me', function(req, res, next) {
    var pilotId = req.session.pilotId;
    service.findPilot(pilotId)
        .then(function (pilot) {
            res.json(pilot);
        })
        .catch(function (e) {
            next(e);
        })
});

/* POST add entry to waitlist*/
app.delete('/waitlist/:id', function(req, res, next) {
    //res.send('respond with a resource');
    var externalId = req.params.id;
    var pilotId = req.session.pilotId;
    var order = req.body.itemId;
    service.removeFromList(pilotId,externalId,order)
        .then(function () {
            res.status(204).end();
        })
        .catch(function (e) {
            next(e);
        })
});

/* POST verify pilots*/
app.post('/verify', function(req, res, next) {
  var key   = req.body.key;
  var vCode = req.body.vCode;
  var rememberMe = req.body.rememberMe;
  var pilotId = req.eve.char.id;
  if(key && vCode && pilotId){
    service.verifyPilot(key,vCode,pilotId)
        .then(function (isVerified) {
            if(isVerified){
                req.session.verified = true;
                req.session.pilotId = pilotId; // implicitly authenticated
                var maxAge = 3600000*12; // half day
                if(rememberMe){
                    maxAge *= 730; // one year
                }
                req.session.cookie.maxAge = maxAge;
                res.status(204).end();
                return Q.fulfill();
            }else{
                return Q.reject();
            }
        })
        .catch(function (e) {
            var err = new Error('Not Authorized')
            err.status = 401;
            next(err);
        });
  }else{
    var err = new Error('Bad Request')
    err.status = 400;
    next(err);
  }

});

/* DELETE verify pilots*/
app.delete('/verify', function(req, res, next) {
    if(req.session){
        req.session.verified = false;
    }
});

module.exports = app;
