'use strict';

const { devProducts } = require('./20240413052139-Product');
const { baseStores, devStores } = require('./20240406114830-Store');
const { baseUsers } = require('./20240406114834-User');

const baseMovements = [];
const devMovements = [
  {
    // This should always be there. It is the main store main
    id: 'a90c1a62-5e1d-4bf7-b902-8d74c89644d1',
    quantity: 12,
    to: baseStores[0].id,
    from: baseStores[0].id,
    productId: devProducts[3].id,
    userId: baseUsers[0].id,
    createdAt: new Date().toISOString(),
  },
  // Store 2
  {
    id: 'd2fe9b71-6fa2-49c8-b556-5f7a76ebaa8f',
    quantity: 12,
    from: baseStores[0].id,
    to: devStores[0].id,
    productId: devProducts[3].id,
    userId: baseUsers[0].id,
    createdAt: new Date().toISOString(),
  },
  // store 3
  {
    id: 'f1d8d843-36b7-462e-9b05-409a1db4a9d7',
    quantity: 12,
    from: baseStores[0].id,
    to: devStores[1].id,
    productId: devProducts[3].id,
    userId: baseUsers[0].id,
    createdAt: new Date().toISOString(),
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  baseMovements,
  devMovements,
  async up(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const movements = isDevelopment ? baseMovements.concat(devMovements) : baseMovements;

    if (movements.length > 0) {
      await queryInterface.bulkInsert('ProductsMovements', movements, {});
    }
  },

  async down(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const movementIds = (isDevelopment ? baseMovements.concat(devMovements) : baseMovements).map(
      (movement) => movement.id
    );

    if (movementIds.length > 0) {
      await queryInterface.bulkDelete('ProductsMovements', { id: movementIds }, {});
    }
  },
};
