"use strict";

module.exports = function(sequelize, DataTypes) {
  var Pilot = sequelize.define('Pilot', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    }
  },{
    classMethods: {
      associate: function(models) {
        Pilot.belongsTo(models.Corp);
      }
    }
  });

  return Pilot;
};
