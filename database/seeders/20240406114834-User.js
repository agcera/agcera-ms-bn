// Const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt');

const baseUsers = [
  {
    id: '8215a8ea-cf39-4037-81e6-86f6b439dcf4',
    name: 'Olivier Kwizera',
    email: 'acv.olivio@gmail.com',
    password: bcrypt.hashSync('1234', bcrypt.genSaltSync(10)),
    storeId: '143e4667-a81d-12d3-c356-469311174300',
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
    storeId: '143e4667-a81d-12d3-c356-469311174301',
    phone: '+123456789024',
    role: 'keeper',
    createdAt: new Date(),
  },
  {
    id: '8215a8ea-cf39-4037-81e6-86f6b439dcf6',
    name: 'keeper 2',
    email: 'keeper2@gmail.com',
    password: bcrypt.hashSync('1234', bcrypt.genSaltSync(10)),
    storeId: '143e4667-a81d-12d3-c356-469311174302',
    phone: '+123456789025',
    role: 'keeper',
    createdAt: new Date(),
  },
  {
    id: '8215a8ea-cf39-4037-81e6-86f6b439dcf7',
    name: 'user 1',
    email: 'user1@gmail.com',
    password: bcrypt.hashSync('1234', bcrypt.genSaltSync(10)),
    storeId: '143e4667-a81d-12d3-c356-469311174301',
    phone: '+123456789026',
    role: 'user',
    createdAt: new Date(),
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const isDevelopment = (process.env.NODE_ENV ?? 'development') === 'development';

    const users = isDevelopment ? baseUsers.concat(devUsers) : baseUsers;

    if (users.length > 0) {
      await queryInterface.bulkInsert('Users', users, {});
    }
  },
  async down(queryInterface) {
    const isDevelopment = (process.env.NODE_ENV ?? 'development') === 'development';

    const userIds = (isDevelopment ? baseUsers.concat(devUsers) : baseUsers).map((user) => user.id);

    if (userIds.length > 0) {
      await queryInterface.bulkDelete('Users', { id: userIds }, {});
    }
  },
};
