/**
 * Created by Thomas on 11.04.2015.
 */



// Or you can simply use a connection uri
var Sequelize = require('sequelize');
var Q = require('q');

var sequelize = new Sequelize('sqlite://nemesis.sqlite');

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


var WaitlistItem = sequelize.define('waitlistItem', {
    order: {
        type: Sequelize.INTEGER
    },
    fitting: {
        type: Sequelize.STRING
    }
}, {});


Corp.belongsTo(Alliance);
Pilot.belongsTo(Corp);
WaitlistItem.belongsTo(Pilot);



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

module.exports = {
    connect : function () {
        return sequelize.sync();
    },
    findOrCreatePilot : function(pilot){
        // not all pilots have alliances!
        var promises = [];
        promises.push(Pilot.findOrCreate({ where: {id: pilot.characterID} ,defaults: {name: pilot.name}}));
        promises.push(Corp.findOrCreate({ where: {id: pilot.corporationID} ,defaults: {name: pilot.corporationName}}));
        if(pilot.allianceID && pilot.allianceID!='0') {
            promises.push(Alliance.findOrCreate({where: {id: pilot.allianceID}, defaults: {name: pilot.allianceName}}));
        }else{
            promises.push(Q.fulfill(null));
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
    },
    findAllPilots : function() {
        // EAGER
        return Pilot.findAll({ include: [{ all: true, nested: true }]})
    }
}

module.exports.connect()
    .then(function () {
        return module.exports.findOrCreatePilot({
            name: 'Thomion',
            characterID: '698922015',
            corporationName: 'Deep Core Mining Inc.',
            corporationID: '1000006',
            allianceID: '0',
            allianceName: '',
            factionID: '0',
            factionName: ''});
    }).then(function () {
        return module.exports.findAllPilots();
    }).then(function (pilots) {
        console.log('Pilots:' + JSON.stringify(pilots,null,2))
        return pilots;
    })