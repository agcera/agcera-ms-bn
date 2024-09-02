/** @type {import('sequelize-cli').Migration} */
/* eslint-disable @typescript-eslint/no-unused-vars */
module.exports = {
  async up(queryInterface) {
    // await queryInterface.bulkInsert(
    //   'SaleProducts',
    //   [

    //     // for this sale 7ffdcde2-a8dc-427f-bac2-863f52401fb0 give it 20 unoProducto of variation basic and 10 duoProducto of variation unit
    //     // {
    //     //   id: '5d432d64-5991-4c00-9f70-7bc89e4375e0',
    //     //   quantity: 20,
    //     //   saleId: '7ffdcde2-a8dc-427f-bac2-863f52401fb0',
    //     //   variationId: '3f33b9d1-9b11-4d85-a3c3-8d1676a67110',
    //     //   createdAt: new Date().toISOString(),
    //     // },
    //     // {
    //     //   id: '5d432d64-5991-4c00-9f70-7bc89e4375e1',
    //     //   quantity: 10,
    //     //   saleId: '7ffdcde2-a8dc-427f-bac2-863f52401fb0',
    //     //   variationId: '3f33b9d1-9b11-4d85-a3c3-8d1676a67111',
    //     //   createdAt: new Date().toISOString(),
    //     // },


    //     // // give 20 agcera of variation basic and 10 agcera of variation unit to sale e485f1c7-5a0b-4b9d-bcf6-5b62f3a2bc9a

    //     // {
    //     //   id: '5d432d64-5991-4c00-9f70-7bc89e4375e2',
    //     //   quantity: 20,
    //     //   saleId: 'e485f1c7-5a0b-4b9d-bcf6-5b62f3a2bc9a',
    //     //   variationId: '6b79bb67-593b-4ec3-b3c9-80279b1e053d',
    //     //   createdAt: new Date().toISOString(),
    //     // },
    //     // {
    //     //   id: '5d432d64-5991-4c00-9f70-7bc89e4375e3',
    //     //   quantity: 10,
    //     //   saleId: 'e485f1c7-5a0b-4b9d-bcf6-5b62f3a2bc9a',
    //     //   variationId: 'fb8b9b0b-7b4e-4188-b0e4-90b14ff3fc54',
    //     //   createdAt: new Date().toISOString(),
    //     // },


    //     // // give 20 agcera of variation premium and 10 tresProducto of variation unit 7ffdcde2-a8dc-427f-bac2-863f52401fc0
    //     // {
    //     //   id: '5d432d64-5991-4c00-9f70-7bc89e4375e4',
    //     //   quantity: 20,
    //     //   saleId: '7ffdcde2-a8dc-427f-bac2-863f52401fc0',
    //     //   variationId: '6b79bb67-593b-4ec3-b3c9-80279b1e053d',
    //     //   createdAt: new Date().toISOString(),
    //     // },
    //     // {
    //     //   id: '5d432d64-5991-4c00-9f70-7bc89e4375e5',
    //     //   quantity: 10,
    //     //   saleId: '7ffdcde2-a8dc-427f-bac2-863f52401fc0',
    //     //   variationId: '3f33b9d1-9b11-4d85-a3c3-8d1676a67112',
    //     //   createdAt: new Date().toISOString(),
    //     // },


    //   ],
    //   {}
    // );
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('SaleProducts', null, {});
  },
};
