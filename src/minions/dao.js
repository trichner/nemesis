/**
 * Created by Thomas on 11.04.2015.
 */

//---- Init DB Connection
var Sequelize = require('sequelize');
var Q = require('q');
var minions = require('./Minions');

var sequelize = new Sequelize(
    'mysql://nemesis:1234@localhost:3306/nemesis', // HARDCODED for now
    {
        logging: false,
        pool: {
            // Set maxIdleTime to 10 seconds. Otherwise, it kills transactions that are open for long.
            maxIdleTime: 10000
        }
    });

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
    }
}, {});

var ShipFitting = sequelize.define('fitting', {
    shipId: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    },
    dna: {
        type: Sequelize.STRING
    },
    type: {
        type: Sequelize.STRING
    },
    role: {
        type: Sequelize.STRING
    }
}, {});

var Waitlist = sequelize.define('waitlist', {
    name: {
        type: Sequelize.STRING
    },
    externalId: {
        type: Sequelize.STRING
    },
    lastActivityAt: {
        type: Sequelize.DATE
    }
}, {});


//---- Relations
Corp.belongsTo(Alliance);
Pilot.belongsTo(Corp);
WaitlistItem.belongsTo(Pilot);
WaitlistItem.belongsTo(Waitlist);
Waitlist.belongsTo(Pilot, {as: 'owner'});
Waitlist.hasMany(WaitlistItem);
WaitlistItem.hasMany(ShipFitting);

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
    findWaitlistsByOwner : findWaitlistsByOwner,
    findItemByPilot : findItemByPilot,
    updateWatilistLastActivityByExternalId : updateWatilistLastActivityByExternalId
}

function connect(){
    return sequelize.sync();
}

function findItemByOrder(order){
    return WaitlistItem.find({where:{order:order}}).then(assertObject);
}

function findItemByPilot(waitlistId,pilotId){
    return findWaitlistByExternalId(waitlistId)
        .then(function (waitlist) {
            return WaitlistItem.findOne({where:{waitlistId:waitlist.id,pilotId:pilotId}})
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
            return WaitlistItem.findOrCreate({where:{waitlistId:waitlist.id,pilotId:pilot.id}})
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
                            return waitlist.updateAttributes({lastActivityAt: sequelize.fn('NOW')});
                        })
                        .then(function () {
                            return item;
                        });
                })
        })
}

function createFitting(shipId,name,dna,type,role){
    return ShipFitting.create({
        shipId: shipId,
        name: name,
        dna: dna,
        type: type,
        role:role
    });
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
    return Waitlist.findAll({ where: {ownerId: pilotId}});
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
            return Q.all([Waitlist.create({externalId:externalId, name:name,lastActivityAt:new Date()}), Q.fulfill(pilot)]);
        })
        .spread(function (waitlist,pilot) {
            return waitlist.setOwner(pilot)
                .then(function () {
                    return findWaitlistByExternalId(waitlist.externalId);
                })
        })
}

function updateWatilistLastActivityByExternalId(waitlistId){
    return findWaitlistByExternalId(waitlistId)
        .then(function (waitlist) {
            return waitlist.updateAttributes({lastActivityAt: sequelize.fn('NOW')});
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
