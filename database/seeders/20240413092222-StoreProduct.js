'use strict';

const { devProducts } = require('./20240413052139-Product');
const { baseStores, devStores } = require('./20240406114830-Store');

const baseStoreProducts = [];
const devStoreProducts = [
  // GIVE PRODUCTS TO THE MAIN STORE
  {
    id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c0',
    quantity: 100,
    storeId: baseStores[0].id,
    productId: devProducts[0].id,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c1',
    quantity: 100,
    storeId: baseStores[0].id,
    productId: devProducts[1].id,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c2',
    quantity: 100,
    storeId: baseStores[0].id,
    productId: devProducts[2].id,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c3',
    quantity: 150,
    storeId: baseStores[0].id,
    productId: devProducts[3].id,
    createdAt: new Date().toISOString(),
  },

  // GIVE PRODUCTS TO STORE 2
  {
    id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c4',
    quantity: 50,
    storeId: devStores[0].id,
    productId: devProducts[0].id,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c5',
    quantity: 50,
    storeId: devStores[0].id,
    productId: devProducts[1].id,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c6',
    quantity: 10,
    storeId: devStores[0].id,
    productId: devProducts[2].id,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c7',
    quantity: 50,
    storeId: devStores[0].id,
    productId: devProducts[3].id,
    createdAt: new Date().toISOString(),
  },

  // GIVE PRODUCTS TO STORE 3
  {
    id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c8',
    quantity: 50,
    storeId: devStores[1].id,
    productId: devProducts[0].id,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a5aa7e8b-9306-4ff2-a19a-5ab633c206c9',
    quantity: 50,
    storeId: devStores[1].id,
    productId: devProducts[1].id,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b11ff226-678b-4813-8123-8a2e8b1199f9',
    quantity: 10,
    storeId: devStores[1].id,
    productId: devProducts[2].id,
    createdAt: new Date().toISOString(),
  },
  {
    id: '7da2c84f-8347-40db-8b91-6c5a51a9d999',
    quantity: 10,
    storeId: devStores[1].id,
    productId: devProducts[3].id,
    createdAt: new Date().toISOString(),
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  baseStoreProducts,
  devStoreProducts,
  async up(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const storeProducts = isDevelopment ? baseStoreProducts.concat(devStoreProducts) : baseStoreProducts;

    if (storeProducts.length > 0) {
      await queryInterface.bulkInsert('StoreProducts', storeProducts, {});
    }
  },

  async down(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const storeProductIds = (isDevelopment ? baseStoreProducts.concat(devStoreProducts) : baseStoreProducts).map(
      (storeProduct) => storeProduct.id
    );

    if (storeProductIds.length > 0) {
      await queryInterface.bulkDelete('StoreProducts', { id: storeProductIds }, {});
    }
  },
};
