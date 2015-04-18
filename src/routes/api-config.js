
var passport = require('passport')
var OAuth2Strategy = require('passport-oauth2').Strategy;
var session = require('express-session');
var eveHeader = require('eve-header');
var FileStore = require('session-file-store')(session);
var minions = require('./../minions/Minions');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

function setupMiddleware(app){
    // API Middleware
    var credentials = minions.getEveSSOCredentials();
    passport.serializeUser(function(user, done) {
        console.log("SERIALIZING: " + JSON.stringify(user));
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    passport.use(new OAuth2Strategy({
            authorizationURL: 'https://login.eveonline.com/oauth/authorize',
            tokenURL: 'https://login.eveonline.com/oauth/token',
            clientID: credentials.clientID,
            clientSecret: credentials.clientSecret,
            callbackURL: "https://k42.ch/nemesis/api/auth/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            var err = null;
            console.log("ACCESSTOKEN: " + accessToken);
            console.log("VERIFY: " + JSON.stringify(profile));
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
}

module.exports = {
    setupMiddleware : setupMiddleware
}

