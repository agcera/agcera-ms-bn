'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'Transactions',
      [
        {
          // This should always be there. It is the main store main
          id: 'a90c1a62-5e1d-4bf7-b902-8d74c89644d1',
          amount: 1200,
          description: 'Initial deposit',
          storeId: '143e4667-a81d-12d3-c356-469311174300',
          userId: '8215a8ea-cf39-4037-81e6-86f6b439dcf4',
          type: 'EXPENSE',
          createdAt: new Date().toISOString(),
        },


        // Store 2
        {
          id: 'd2fe9b71-6fa2-49c8-b556-5f7a76ebaa8f',
          amount: 3200,
          storeId: '143e4667-a81d-12d3-c356-469311174301',
          description: 'Initial deposit',
          userId: '8215a8ea-cf39-4037-81e6-86f6b439dcf4',
          type: 'INCOME',
          createdAt: new Date().toISOString(),
        },


        // store 3
        {
          id: 'f1d8d843-36b7-462e-9b05-409a1db4a9d7',
          amount: 9002,
          storeId: '143e4667-a81d-12d3-c356-469311174302',
          description: 'Initial deposit',
          userId: '8215a8ea-cf39-4037-81e6-86f6b439dcf4',
          type: 'INCOME',
          createdAt: new Date().toISOString(),
        },
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Transactions', null, {});
  },
};
