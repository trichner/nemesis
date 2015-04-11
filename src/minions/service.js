var dao = require('./dao');
var api = require('./eveAPI');
var Q = require('q');

module.exports = {
    verifyPilot : verifyPilot,
    addToList : addToList,
    removeFromList : removeFromList
};

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

function addToList(pilotId,listId,shipString){
    var ship = api.extractShip(shipString);
    return dao.addToWaitlist(pilotId,listId,null,ship.type,ship.dna,ship.name)
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