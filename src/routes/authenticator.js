
var passport = require('passport')
var OAuth2Strategy = require('passport-oauth2').Strategy;
var session = require('express-session');
var service = require('./../services/service');
var ssoCredentials = require(__dirname + '/../config/evesso.json');

var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config/config.json')[env];
var authRequired = config.authRequired !== undefined ? config.authRequired : true;
var callbackURL = config.eveSsoCallback || "http://localhost:3000/nemesis/api/auth/callback";

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
        clientID: ssoCredentials.clientID,
        clientSecret: ssoCredentials.clientSecret,
        callbackURL: callbackURL,
        passReqToCallback: true
    },
    function (req, accessToken, refreshToken, profile, done) {
        service.createPilot(accessToken)
            .then(function (pilot) {
                req.session.pilotId = pilot.id;
                req.session.verified = true;
                if(req.session.rememberMe){
                    req.session.cookie.maxAge = 3600000 * 24 * 365; // a year
                }
                done(null, pilot);
            })
            .catch(function (err) {
                done(err, null);
            })
    }
));


// authentication
router.use(passport.initialize());
router.use(passport.session());

//--- Login
router.post('/auth', function (req, res, next) {
    req.session.rememberMe = req.body.rememberMe === "on";
    req.session.loginUrl = req.body.currentUrl;
    next();
}, passport.authenticate('oauth2'));

//--- Oauth Callback (needs to be subdir of Login URL)
router.get('/auth/callback', function(req, res, next) {
    passport.authenticate('oauth2', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/auth'); }
        // Set up authenticated session
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            // assemble redirect:
            var redirectUrl = req.session.loginUrl || '/nemesis/';
            return res.redirect(redirectUrl);
        });
    })(req, res, next);
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

/* DEPRECATED, use POST '/deauth' instead*/
router.delete('/auth', function(req, res, next) {
    req.session.destroy(function(err){
        if(err){
            var err = new Error('Cannot logout')
            err.status = 500;
            next(err);
        }else{
            res.status(204).end();
        }
    })
});

//--- Logout
router.post('/deauth', function (req, res, next) {
    req.session.destroy(function (err) {
        if (err) {
            var err = new Error('Cannot logout')
            err.status = 500;
            next(err);
        } else {
            res.status(204).end(); //TODO hardcoded!
        }
    })
});


module.exports = router;
