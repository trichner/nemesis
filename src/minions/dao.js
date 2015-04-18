/**
 * Created by Thomas on 11.04.2015.
 */



// Or you can simply use a connection uri
var Sequelize = require('sequelize');
var Q = require('q');
var minions = require('./Minions');

var sequelize = new Sequelize('sqlite://nemesis.sqlite');

var EXTERNAL_ID_LENGTH = 32;

var Corp = sequelize.define('corp', {
    id: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    }
}, {});

var Alliance = sequelize.define('alliance', {
    id: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    }
}, {});

var Pilot = sequelize.define('pilot', {
    id: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    }
},{});


var WaitlistItem = sequelize.define('item', {
    order: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    shipId: {
        type: Sequelize.STRING
    },
    shipName: {
        type: Sequelize.STRING
    },
    shipDNA: {
        type: Sequelize.STRING
    },
    shipType: {
        type: Sequelize.STRING
    }
}, {});

var Waitlist = sequelize.define('waitlist', {
    name: {
        type: Sequelize.STRING
    },
    externalId: {
        type: Sequelize.STRING
    }
}, {});


Corp.belongsTo(Alliance);
Pilot.belongsTo(Corp);
WaitlistItem.belongsTo(Pilot);
Waitlist.belongsTo(Pilot, {as: 'owner'});
Waitlist.hasMany(WaitlistItem);

/*
 pilot:
 {
 name: 'Thomion',
 characterID: '698922015',
 corporationName: 'Deep Core Mining Inc.',
 corporationID: '1000006',
 allianceID: '0',
 allianceName: '',
 factionID: '0',
 factionName: ''
 }
 */
sequelize.sync();

module.exports = {
    connect : connect,
    findOrCreatePilot : findOrCreatePilot,
    findAllPilots : findAllPilots,
    findPilotById : findPilotById,
    createWaitlist: createWaitlist,
    findWaitlistByExternalId : findWaitlistByExternalId,
    addToWaitlist : addToWaitlist,
    findItemByOrder : findItemByOrder,
    findAllWaitlists : findAllWaitlists,
    findWaitlistsByOwner : findWaitlistsByOwner
}

function connect(){
    return sequelize.sync();
}

function findItemByOrder(order){
    return WaitlistItem.find({where:{order:order}}).then(assertObject);
}

function addToWaitlist(pilotId,externalId,shipId,shipType,shipDNA,shipName){

    if(!(shipDNA && shipType && shipName)){
       return Q.reject(new Error("Ship not fully defined: " + shipDNA + ' '+ shipType + ' ' + shipName));
    }

    return findPilotById(pilotId)
        .then(function (pilot) {
            return Q.all([pilot,findWaitlistByExternalId(externalId).then(assertObject)]);
        })
        .spread(function (pilot, waitlist) {
            return WaitlistItem.create({
                shipId: shipId,
                shipName: shipName,
                shipDNA: shipDNA,
                shipType: shipType
                })
                .then(function (item) {
                    return item.setPilot(pilot).then(function () {
                        return item;
                    })
                })
                .then(function (item) {
                    return waitlist.addItem(item)
                        .then(function () {
                            return item;
                        });
                })
        })
}

// Eager load entire list
function findWaitlistByExternalId(externalId){
    return Waitlist.find({ where: {externalId: externalId},
        include: [{ model: WaitlistItem, as: 'items', include: [{model: Pilot}]},{ model: Pilot, as:'owner'}],
        order: [ [ WaitlistItem, 'order' ] ]})
        .then(assertObject);
}

// Eager load entire list
function findWaitlistsByOwner(pilotId){
    return Waitlist.findAll({ where: {owner: pilotId}});
}

// Eager load entire list
function findAllWaitlists(){
    return Waitlist.findAll({
        include: [{ model: WaitlistItem, as: 'items' }],
        order: [ [ WaitlistItem, 'order' ] ]})
        .then(assertObject);
}

function createWaitlist(pilotId){
    return findPilotById(pilotId)
        .then(function (pilot) {
            var externalId = minions.randomAlphanumericString(EXTERNAL_ID_LENGTH);
            var name = pilot.name + '`s waitlist';
            return Q.all([Waitlist.create({externalId:externalId, name:name}), Q.fulfill(pilot)]);
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
    return Pilot.find({ where: {id: id}, include: [{ all: true, nested: true }]})
        .then(assertObject);
}

function findAllPilots() {
    // EAGER
    return Pilot.findAll({ include: [{ all: true, nested: true }]})
}

function findOrCreatePilot(pilot){
    // not all pilots have alliances!
    console.log('Persisting: '+JSON.stringify(pilot))
    var promises = [];
    promises.push(Pilot.findOrCreate({ where: {id: pilot.characterID.content} ,defaults: {name: pilot.characterName.content}}));
    promises.push(Corp.findOrCreate({ where: {id: pilot.corporationID.content} ,defaults: {name: pilot.corporation.content}}));
    if(pilot.allianceID && pilot.allianceID!='0') {
        promises.push(Alliance.findOrCreate({where: {id: pilot.allianceID.content}, defaults: {name: pilot.alliance.content}}));
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