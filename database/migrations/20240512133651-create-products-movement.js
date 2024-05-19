
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductsMovements', {
      id: {
        unique: true,
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      quantity: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      productId: {
        allowNull:false,
        type: Sequelize.UUID,
        references: {
          model: 'Products',
          key: 'id'
        }
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
      },

      from: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Stores',
          key: 'id',
        },
      },
      to: {
        allowNull: false,
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
    await queryInterface.dropTable('ProductsMovements');
  },
};



