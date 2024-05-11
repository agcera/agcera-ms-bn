/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'Sales',
      [

        // create sale for store 2 on product UnoProducto
        {
          id: '7ffdcde2-a8dc-427f-bac2-863f52401fb0',
          paymentMethod: 'CASH',
          clientId: '8215a8ea-cf39-4037-81e6-86f6b439dcf7',
          clientType: 'USER',
          storeId: '143e4667-a81d-12d3-c356-469311174301',
          createdAt: new Date(),
        },

        // sale for store 3 on product Agcera
        {
          id: 'e485f1c7-5a0b-4b9d-bcf6-5b62f3a2bc9a',
          paymentMethod: 'CASH',
          clientId: '8215a8ea-cf39-4037-81e6-86f6b439dcf7',
          clientType: 'USER',
          storeId: '143e4667-a81d-12d3-c356-469311174301',
          createdAt: new Date(),
        },




        {
          id: '7ffdcde2-a8dc-427f-bac2-863f52401fc0',
          paymentMethod: 'CASH',
          clientId: '8215a8ea-cf39-4037-81e6-86f6b439dcf7',
          clientType: 'USER',
          storeId: '143e4667-a81d-12d3-c356-469311174302',
          createdAt: new Date(),
        },

        {
          id: '7ffdcde2-a8dc-427f-bac2-863f52401fc1',
          paymentMethod: 'MOMO',
          clientId: '+250788888881',
          clientType: 'CLIENT',
          storeId: '143e4667-a81d-12d3-c356-469311174302',
          createdAt: new Date(),
        },
      ],
      {}
    );
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('Sales', null, {});
  },
};
