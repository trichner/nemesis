"use strict";

module.exports = function(sequelize, DataTypes) {
  var Alliance = sequelize.define('Alliance', {
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

      }
    }
  });

  return Alliance;
};
