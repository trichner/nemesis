var service = require('./../minions/service');
var apiConfig = require('./api-config');
var Q = require('q');
var express = require('express');

var app = express();

apiConfig.setupMiddleware(app);

/* GET all owned lists*/
app.get('/waitlist', function(req, res, next) {
  //res.send('respond with a resource');
    var pilotId = req.session.pilotId;
    service.getAllLists(pilotId) //getLists(pilotId)
        .then(function (lists){
            res.json({waitlists : lists})
        })
});

/* GET waitlist by id*/
app.get('/waitlist/:id.json', function(req, res, next) {
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
    var role = req.body.role;
    service.addToList(pilotId,externalId,shipString,role)
        .then(function (itemId) {
            res.json({id: itemId});
        })
        .catch(function (e) {
            next(e);
        })
});

/* POST chang owner*/
app.post('/waitlist/:id/owner', function(req, res, next) {
    //res.send('respond with a resource');
    var externalId = req.params.id;
    var pilotId = req.session.pilotId;
    var ownerId   = req.body.ownerId;
    service.updateWaitlistOwner(pilotId,externalId,ownerId)
        .then(function () {
            res.status(200).end();
        })
        .catch(function (e) {
            next(e);
        })
});

/* GET create new waitlist*/
app.get('/me', function(req, res, next) {
    var pilotId = req.session.pilotId;
    console.log('Session: ' + JSON.stringify(req.session))
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


module.exports = app;
