'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MixtureItems', {
      id: {
        unique: true,
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      mixtureId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Mixtures',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.addIndex('MixtureItems', ['mixtureId', 'productId'], {
      unique: true,
      name: 'mixture_items_unique_mixture_product',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('MixtureItems');
  },
};
