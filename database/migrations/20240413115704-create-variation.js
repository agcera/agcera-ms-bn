'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Variations', {
      id: {
        unique: true,
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate:{
          min: 1
        }
      },
      costPrice: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      sellingPrice: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        validate: {
          isGreaterThanCostPrice(value) {
            if (this.costPrice > value) {
              throw new Error('Selling price must be greater than cost price');
            }
          },
        },
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('Variations');
  },
};
