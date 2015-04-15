/**
 * Created by Thomas on 15.04.2015.
 */


var neow = require('neow');

var client = new neow.EveClient();

client.fetch('eve:CharacterInfo',{characterID:1643072492})
    .then(function(result){
        console.log(result)
    })
    .catch(function (e) {
        console.log(e)
    })