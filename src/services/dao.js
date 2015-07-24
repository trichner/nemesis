/**
 * Created by Thomas on 11.04.2015.
 */

var Q = require('q');
var minions = require('./../minions/Minions');
var models  = require('../models/index');

var EXTERNAL_ID_LENGTH = 32;

module.exports = {
    findOrCreatePilot : findOrCreatePilot,
    findAllPilots : findAllPilots,
    findPilotById : findPilotById,
    createWaitlist: createWaitlist,
    findWaitlistByExternalId : findWaitlistByExternalId,
    addToWaitlist : addToWaitlist,
    findItemByOrder : findItemByOrder,
    findAllWaitlists : findAllWaitlists,
    findWaitlistsByOwner : findWaitlistsByOwner,
    findItemByPilot : findItemByPilot
}

function findItemByOrder(order){
    return models.WaitlistItem.find({where:{order:order}}).then(assertObject);
}

function findItemByPilot(waitlistId,pilotId){
    return findWaitlistByExternalId(waitlistId)
        .then(function (waitlist) {
            return models.WaitlistItem.findOne({where:{waitlistId:waitlist.id,pilotId:pilotId}})
        })
        .then(assertObject)
}

function addToItem(item,shipId,shipType,shipDNA,shipName,role){
    return createFitting(shipId,shipName,shipDNA,shipType,role)
        .then(function (fitting) {
            return item.addFitting(fitting);
        })
}

function addToWaitlist(pilotId,externalId,shipId,shipType,shipDNA,shipName,role){

    if(!(shipDNA && shipType && shipName)){
       return Q.reject(new Error("Ship not fully defined: " + shipDNA + ' '+ shipType + ' ' + shipName));
    }

    return Q.all([findPilotById(pilotId).then(assertObject),findWaitlistByExternalId(externalId).then(assertObject)])
        .spread(function (pilot, waitlist) {
            return models.WaitlistItem.findOrCreate({where:{waitlistId:waitlist.id,pilotId:pilot.id}})
                .spread(function (item,created) {
                    var promise = item;
                    if(created){
                        promise = item.setPilot(pilot)
                            .then(function () {
                                return item.setWaitlist(waitlist)
                            })
                            .then(function () {
                                return item;
                            })
                    }
                    return promise;
                })
                .then(function (item) {
                    return createFitting(shipId,shipName,shipDNA,shipType,role)
                        .then(function (fitting) {
                            return item.addFitting(fitting)
                        })
                        .then(function () {
                            return item.setWaitlist(waitlist)
                        })
                        .then(function () {
                            return waitlist.addItem(item)
                        })
                        .then(function () {
                            return item;
                        });
                })
        })
}

function createFitting(shipId,name,dna,type,role){
    return models.ShipFitting.create({
        shipId: shipId,
        name: name,
        dna: dna,
        type: type,
        role:role
    });
}

// Eager load entire list
function findWaitlistByExternalId(externalId){
    return models.Waitlist.find({ where: {externalId: externalId},
        include: [{ model: models.WaitlistItem, as: 'items', include: [{model: models.Pilot}]},{ model: models.Pilot, as:'owner'}],
        order: [ [ models.WaitlistItem, 'order' ] ]})
        .then(assertObject);
}

// Eager load entire list
function findWaitlistsByOwner(pilotId){
    return models.Waitlist.findAll({ where: {ownerId: pilotId}});
}

// Eager load entire list
function findAllWaitlists(){
    return models.Waitlist.findAll({
        include: [{ model: models.WaitlistItem, as: 'items' }],
        order: [ [ models.WaitlistItem, 'order' ] ]})
        .then(assertObject);
}

function createWaitlist(pilotId){
    return findPilotById(pilotId)
        .then(function (pilot) {
            var externalId = minions.randomAlphanumericString(EXTERNAL_ID_LENGTH);
            var name = pilot.name + '`s waitlist';
            return Q.all([models.Waitlist.create({externalId:externalId, name:name}), Q.fulfill(pilot)]);
        })
        .spread(function (waitlist,pilot) {
            return waitlist.setOwner(pilot)
                .then(function () {
                    return findWaitlistByExternalId(waitlist.externalId);
                })
        })
}

function assertObject(obj){
    return obj ? Q.fulfill(obj) : Q.reject(new Error('Object not valid: ' + obj));
}

function findPilotById(id){
    return models.Pilot.find({ where: {id: id}, include: [{ all: true, nested: true }]})
        .then(assertObject);
}

function findAllPilots() {
    // EAGER
    return models.Pilot.findAll({ include: [{ all: true, nested: true }]})
}

function findOrCreatePilot(pilot){
    // not all pilots have alliances!
    var promises = [];
    promises.push(models.Pilot.findOrCreate({ where: {id: pilot.characterID.content} ,defaults: {name: pilot.characterName.content}}));
    promises.push(models.Corp.findOrCreate({ where: {id: pilot.corporationID.content} ,defaults: {name: pilot.corporation.content}}));
    if(pilot.allianceID && pilot.allianceID!='0') {
        promises.push(models.Alliance.findOrCreate({where: {id: pilot.allianceID.content}, defaults: {name: pilot.alliance.content}}));
    }
    return Q.all(promises).spread(function (pilot,corp,alliance) {
        var promises = [];
        pilot = pilot[0];
        corp  = corp[0];
        if(alliance){
            alliance = alliance.shift();
            promises.push(corp.setAlliance(alliance))
        }
        promises.push(pilot.setCorp(corp));
        return Q.all(promises).then(function () {
            return pilot;
        })
    })
}
