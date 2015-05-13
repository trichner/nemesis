var dao = require('./dao');
var api = require('./crest');
var Q = require('q');
var Mapper = require('./mapper');
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
    updateWaitlistOwner :updateWaitlistOwner
};

//FIXME Hardcoded, WTF?
var ADMINS = ['698922015'];

function getAllLists(pilotId){
    if(ADMINS.indexOf(pilotId)>=0){
        return dao.findAllWaitlists()
            .then(function (waitlists) {
                waitlists = waitlists.map(function (list) {
                    return Mapper.mapWaitlistDBVO(list);
                })
                return Q.all(waitlists);
            });
    }else{
        return Q.reject(new Error('Not Authorized!'));
    }
}

function getLists(pilotId){
    return dao.findWaitlistsByOwner(pilotId)
        .then(function (waitlists) {
            waitlists = waitlists.map(function (list) {
                return Mapper.mapWaitlistDBVO(list);
            })
            return Q.all(waitlists);
        });
}

function createList(pilotId){
    return dao.createWaitlist(pilotId)
        .then(function (waitlists) {
            return Mapper.mapWaitlistDBVO(waitlists);
        });
}

function getList(listId){
    return dao.findWaitlistByExternalId(listId)
        .then(function (waitlists) {
            return Mapper.mapWaitlistDBVO(waitlists);
        });
}

function getListTxt(listId){
    return dao.findWaitlistByExternalId(listId)
        .then(function (waitlists) {
            return Mapper.mapWaitlistDBVOtoAscii(waitlists);
        });
}

function fetchPilotInfo(characterID){
    return api.getCharacter(characterID);
}

function verifyPilot(key,verificationCode,id){
    return api.getCharacter(key,verificationCode,id)
        .then(function (character) {
            return dao.findOrCreatePilot(character)
        })
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
        .then(function (pilotId) {
            return api.getCharacter(pilotId)
        })
        .then(function (character) {
            return dao.findOrCreatePilot(character)
        })
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
}

function isListOwner(pilotId,listId){
    return dao.findWaitlistByExternalId(listId)
        .then(function (waitlist) {
            return waitlist.ownerId==pilotId;
        });
}

function findPilot(pilotId){
    return dao.findPilotById(pilotId)
        .then(function (pilot) {
            return Mapper.mapPilotDBVO(pilot);
        });
}

function updateWaitlistOwner(ownerId,waitlistId, newOwnerId){
    return dao.findPilotById(newOwnerId)
        .then(function (pilot) {
            // verify that new boss exists
            return dao.findWaitlistByExternalId(waitlistId)
                .then(function (waitlist) {
                    if(waitlist.ownerId!=ownerId){
                        return Q.reject(new Error('Not authorized, not owner'));
                    }else{
                        return waitlist.setOwner(pilot);
                    }
                })
        })
}