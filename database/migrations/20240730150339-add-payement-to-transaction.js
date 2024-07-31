'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Transactions', 'paymentMethod', {
        allowNull: true,
        type: Sequelize.ENUM('M-PESA', 'E-MOLA', 'P.O.S', 'BANCO BIM', 'BANCO BCI', 'CASH'),
    });
    await queryInterface.addColumn('Transactions', 'checked', {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Transactions', 'paymentMethod');
    await queryInterface.removeColumn('Transactions', 'checked');


  }
};
