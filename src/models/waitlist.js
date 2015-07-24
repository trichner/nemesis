"use strict";

module.exports = function(sequelize, DataTypes) {

  var Waitlist = sequelize.define('Waitlist', {
    name: {
      type: DataTypes.STRING
    },
    externalId: {
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        Waitlist.belongsTo(models.Pilot, {as: 'owner'});
        Waitlist.hasMany(models.WaitlistItem);
      }
    }
  });

  return Waitlist;
};
