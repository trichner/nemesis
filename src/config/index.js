var fs = require('fs');
var env       = process.env.NODE_ENV || "production";
var configFile = __dirname + '/config.json';

if(!fileExists(configFile)){
    console.error("Config file not found! Was looking for: " + configFile);
}

module.exports = require(__dirname + '/config.json')[env];

function fileExists(file){
    try {
        var stats = fs.lstatSync(file);
        if (stats.isFile()) {
            return true;
        }
    }
    catch (e) {
        return false;
    }
    return false;
}