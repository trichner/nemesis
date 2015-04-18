
var passport = require('passport')
var OAuth2Strategy = require('passport-oauth2').Strategy;
var session = require('express-session');
var eveHeader = require('eve-header');
var FileStore = require('session-file-store')(session);
var minions = require('./../minions/Minions');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var service = require('./../minions/service');

function setupMiddleware(app){
    // API Middleware
    var credentials = minions.getEveSSOCredentials();
    passport.serializeUser(function(pilot, done) {
        console.log("SERIALIZING: " + JSON.stringify(user));
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
            console.log('Session:' + JSON.stringify(req.session))
            console.log("ACCESSTOKEN: " + accessToken);
            service.createPilot(accessToken)
                .then(function (pilot) {
                    console.log('Pilot:' + JSON.stringify(pilot))
                    req.session.verified = true;
                    req.session.pilotId = pilot.id;
                    done(null, pilot);
                }, function (err) {
                    done(err, null);
                })
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
        passport.authenticate('oauth2', { failureRedirect: '/nemesis/' }),
        function(req, res) {
            // Successful authentication, redirect home.
            console.log("SUCCESS AUTH");
            res.redirect('/nemesis/');
        });
    app.get('/auth/test',
        function(req, res) {
            // Successful authentication, redirect home.
            console.log("SUCCESS AUTH");
            res.redirect('/nemesis/');
        });
}

module.exports = {
    setupMiddleware : setupMiddleware
}

