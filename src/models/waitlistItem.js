"use strict";

module.exports = function(sequelize, DataTypes) {
  var WaitlistItem = sequelize.define('WaitlistItem', {
    order: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        WaitlistItem.belongsTo(models.Pilot);
        WaitlistItem.belongsTo(models.Waitlist);
        WaitlistItem.hasMany(models.ShipFitting);
      }
    }
  });

  return WaitlistItem;
};
