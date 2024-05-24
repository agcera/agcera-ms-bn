
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        unique: true,
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL,
      },
      description: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM('INCOME', 'EXPENSE')
      },
      userId: {
        allowNull: true,
        type: Sequelize.UUID,
        onDelete: 'SET NULL',
        references: {
          model: 'Users',
          key: 'id',
        },
      },

      storeId: {
        allowNull: true,
        onDelete: 'SET NULL',
        type: Sequelize.UUID,
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
      updatedAt: Sequelize.DATE ,
      deletedAt: Sequelize.DATE

    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Transactions');
  },
};



