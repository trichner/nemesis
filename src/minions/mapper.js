var Q = require('q');

module.exports = {
    mapWaitlistDBVO : mapWaitlistDBVO,
    mapWaitlistItemDBVO : mapWaitlistItemDBVO,
    mapPilotDBVO : mapPilotDBVO,
    mapWaitlistDBVOtoAscii : mapWaitlistDBVOtoAscii
}

/*
 {
 "id": 4,
 "name": "Thomion`s waitlist",
 "externalId": "z5DapO3ksycMyMfj5Jm1impazAQHikBK",
 "createdAt": "2015-04-11T17:16:07.000Z",
 "updatedAt": "2015-04-11T17:16:07.000Z",
 "ownerId": "698922015",
 "items": []
 }
 {
 ownerId;
 waitlistId;
 ownerName;
 waitlistName;
 waitlist = [];
}
 */

function mapWaitlistDBVO(waitlist){
    var mapped = {};
    mapped.ownerId = waitlist.ownerId;
    mapped.waitlistId = waitlist.externalId;
    mapped.ownerName = waitlist.owner ? waitlist.owner.name : '';
    mapped.waitlistName = waitlist.name;
    var items = waitlist.items ? waitlist.items.map(mapWaitlistItemDBVO) : [];
    return Q.all(items)
        .then(function (mappedItems) {
            mapped.waitlist = mappedItems;
            return mapped;
        })
}

function mapWaitlistDBVOtoAscii(waitlist){

    return mapWaitlistDBVO(waitlist)
        .then(function (mapped) {

            var list = mapped.waitlist.map(function (item) {
                var char = item.characterName // linkCharacter(item.characterId,item.characterName);
                var fit  = item.shipName //linkFit(item.shipDNA,item.shipName)
                return ' * ' + fit + ' \t ' + char + '\n';
            })
            list = list.join('');

            var ascii = '.\n';
            var prename = mapped.ownerName.split(' ')[0];
            ascii = ascii.concat('-=   <b>' + prename + "'s Fleet </b>   =-\n")
            ascii = ascii.concat(list);
            ascii = ascii.concat('-==              ==-\n')
            return ascii;
        })
}

function linkCharacter(id,name){
    return '<url=showinfo:1373\/\/' + id + '>' + name +'</url>'
}

function linkFit(shipDNA,shipName){
    return '<url=fitting:' + shipDNA + '>' + shipName + '</url>'
}

/*
 {
 "order": 3,
 "shipId": "001",
 "shipName": "Dicke Berta",
 "shipDNA": "003",
 "shipType": "002",
 "createdAt": "2015-04-11T17:59:11.000Z",
 "updatedAt": "2015-04-11T17:59:11.000Z",
 "pilotId": "698922015",
 "waitlistId": 4
 }
 {
 characterId;
 characterName;
 shipDNA;
 shipName;
 itemId;
 shipType;
 }
 */
function mapWaitlistItemDBVO(item){
    return item.getPilot()
        .then(function (pilot) {
            return mapPilotDBVO(pilot)
        })
        .then(function (mapped) {
            mapped.shipDNA  = item.shipDNA;
            mapped.shipName = item.shipName;
            mapped.itemId   = item.order;
            mapped.shipType = item.shipType;
            return mapped;
        })
}

/*
 {
 "id": "698922015",
 "name": "Thomion",
 "createdAt": "2015-04-11T15:52:36.000Z",
 "updatedAt": "2015-04-11T19:25:29.000Z",
 "corpId": "1000006",
 "corp": {
 "id": "1000006",
 "name": "Deep Core Mining Inc.",
 "createdAt": "2015-04-11 15:54:39.000 +00:00",
 "updatedAt": "2015-04-11 15:54:39.000 +00:00",
 "allianceId": null,
 "alliance": null
 }
 }
    {
    characterId;
    characterName;
    corporationId;
    corporationName;
    allianceId;
    allianceName;
    }
 */

function mapPilotDBVO(pilot){
    var mapped = {};
    mapped.characterId  = pilot.id;
    mapped.characterName    = pilot.name;
    return pilot.getCorp()
        .then(function (corp) {
            mapped.corporationId    = corp.id;
            mapped.corporationName  = corp.name;
            return corp.getAlliance();
        })
        .then(function (alliance) {
            if(alliance){
                mapped.allianceId   = alliance.id;
                mapped.allianceName = alliance.name;
            }
            return mapped;
        })
}