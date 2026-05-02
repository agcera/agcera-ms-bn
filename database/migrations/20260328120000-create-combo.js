'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Combos', {
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
        unique: true,
      },
      image: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'https://placehold.co/150x100?text=image%20not%20found',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'Combo description',
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
    await queryInterface.dropTable('Combos');
  },
};
