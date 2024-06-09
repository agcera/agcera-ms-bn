'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'StoreProducts',
      [

        // GIVE PRODUCTS TO THE MAIN STORE
        // give it unoProducto
        {
          id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c0',
          quantity: 100,
          storeId: '143e4667-a81d-12d3-c356-469311174300',
          productId: '123e4567-e89b-12d3-a456-426614174001',
          createdAt: new Date().toISOString(),
        },
        // give it duoProducto
        {
          id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c1',
          quantity: 100,
          storeId: '143e4667-a81d-12d3-c356-469311174300',
          productId: '123e4567-e89b-12d3-a456-426614174002',
          createdAt: new Date().toISOString(),
        },
        // give it tresProducto
        {
          id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c2',
          quantity: 100,
          storeId: '143e4667-a81d-12d3-c356-469311174300',
          productId: '123e4567-e89b-12d3-a456-426614174003',
          createdAt: new Date().toISOString(),
        },
        // give it agcera
        {
          id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c3',
          quantity: 150,
          storeId: '143e4667-a81d-12d3-c356-469311174300',
          productId: 'b3c15f17-2756-434d-a01e-0b1e7209cb47',
          createdAt: new Date().toISOString(),
        },

        // GIVE PRODUCTS TO STORE 2
        // give it unoProducto
        {
          id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c4',
          quantity: 50,
          storeId: '143e4667-a81d-12d3-c356-469311174301',
          productId: '123e4567-e89b-12d3-a456-426614174001',
          createdAt: new Date().toISOString(),
        },
        // give it duoProducto
        {
          id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c5',
          quantity: 50,
          storeId: '143e4667-a81d-12d3-c356-469311174301',
          productId: '123e4567-e89b-12d3-a456-426614174002',
          createdAt: new Date().toISOString(),
        },
        // give it tresProducto
        {
          id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c6',
          quantity: 10,
          storeId: '143e4667-a81d-12d3-c356-469311174301',
          productId: '123e4567-e89b-12d3-a456-426614174003',
          createdAt: new Date().toISOString(),
        },
        // give it agcera
        {
          id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c7',
          quantity: 50,
          storeId: '143e4667-a81d-12d3-c356-469311174301',
          productId: 'b3c15f17-2756-434d-a01e-0b1e7209cb47',
          createdAt: new Date().toISOString(),
        },



        // GIVE PRODUCTS TO STORE 3
        // give it unoProducto
        {
          id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c8',
          quantity: 50,
          storeId: '143e4667-a81d-12d3-c356-469311174302',
          productId: '123e4567-e89b-12d3-a456-426614174001',
          createdAt: new Date().toISOString(),
        },
        // give it duoProducto
        {
          id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c9',
          quantity: 50,
          storeId: '143e4667-a81d-12d3-c356-469311174302',
          productId: '123e4567-e89b-12d3-a456-426614174002',
          createdAt: new Date().toISOString(),
        },
        // give it tresProducto
        {
          id: 'b11ff226-678b-4813-8123-8a2e8b1199f9',
          quantity: 10,
          storeId: '143e4667-a81d-12d3-c356-469311174302',
          productId: '123e4567-e89b-12d3-a456-426614174003',
          createdAt: new Date().toISOString(),
        },
        // give it agcera
        {
          id: '7da2c84f-8347-40db-8b91-6c5a51a9d999',
          quantity: 10,
          storeId: '143e4667-a81d-12d3-c356-469311174302',
          productId: 'b3c15f17-2756-434d-a01e-0b1e7209cb47',
          createdAt: new Date().toISOString(),
        },

      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('StoreProducts', null, {});
  },
};
