'use strict';

const baseProducts = [];
const devProducts = [
  {
    // uno producto
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'UnoProducto',
    description: 'Producto de prueba en la base de datos',
    type: 'STANDARD',
    createdAt: new Date().toISOString(),
  },
  {
    // duo producto
    id: '123e4567-e89b-12d3-a456-426614174002',
    name: 'DuoProducto',
    description: 'Producto de prueba en la base de datos',
    type: 'STANDARD',
    createdAt: new Date().toISOString(),
  },
  {
    // tres producto
    id: '123e4567-e89b-12d3-a456-426614174003',
    name: 'TresProducto',
    description: 'Producto de prueba en la base de datos',
    type: 'STANDARD',
    createdAt: new Date().toISOString(),
  },
  {
    // agcera
    id: 'b3c15f17-2756-434d-a01e-0b1e7209cb47',
    name: 'Agcera',
    description: 'Producto de prueba en la base de datos',
    type: 'SPECIAL',
    createdAt: new Date().toISOString(),
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  baseProducts,
  devProducts,
  async up(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const products = isDevelopment ? baseProducts.concat(devProducts) : baseProducts;

    if (products.length > 0) {
      await queryInterface.bulkInsert('Products', products, {});
    }
  },

  async down(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const productIds = (isDevelopment ? baseProducts.concat(devProducts) : baseProducts).map((product) => product.id);

    if (productIds.length > 0) {
      await queryInterface.bulkDelete('Products', { id: productIds }, {});
    }
  },
};
