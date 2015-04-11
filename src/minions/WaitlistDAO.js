/**
 * Created by Thomas on 11.04.2015.
 */



// Or you can simply use a connection uri
var Sequelize = require('sequelize');
var sequelize = new Sequelize('sqlite://nemesis.sqlite');

var Corp = sequelize.define('corp', {
    corpId: {
        type: Sequelize.STRING
    },
    corpName: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true
});

var Alliance = sequelize.define('alliance', {
    allianceId: {
        type: Sequelize.STRING
    },
    allianceName: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

Alliance.hasOne(Corp)

var Character = sequelize.define('alliance', {
    characterId: {
        type: Sequelize.STRING
    },
    characterName: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

Corp.hasOne(Character)

var WaitlistItem = sequelize.define('user', {
    firstName: {
        type: Sequelize.STRING,
        field: 'first_name' // Will result in an attribute that is firstName when user facing but first_name in
                            // the database
    },
    lastName: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

sequelize.sync().done(function () {

})