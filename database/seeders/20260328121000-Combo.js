'use strict';

const { devProducts } = require('./20240413052139-Product');

const devCombos = [
  {
    id: '903a6bc1-b541-4c12-9c3f-7e5025fbc746',
    name: 'Starter Mix',
    description: 'Simple starter combo',
    costPrice: 25,
    sellingPrice: 40,
    image: 'https://placehold.co/150x100?text=image%20not%20found',
    createdAt: new Date().toISOString(),
  },
];

const devComboItems = [
  {
    id: '311e4567-e89b-12d3-a456-426614174111',
    comboId: devCombos[0].id,
    productId: devProducts[0].id,
    number: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: '322e4567-e89b-12d3-a456-426614174222',
    comboId: devCombos[0].id,
    productId: devProducts[1].id,
    number: 1,
    createdAt: new Date().toISOString(),
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');
    const combos = isDevelopment ? devCombos : [];

    if (combos.length > 0) {
      await queryInterface.bulkInsert('Combos', combos, {});
      await queryInterface.bulkInsert('ComboItems', devComboItems, {});
    }
  },

  async down(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');
    if (!isDevelopment) return;

    await queryInterface.bulkDelete('ComboItems', { id: devComboItems.map((item) => item.id) }, {});
    await queryInterface.bulkDelete('Combos', { id: devCombos.map((m) => m.id) }, {});
  },
};
