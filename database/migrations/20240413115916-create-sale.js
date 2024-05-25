'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sales', {
      id: {
        unique: true,
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      paymentMethod: {
        allowNull: false,
        type: Sequelize.ENUM('M-PESA', 'E-MOLA', 'P.O.S', 'BANCO BIM', 'BANCO BCI', 'CASH'),
        defaultValue: 'MOMO',
      },
      clientId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Clients',
          key: 'id',
        }
      },
      storeId: {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        references: {
          model: 'Stores',
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      refundedAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Sales');
  },
};
