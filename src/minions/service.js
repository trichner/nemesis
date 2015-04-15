var dao = require('./dao');
var api = require('./crest');
var Q = require('q');
var Mapper = require('./mapper');

module.exports = {
    verifyPilot : verifyPilot,
    addToList : addToList,
    removeFromList : removeFromList,
    createList : createList,
    getList : getList,
    getLists : getLists,
    getAllLists : getAllLists,
    findPilot : findPilot
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
    return dao.findWaitlistByOwner(pilotId)
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

function findPilot(pilotId){
    return dao.findPilotById(pilotId)
        .then(function (pilot) {
            return Mapper.mapPilotDBVO(pilot);
        });
}