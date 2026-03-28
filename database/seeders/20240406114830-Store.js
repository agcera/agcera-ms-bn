'use strict';

const baseStores = [
  {
    // This should always be there. It is the main store
    id: '143e4667-a81d-12d3-c356-469311174300',
    name: 'main',
    location: 'Maputo 12',
    phone: '+258840000000',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'expired',
    location: 'Maputo 14',
    phone: '+323343455463',
    isActive: false,
    createdAt: new Date().toISOString(),
  },
];

const devStores = [
  {
    id: '143e4667-a81d-12d3-c356-469311174301',
    name: 'Store 2',
    location: 'Maputo 13',
    phone: '+258840000001',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '143e4667-a81d-12d3-c356-469311174302',
    name: 'Store 3',
    location: 'Maputo 14',
    phone: '+258840000002',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const isDevelopment = (process.env.NODE_ENV ?? 'development') === 'development';

    const stores = isDevelopment ? baseStores.concat(devStores) : baseStores;

    if (stores.length > 0) {
      await queryInterface.bulkInsert('Stores', stores, {});
    }
  },

  async down(queryInterface) {
    const isDevelopment = (process.env.NODE_ENV ?? 'development') === 'development';

    const storeIds = (isDevelopment ? baseStores.concat(devStores) : baseStores).map((store) => store.id);

    if (storeIds.length > 0) {
      await queryInterface.bulkDelete('Stores', { id: storeIds }, {});
    }
  },
};
