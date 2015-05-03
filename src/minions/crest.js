/**
 * Created by Thomas on 16.04.2015.
 */
/**
 * Created by Thomas on 11.04.2015.
 */
var neow = require('neow');
var Q    = require('q');
var unirest = require('unirest');

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
var client = new neow.EveClient();

module.exports = {
    getCharacter : function(characterID){
        return client.fetch('eve:CharacterInfo',{characterID:characterID});
    },
    getCharacterId : getCharacterId,
    extractShip:extractFit
}

function getCharacterId(accessToken){
    var deferred = Q.defer();
    unirest.get('https://login.eveonline.com/oauth/verify')
        .header('Accept', 'application/json')
        .header('Authorization', 'Bearer ' + accessToken)
        .end(function (res){
            console.log('Verify Body' + JSON.stringify(res.body))
            deferred.resolve(res.body.CharacterID);
        });
    return deferred.promise;
}

var fittingPattern  = /.*<url=fitting:([0-9:;]*)>(.*)<\/url>.*/i;
var shipTypePattern = /.*fitting:([0-9]*):.*/i;
function extractFit(str){
    var matches = fittingPattern.exec(str);
    var shipDNA,shipName,shipType;
    if(matches){
        shipDNA  = matches[1];
        shipName = matches[2];
    }
    var matches = shipTypePattern.exec(str);
    if(matches){
        shipType  = matches[1];
    }
    return {
        dna : shipDNA,
        name: shipName,
        type: shipType
    }
}


var TYPE_ID = {
    FEDERATION_NAVY_STASIS_WEBIFIER : 17559
}

var DD  = {
    VINDICATOR : 17740 ,
    ROKH : 24688 ,
    NIGHTMARE : 17736 ,
    MAELSTROM : 24694 ,
    HYPERION : 24690 ,
    MACHARIEL : 17738
}

var LL  = {
    SCIMITAR : 11978 ,
    BASILISK : 11985
}

function parseSlot(str){
    var arr = str.split(';');
    return {id: arr[0],n:arr[1]};
}

var characterPattern  = /.*<url=showinfo:[0-9]*\/\/([0-9]*)>(.*)<\/url>.*/i;
function extractCharacter(str){
    var matches = characterPattern.exec(str);
    var id,name;
    if(matches){
        id  = matches[1];
        name = matches[2];
    }
    return {
        id : id,
        name: name
    }
}

var shipstr = 'Fergus MacConal > x DD  <url=fitting:24688:2048;1:1952;1:26082;1:7783;8:26088;1:2281;2:10190;3:1999;1:17559;2:1978;1:26076;1:2205;5:23719;5:23051;720:21740;12000:28999;1::>bang bang</url>  or logi4  <url=fitting:11985:2048;1:3608;4:31366;1:16487;2:2281;1:2104;1:31796;1:6005;1:14136;1:17499;1:31932;1:23719;5:28999;1::>Stoney</url>'

var ship = extractFit(shipstr);

ship = teardownShipFit(ship.dna);
