'use strict';

const { paymentMethodsEnum } = require('./20240413115916-create-sale');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Transactions', 'paymentMethod', {
      allowNull: true,
      type: Sequelize.ENUM(...paymentMethodsEnum),
    });
    await queryInterface.addColumn('Transactions', 'checked', {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Transactions', 'paymentMethod');
    await queryInterface.removeColumn('Transactions', 'checked');
  },
};
