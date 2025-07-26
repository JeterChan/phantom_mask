'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PharmacyMask extends Model {
    static associate(models) {
      // PharmacyMask -> Pharmacy (many-to-one)
      this.belongsTo(models.Pharmacy, { foreignKey: 'pharmacyId'});
      // PharmacyMask -> Mask (many-to-one)
      this.belongsTo(models.Mask, { foreignKey: 'maskId'});
    }
  }
  PharmacyMask.init({
    pharmacyId: {
      type:DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Pharmacies',
        key: 'id'
      },
      onDelete: 'CASCADE',
    },
    maskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Masks',
        key: 'id'
      },
      onDelete: 'CASCADE',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'PharmacyMask',
    tableName: 'pharmacy_masks'
  });
  return PharmacyMask;
};