'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('purchase_histories', ['transactionDate'], {
      name: 'idx_purchase_histories_transactionDate'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('purchase_histories', 'idx_purchase_histories_transactionDate');
  }
};
