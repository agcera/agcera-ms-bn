/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
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
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          min: 4,
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      image: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'https://via.placeholder.com/150?text=image%20not%20found',
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      gender: {
        type: Sequelize.ENUM('MALE', 'FEMALE', 'UNSPECIFIED'),
        allowNull: false,
        defaultValue: 'UNSPECIFIED',
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Maputo Center',
      },
      role: {
        type: Sequelize.ENUM('admin', 'keeper'),
        allowNull: false,
        defaultValue: 'keeper',
      },
      storeId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Stores',
          key: 'id',
        },
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
  async down (queryInterface) {
    await queryInterface.dropTable('Users');
  },
};
