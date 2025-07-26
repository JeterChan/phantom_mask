'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mask extends Model {
    static associate(models) {
      // Mask <-> Pharmacy (many-to-many through PharmacyMask)
      this.belongsToMany(models.Pharmacy, {
        through: models.PharmacyMask,
        foreignKey: 'maskId',
        otherKey: 'pharmacyId',
      });
      // Mask -> PharmacyMask (one-to-many)
      this.hasMany(models.PharmacyMask, { foreignKey: 'maskId' });

      this.hasMany(models.PurchaseHistory, { foreignKey: 'maskId' });
    }
  }
  Mask.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Mask',
    tableName: 'masks'
  });
  return Mask;
};