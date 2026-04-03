'use strict';

const baseClients = [];
const devClients = [
  {
    id: 'a90c1a62-5e1d-4bf7-b902-8d74c89644d9',
    name: 'John Doe',
    phone: '+123234234239',
    isMember: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a90c1a62-5e1d-4bf7-b902-8d74c89644d3',
    name: 'Hene James',
    phone: '+123234234240',
    isMember: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a90c1a62-5e1d-4bf7-b902-8d74c89644d4',
    name: 'Jane Doe',
    phone: '+123234234241',
    isMember: false,
    createdAt: new Date().toISOString(),
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  baseClients,
  devClients,
  async up(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const clients = isDevelopment ? baseClients.concat(devClients) : baseClients;

    if (clients.length > 0) {
      await queryInterface.bulkInsert('Clients', clients, {});
    }
  },

  async down(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const clientIds = (isDevelopment ? baseClients.concat(devClients) : baseClients).map((client) => client.id);

    if (clientIds.length > 0) {
      await queryInterface.bulkDelete('Clients', { id: clientIds }, {});
    }
  },
};
