'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PurchaseHistory extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'userId'});
      this.belongsTo(models.Pharmacy, { foreignKey: 'pharmacyId'});
      this.belongsTo(models.Mask, { foreignKey: 'maskId'});
    }
  }
  PurchaseHistory.init({
    userId: DataTypes.INTEGER,
    pharmacyId: DataTypes.INTEGER,
    maskId: DataTypes.INTEGER,
    transactionAmount: DataTypes.DECIMAL,
    transactionDate: DataTypes.DATE,
    quantity:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PurchaseHistory',
    tableName: 'purchase_histories',
    indexes: [
      {
        fields: ['transactionDate']
      }
    ]
  });
  return PurchaseHistory;
};