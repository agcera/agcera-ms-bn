
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Deleteds', {
      // id: {
      //   unique: true,
      //   allowNull: false,
      //   primaryKey: true,
      //   type: Sequelize.UUID,
      //   defaultValue: Sequelize.UUIDV4,
      // },
      // description: {
      //   allowNull: false,
      //   type: Sequelize.TEXT,
      // },
      // table: {
      //   allowNull: false,
      //   type: Sequelize.STRING,
      // },
      // deletedBy: {
      //   allowNull: false,
      //   typed: Sequelize.TEXT
      // },
      // createdAt: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      //   defaultValue: Sequelize.NOW,
      // },
      // updatedAt: Sequelize.DATE ,
      // deletedAt: Sequelize.DATE

    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Deleteds');
  },
};



