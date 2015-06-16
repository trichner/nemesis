module.exports = function (sequelize) {

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
    }, {});


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
}