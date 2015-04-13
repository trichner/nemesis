var service = require('./../minions/service');

var Q = require('q');
var express = require('express');
var router = express.Router();


/* GET all owned lists*/
router.get('/waitlist', function(req, res, next) {
  //res.send('respond with a resource');
  res.json({wait:'lists'})
});

/* GET waitlist by id*/
router.get('/waitlist/:id', function(req, res, next) {
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
router.post('/waitlist', function(req, res, next) {
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
router.post('/waitlist/:id', function(req, res, next) {
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
router.get('/me', function(req, res, next) {
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
router.delete('/waitlist/:id', function(req, res, next) {
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
router.post('/verify', function(req, res, next) {
  var key   = req.body.key;
  var vCode = req.body.vCode;
  var pilotId = req.eve.char.id;
  if(key && vCode && pilotId){
    service.verifyPilot(key,vCode,pilotId)
        .then(function (isVerified) {
            if(isVerified){
              req.session.verified = true;
              req.session.pilotId = pilotId; // implicitly authenticated
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
router.delete('/verify', function(req, res, next) {
    if(req.session){
        req.session.verified = false;
    }
});

module.exports = router;
