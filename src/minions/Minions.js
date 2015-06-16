/**
 * Created by Thomas on 11.04.2015.
 */
var crypto = require('crypto');
var fs = require('fs');

var SECRET_FILE = 'session_secret';
var CONFIG_FILE = 'config.json';
var EVESSO_CREDENTIALS = 'evesso.json';
var SECRET_LENGTH = 20;

function randomString(howMany, chars) {
    chars = chars || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value.push(chars[rnd[i] % len])
    };

    return value.join('');
}

function randomAlphanumericString(length){
    return randomString(length,"abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789");
}

module.exports = {
    randomAlphanumericString : function(length) {
        return randomAlphanumericString(length);
    },
    getSessionSecret : function(){
        var secret;
        try{
            secret = fs.readFileSync(SECRET_FILE).toString();
            if(secret.length<SECRET_LENGTH){
                throw new Error("Stored secret is too short")
            }
        }catch (e1){
            secret = randomAlphanumericString(SECRET_LENGTH);
            try{
                fs.writeFileSync(SECRET_FILE,secret);
            }catch(e){
                console.log('WARN: Cannot write secret to disk: '+e);
            }
        }
        return secret;
    },
    loadConfig : function(){
        var configJson,config = {};
        try{
            configJson = fs.readFileSync(CONFIG_FILE).toString();
            config = JSON.parse(configJson)
        }catch (e1){
            console.log('WARN: Cannot load config file, ' + CONFIG_FILE + ': '+e1);
        }
        return config;
    },
    getEveSSOCredentials : function(){
        var credentials;
        try{
            credentials = fs.readFileSync(EVESSO_CREDENTIALS).toString();
            credentials = JSON.parse(credentials);
        }catch (e1){
            throw new Error('Provide Eve SSO oauth credentials in "' + EVESSO_CREDENTIALS + '" file.',e1);
        }
        return credentials;
    },
    deleteSessionSecret : function(){
        try{
            fs.unlinkSync(SECRET_FILE);
        }catch(e){
            console.log('Unable to delete session secret');
        }
    }
}
