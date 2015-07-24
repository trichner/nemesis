"use strict";

module.exports = function(sequelize, DataTypes) {
  var ShipFitting = sequelize.define('ShipFitting', {
    shipId: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    dna: {
      type: DataTypes.STRING
    },
    type: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {

      }
    }
  });

  return ShipFitting;
};
