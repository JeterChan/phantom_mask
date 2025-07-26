'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PharmacyOpeningHour extends Model {
    static associate(models) {
      // 1. 每個時段只屬於一間 pharmacy
      this.belongsTo(models.Pharmacy, { foreignKey: 'pharmacyId' });
    }
  }
  PharmacyOpeningHour.init({
    pharmacyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Pharmacies', // 對應到資料表名稱
        key: 'id',
      },
      onDelete: 'CASCADE'
    },
    weekday: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'PharmacyOpeningHour',
    tableName: 'pharmacy_opening_hours',
  });
  return PharmacyOpeningHour;
};