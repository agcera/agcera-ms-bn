'use strict';

const { devProducts } = require('./20240413052139-Product');

const devMixtures = [
  {
    id: '903a6bc1-b541-4c12-9c3f-7e5025fbc746',
    name: 'Starter Mix',
    description: 'Simple starter mixture',
    costPrice: 25,
    sellingPrice: 40,
    image: 'https://placehold.co/150x100?text=image%20not%20found',
    createdAt: new Date().toISOString(),
  },
];

const devMixtureItems = [
  {
    id: '311e4567-e89b-12d3-a456-426614174111',
    mixtureId: devMixtures[0].id,
    productId: devProducts[0].id,
    number: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: '322e4567-e89b-12d3-a456-426614174222',
    mixtureId: devMixtures[0].id,
    productId: devProducts[1].id,
    number: 1,
    createdAt: new Date().toISOString(),
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');
    const mixtures = isDevelopment ? devMixtures : [];

    if (mixtures.length > 0) {
      await queryInterface.bulkInsert('Mixtures', mixtures, {});
      await queryInterface.bulkInsert('MixtureItems', devMixtureItems, {});
    }
  },

  async down(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');
    if (!isDevelopment) return;

    await queryInterface.bulkDelete('MixtureItems', { id: devMixtureItems.map((item) => item.id) }, {});
    await queryInterface.bulkDelete('Mixtures', { id: devMixtures.map((m) => m.id) }, {});
  },
};
