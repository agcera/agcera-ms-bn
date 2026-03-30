// Const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt');
const { baseStores, devStores } = require('./20240406114830-Store');

const baseUsers = [
  {
    id: '8215a8ea-cf39-4037-81e6-86f6b439dcf4',
    name: 'Olivier Kwizera',
    email: 'acv.olivio@gmail.com',
    password: bcrypt.hashSync('1234', bcrypt.genSaltSync(10)),
    storeId: baseStores[0].id,
    phone: '+258865541505',
    role: 'admin',
    createdAt: new Date(),
  },
];

const devUsers = [
  {
    id: '8215a8ea-cf39-4037-81e6-86f6b439dcf5',
    name: 'keeper 1',
    email: 'keeper1@gmail.com',
    password: bcrypt.hashSync('1234', bcrypt.genSaltSync(10)),
    storeId: devStores[0].id,
    phone: '+123456789024',
    role: 'keeper',
    createdAt: new Date(),
  },
  {
    id: '8215a8ea-cf39-4037-81e6-86f6b439dcf6',
    name: 'keeper 2',
    email: 'keeper2@gmail.com',
    password: bcrypt.hashSync('1234', bcrypt.genSaltSync(10)),
    storeId: devStores[1].id,
    phone: '+123456789025',
    role: 'keeper',
    createdAt: new Date(),
  },
  {
    id: '8215a8ea-cf39-4037-81e6-86f6b439dcf7',
    name: 'user 1',
    email: 'user1@gmail.com',
    password: bcrypt.hashSync('1234', bcrypt.genSaltSync(10)),
    storeId: devStores[0].id,
    phone: '+123456789026',
    role: 'user',
    createdAt: new Date(),
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  baseUsers,
  devUsers,
  async up(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const users = isDevelopment ? baseUsers.concat(devUsers) : baseUsers;

    if (users.length > 0) {
      await queryInterface.bulkInsert('Users', users, {});
    }
  },
  async down(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const userIds = (isDevelopment ? baseUsers.concat(devUsers) : baseUsers).map((user) => user.id);

    if (userIds.length > 0) {
      await queryInterface.bulkDelete('Users', { id: userIds }, {});
    }
  },
};
