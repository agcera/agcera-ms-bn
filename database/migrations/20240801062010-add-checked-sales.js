'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Sales', 'checkedAt', {
      allowNull: true,
      type: Sequelize.DATE,
    });
    await queryInterface.addColumn('Stores', 'lastCollectedAt', {
      allowNull: true,
      type: Sequelize.DATE,
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('Sales', 'checkedAt');
    await queryInterface.removeColumn('Stores', 'lastCollectedAt');
  }
};
