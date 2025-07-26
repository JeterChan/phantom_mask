'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.PurchaseHistory, { foreignKey: 'userId'});
    }
  }
  User.init({
    name: DataTypes.STRING,
    cashBalance: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
  });
  return User;
};