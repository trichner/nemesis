var dao = require('./dao');
var api = require('./crest');
var Q = require('q');
var Mapper = require('./../minions/mapper');
var sanitizer = require('sanitizer');

module.exports = {
    verifyPilot : verifyPilot,
    addToList : addToList,
    removeFromList : removeFromList,
    createList : createList,
    getList : getList,
    getLists : getLists,
    getAllLists : getAllLists,
    findPilot : findPilot,
    fetchPilotInfo : fetchPilotInfo,
    createPilot : createPilot,
    getListTxt : getListTxt,
    updateWaitlistOwner :updateWaitlistOwner,
    updateWaitlistName : updateWaitlistName
};

var MAX_WL_NAME_LENGTH = 60;

function getAllLists(pilotId){
    var yesterday = new Date((new Date()).getTime() - 1000*60*60*24); //FIXME
    return dao.findAllWaitlistsSince(yesterday)
        .then(function (waitlists) {
            waitlists = waitlists.map(Mapper.mapWaitlistDBVO)
            return Q.all(waitlists);
        });
}

function getLists(pilotId){
    return dao.findWaitlistsByOwner(pilotId)
        .then(function (waitlists) {
            waitlists = waitlists.map(Mapper.mapWaitlistDBVO)
            return Q.all(waitlists);
        });
}

function createList(pilotId){
    return dao.createWaitlist(pilotId)
        .then(Mapper.mapWaitlistDBVO);
}

function getList(listId){
    return dao.findWaitlistByExternalId(listId)
        .then(Mapper.mapWaitlistDBVO);
}

function getListTxt(listId){
    return dao.findWaitlistByExternalId(listId)
        .then(Mapper.mapWaitlistDBVOtoAscii);
}

function fetchPilotInfo(characterID){
    return api.getCharacter(characterID);
}

function verifyPilot(key,verificationCode,id){
    return api.getCharacter(key,verificationCode,id)
        .then(dao.findOrCreatePilot)
        .then(function (pilot) {
            if(pilot){
                return true;
            }else{
                return Q.reject();
            }
        })
}
/*

 */
function createPilot(accessToken){
    return api.getCharacterId(accessToken)
        .then(api.getCharacter)
        .then(dao.findOrCreatePilot)
        .then(function (pilot) {
            if(pilot){
                return pilot;
            }else{
                return new Error('Cannot create pilot.');
            }
        })
}

function addToList(pilotId,listId,shipString,role){
    var ship = api.extractShip(shipString);
    ship.name = sanitizer.sanitize(ship.name);
    role = sanitizer.sanitize(role);
    return dao.addToWaitlist(pilotId,listId,null,ship.type,ship.dna,ship.name,role)
        .then(function (item) {
            return item.order;
        })
}

function removeFromList(pilotId,listId,order){
    return dao.findItemByOrder(order)
        .then(function (item) {
            if(item.pilotId==pilotId){
                return item.destroy();
            }else{
                return isListOwner(pilotId,listId)
                    .then(function (isOwner) {
                        if(isOwner){
                            return item.destroy();
                        }else{
                            return Q.reject(new Error('Cannot delete item. Authorized?'));
                        }
                    })
            }
        })
        .then(function () {
            dao.updateWatilistLastActivityByExternalId(listId);
        })
}

function isListOwner(pilotId,listId){
    return dao.findWaitlistByExternalId(listId)
        .then(function (waitlist) {
            return waitlist.ownerId==pilotId;
        });
}

function findPilot(pilotId){
    return dao.findPilotById(pilotId)
        .then(Mapper.mapPilotDBVO);
}

function updateWaitlistOwner(ownerId,waitlistId, newOwnerId){
    return dao.findPilotById(newOwnerId)
        .then(function (pilot) {
            // verify that new boss exists
            return dao.findWaitlistByExternalId(waitlistId)
                .then(function (waitlist) {
                    if(waitlist.ownerId!=ownerId){
                        throw new Error('Not authorized, not owner');
                    }
                    return waitlist.setOwner(pilot);
                })
        })
}

function updateWaitlistName(ownerId,waitlistId, name){
    return dao.findWaitlistByExternalId(waitlistId)
        .then(function (waitlist) {
            if(waitlist.ownerId!=ownerId){
                throw new Error('Not authorized, not owner');
            }
            name = name.substring(0, MAX_WL_NAME_LENGTH);
            name = sanitizer.sanitize(name);
            return waitlist.update({name:name})
        })
        .then(Mapper.mapWaitlistDBVO)
}