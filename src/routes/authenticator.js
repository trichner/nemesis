
var passport = require('passport')
var OAuth2Strategy = require('passport-oauth2').Strategy;
var session = require('express-session');
var service = require('./../services/service');
var credentials = require(__dirname + '/../config/evesso.json');

var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config/config.json')[env];
var authRequired = config.authRequired !== undefined ? config.authRequired : true;

var router = require('express').Router();

passport.serializeUser(function(pilot, done) {
    done(null, pilot.id);
});
passport.deserializeUser(function(pilotId, done) {
    service.findPilot(pilotId)
        .then(function (pilot) {
            if(pilot){
                done(null, pilot);
            }else{
                done(new Error('Session not established'),null);
            }
        })
});
passport.use(new OAuth2Strategy({
        authorizationURL: 'https://login.eveonline.com/oauth/authorize',
        tokenURL: 'https://login.eveonline.com/oauth/token',
        clientID: credentials.clientID,
        clientSecret: credentials.clientSecret,
        callbackURL: "https://k42.ch/nemesis/api/auth/callback",
        passReqToCallback: true
    },
    function(req,accessToken, refreshToken, profile, done) {
        service.createPilot(accessToken)
            .then(function (pilot) {
                req.session.verified = true;
                req.session.pilotId = pilot.id;
                done(null, pilot);
            }, function (err) {
                done(err, null);
            })
    }
));

// authentication
router.use(passport.initialize());
router.use(passport.session());

router.get('/auth', passport.authenticate('oauth2',{
    callbackURL: "http://localhost:3000/nemesis/api/auth/callback"
}));
router.get('/auth/callback',
    passport.authenticate('oauth2',{
        callbackURL: "http://localhost:3000/nemesis/api/auth/callback",
        successRedirect : '/nemesis/',
        failureRedirect : '/nemesis/'
    }));


/* DELETE verify pilots*/
router.delete('/auth', function(req, res, next) {
    req.session.destroy(function(err){
        if(err){
            var err = new Error('Cannot logout')
            err.status = 500;
            next(err);
        }else{
            res.status(200).end();
        }
    })
});

router.get('/auth/test',
    function(req, res) {
        res.redirect('/nemesis/');
    });

router.use(function(req, res, next) {
    if(req.isAuthenticated()){
        next();
    }else{
        var err = new Error('Please authenticate.')
        err.status = 401;
        return next(err);
    }
})


module.exports = router;
