"use strict";

module.exports = function(sequelize, DataTypes) {
    var Corp = sequelize.define('Corp', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING
        }
    }, {
        classMethods: {
            associate: function(models) {
                Corp.belongsTo(models.Alliance);
            }
        }
    });

    return Corp;
};