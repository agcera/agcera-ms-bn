'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'Deleteds',
      [
        {
          // This should always be there. It is the main store main
          id: '3b07d2f3-89fa-4e94-bb11-5369ff9ddbd7',
          userId: '8215a8ea-cf39-4037-81e6-86f6b439dcf4',
          description: 'I am not sure why I deleted this store',
          table: 'stores',
          createdAt: new Date(),
        },


        // Store 2
        {
          id: '8db3f450-3ab5-41e5-94d2-d5106930c4ad',
          description: 'why the hell did I delete this sale?',
          userId: '8215a8ea-cf39-4037-81e6-86f6b439dcf4',
          table: 'sales',
          createdAt: new Date(),
        },


        // store 3
        {
          id: 'f1d8d843-36b7-462e-9b05-409a1db4a9d7',
          description: 'I am not sure why I deleted this transaction',
          userId: '8215a8ea-cf39-4037-81e6-86f6b439dcf4',
          table: 'transactions',
          createdAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Deleteds', null, {});
  },
};
