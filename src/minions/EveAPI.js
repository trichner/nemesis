/**
 * Created by Thomas on 11.04.2015.
 */
var neow = require('neow');
var Q    = require('q');

/*
 {
 name: 'Thomion',
 characterID: '698922015',
 corporationName: 'Deep Core Mining Inc.',
 corporationID: '1000006',
 allianceID: '0',
 allianceName: '',
 factionID: '0',
 factionName: '' }

 */
module.exports = {
    getCharacter : function(keyID,vCode,characterID){
        var client = new neow.EveClient({
            keyID: keyID,
            vCode: vCode
        });

        return client.fetch('account:Characters')
            .then(function(result){
                if(result.characters.hasOwnProperty(characterID)){
                    return result.characters[characterID];
                }else{
                    return Q.reject();
                }
            })
    },
    extractShip:extractFit
}

var fittingPattern  = /.*<url=fitting:([0-9:;]*)>(.*)<\/url>.*/i;
var shipTypePattern = /.*fitting:([0-9]*):.*/i;
function extractFit(str){
    var matches = fittingPattern.exec(str);
    var shipDNA,shipName,shipType;
    if(matches){
        shipDNA  = matches[0];
        shipName = matches[1];
    }
    var matches = shipTypePattern.exec(str);
    if(matches){
        shipType  = matches[0];
    }
    return {
        dna : shipDNA,
        name: shipName,
        type: shipType
    }
}


