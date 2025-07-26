'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pharmacy extends Model {
    static associate(models) {
      // Pharmacy <-> Mask (many-to-many through PharmacyMask)
      this.belongsToMany(models.Mask, {
        through: models.PharmacyMask,
        foreignKey: 'pharmacyId',
        otherKey: 'maskId',
      });

      // Pharmacy -> PharmacyMask (one-to-many)
      this.hasMany(models.PharmacyMask, {
        foreignKey: 'pharmacyId'
      });

      this.hasMany(models.PurchaseHistory, { foreignKey: 'pharmacyId'});
    }
  }
  Pharmacy.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique:  true
    },
    cashBalance: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    openingHours: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Pharmacy',
    tableName: 'pharmacies'
  });
  return Pharmacy;
};