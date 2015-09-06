
var env       = process.env.NODE_ENV || "production";
module.exports = require(__dirname + '/config.json')[env];