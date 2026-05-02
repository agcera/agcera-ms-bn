'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ComboItems', {
      id: {
        unique: true,
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      comboId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Combos',
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

    await queryInterface.addIndex('ComboItems', ['comboId', 'productId'], {
      unique: true,
      name: 'combo_items_unique_combo_product',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ComboItems');
  },
};
