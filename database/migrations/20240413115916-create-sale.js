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
        type: Sequelize.ENUM('CASH', 'MOMO'),
        defaultValue: 'MOMO',
      },
      clientId: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      clientType: {
        allowNull: false,
        type: Sequelize.ENUM('USER', 'CLIENT'),
        defaultValue: 'USER',
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
      updatedAt: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Sales');
  },
};
