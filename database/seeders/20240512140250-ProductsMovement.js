'use strict';
/* eslint-disable @typescript-eslint/no-unused-vars */

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  async up(queryInterface) {
    // await queryInterface.bulkInsert(
    //   'ProductsMovements',
      // [
      //   {
      //     // This should always be there. It is the main store main
      //     id: 'a90c1a62-5e1d-4bf7-b902-8d74c89644d1',
      //     quantity: 12,
      //     to: '143e4667-a81d-12d3-c356-469311174300',
      //     from: '143e4667-a81d-12d3-c356-469311174300',
      //     productId: 'b3c15f17-2756-434d-a01e-0b1e7209cb47',
      //     userId: '8215a8ea-cf39-4037-81e6-86f6b439dcf4',
      //     createdAt: new Date().toISOString(),
      //   },


      //   // Store 2
      //   {
      //     id: 'd2fe9b71-6fa2-49c8-b556-5f7a76ebaa8f',
      //     quantity: 12,
      //     from: '143e4667-a81d-12d3-c356-469311174300',
      //     to: '143e4667-a81d-12d3-c356-469311174301',
      //     productId: 'b3c15f17-2756-434d-a01e-0b1e7209cb47',
      //     userId: '8215a8ea-cf39-4037-81e6-86f6b439dcf4',
      //     createdAt: new Date().toISOString(),
      //   },


      //   // store 3
      //   {
      //     id: 'f1d8d843-36b7-462e-9b05-409a1db4a9d7',
      //     quantity: 12,
      //     from: '143e4667-a81d-12d3-c356-469311174300',
      //     to: '143e4667-a81d-12d3-c356-469311174302',
      //     productId: 'b3c15f17-2756-434d-a01e-0b1e7209cb47',
      //     userId: '8215a8ea-cf39-4037-81e6-86f6b439dcf4',
      //     createdAt: new Date().toISOString(),
      //   },
      // ],
      // {}
    // );
  },

  async down(queryInterface) {
    // await queryInterface.bulkDelete('Stores', null, {});
  },
};
