'use strict';
/* eslint-disable @typescript-eslint/no-unused-vars */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // await queryInterface.bulkInsert(
    //   'Variations',
    //   [
    //     // {
    //     //   id: '3f33b9d1-9b11-4d85-a3c3-8d1676a67110',
    //     //   name: 'Unit',
    //     //   number: 1,
    //     //   costPrice: 100,
    //     //   sellingPrice: 200,
    //     //   createdAt: new Date().toISOString(),
    //     //   productId: '123e4567-e89b-12d3-a456-426614174001',
    //     // },
    //     // {
    //     //   id: '3f33b9d1-9b11-4d85-a3c3-8d1676a67111',
    //     //   name: 'Unit',
    //     //   number: 1,
    //     //   costPrice: 200,
    //     //   sellingPrice: 400,
    //     //   createdAt: new Date().toISOString(),
    //     //   productId: '123e4567-e89b-12d3-a456-426614174002',
    //     // },
    //     // {
    //     //   id: '3f33b9d1-9b11-4d85-a3c3-8d1676a67112',
    //     //   name: 'Unit',
    //     //   number: 1,
    //     //   costPrice: 300,
    //     //   sellingPrice: 600,
    //     //   createdAt: new Date().toISOString(),
    //     //   productId: '123e4567-e89b-12d3-a456-426614174003',
    //     // },


    //     // // agcera variations
    //     // {
    //     //   id: '6b79bb67-593b-4ec3-b3c9-80279b1e053d',
    //     //   name: 'Unit',
    //     //   number: 1,
    //     //   costPrice: 2450,
    //     //   sellingPrice: 2859,
    //     //   createdAt: new Date().toISOString(),
    //     //   productId: 'b3c15f17-2756-434d-a01e-0b1e7209cb47',
    //     // },
    //     // {
    //     //   id: 'fb8b9b0b-7b4e-4188-b0e4-90b14ff3fc54',
    //     //   name: 'Basic',
    //     //   number: 2,
    //     //   costPrice: 6300,
    //     //   sellingPrice: 7500,
    //     //   createdAt: new Date().toISOString(),
    //     //   productId: 'b3c15f17-2756-434d-a01e-0b1e7209cb47',
    //     // },
    //     // {
    //     //   id: '2a899481-6203-4d67-b1f4-1233d4c6ad92',
    //     //   name: 'Premium',
    //     //   number: 8,
    //     //   costPrice: 24150,
    //     //   sellingPrice: 28500,
    //     //   createdAt: new Date().toISOString(),
    //     //   productId: 'b3c15f17-2756-434d-a01e-0b1e7209cb47',
    //     // },
    //     // {
    //     //   id: '5a4d1654-5e95-46a4-ba27-66f8e3b7ac27',
    //     //   name: 'Elite',
    //     //   number: 24,
    //     //   costPrice: 72450,
    //     //   sellingPrice: 85000,
    //     //   createdAt: new Date().toISOString(),
    //     //   productId: 'b3c15f17-2756-434d-a01e-0b1e7209cb47',

    //     // }
    //   ],
    //   {}
    // );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Variations', null, {});
  },
};
