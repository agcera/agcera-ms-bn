'use strict';

const { devStores } = require('./20240406114830-Store');
const { devUsers } = require('./20240406114834-User');
const { devProducts } = require('./20240413052139-Product');
const { devVariations } = require('./20240413074122-Variation');
const { devSales } = require('./20240413095216-Sale');
const { devSaleProducts } = require('./20240413100947-SaleProduct');
const { devStoreProducts } = require('./20240413092222-StoreProduct');

const baseDeleteds = [];
const devDeleteds = [
  {
    // This should always be there. It is the main store main
    id: '3b07d2f3-89fa-4e94-bb11-5369ff9ddbd7',
    deletedBy: JSON.stringify({
      name: 'Gustavo',
      phone: '+21341123423',
    }),
    description: JSON.stringify({
      store: {
        id: devStores[0].id,
        name: 'Store 2',
        location: 'Maputo 13',
        phone: '+258840000001',
        isActive: true,
        createdAt: '2024-05-19T10:55:45.919Z',
        updatedAt: '2024-05-19T10:55:53.472Z',
        deletedAt: '2024-05-19T10:55:53.471Z',
        users: [
          {
            id: devUsers[0].id,
            name: 'keeper 1',
            email: 'keeper1@gmail.com',
            phone: '+123456789024',
            gender: 'UNSPECIFIED',
            location: 'Maputo Center',
            role: 'keeper',
            image: 'https://placehold.co/150x100?text=image%20not%20found',
            isActive: true,
          },
          {
            id: devUsers[2].id,
            name: 'user 1',
            email: 'user1@gmail.com',
            phone: '+123456789026',
            gender: 'UNSPECIFIED',
            location: 'Maputo Center',
            role: 'user',
            image: 'https://placehold.co/150x100?text=image%20not%20found',
            isActive: true,
          },
        ],
        products: [
          {
            id: devStoreProducts[4].id,
            quantity: 50,
            storeId: devStores[0].id,
            productId: devProducts[0].id,
            store: {
              id: devStores[0].id,
              name: 'Store 2',
              location: 'Maputo 13',
              phone: '+258840000001',
              isActive: true,
            },
            product: {
              id: devProducts[0].id,
              name: 'UnoProducto',
              image: 'https://placehold.co/150x100?text=image%20not%20found',
              description: 'Producto de prueba en la base de datos',
              type: 'STANDARD',
            },
          },
          {
            id: devStoreProducts[5].id,
            quantity: 50,
            storeId: devStores[0].id,
            productId: devProducts[1].id,
            store: {
              id: devStores[0].id,
              name: 'Store 2',
              location: 'Maputo 13',
              phone: '+258840000001',
              isActive: true,
            },
            product: {
              id: devProducts[1].id,
              name: 'DuoProducto',
              image: 'https://placehold.co/150x100?text=image%20not%20found',
              description: 'Producto de prueba en la base de datos',
              type: 'STANDARD',
            },
          },
          {
            id: devStoreProducts[6].id,
            quantity: 10,
            storeId: devStores[0].id,
            productId: devProducts[2].id,
            store: {
              id: devStores[0].id,
              name: 'Store 2',
              location: 'Maputo 13',
              phone: '+258840000001',
              isActive: true,
            },
            product: {
              id: devProducts[2].id,
              name: 'TresProducto',
              image: 'https://placehold.co/150x100?text=image%20not%20found',
              description: 'Producto de prueba en la base de datos',
              type: 'STANDARD',
            },
          },
          {
            id: devStoreProducts[7].id,
            quantity: 50,
            storeId: devStores[0].id,
            productId: devProducts[3].id,
            store: {
              id: devStores[0].id,
              name: 'Store 2',
              location: 'Maputo 13',
              phone: '+258840000001',
              isActive: true,
            },
            product: {
              id: devProducts[3].id,
              name: 'Agcera',
              image: 'https://placehold.co/150x100?text=image%20not%20found',
              description: 'Producto de prueba en la base de datos',
              type: 'SPECIAL',
            },
          },
        ],
      },
    }),
    table: 'store',
    createdAt: new Date().toISOString(),
  },
  {
    id: '8db3f450-3ab5-41e5-94d2-d5106930c4ad',
    description: JSON.stringify({
      sale: {
        id: devSales[0].id,
        paymentMethod: 'CASH',
        clientId: devUsers[2].id,
        clientType: 'USER',
        storeId: devStores[0].id,
        createdAt: '2024-05-14T17:27:52.583Z',
        updatedAt: '2024-05-18T18:21:25.236Z',
        deletedAt: '2024-05-18T18:21:25.235Z',
        store: {
          id: devStores[0].id,
          name: 'Store 2',
          location: 'Maputo 13',
          phone: '+258840000001',
          isActive: true,
        },
        variations: [
          {
            id: devSaleProducts[0].id,
            quantity: 20,
            saleId: devSales[0].id,
            variationId: devVariations[0].id,
            variation: {
              id: devVariations[0].id,
              name: 'Unit',
              number: 1,
              costPrice: '100',
              sellingPrice: '200',
              productId: devProducts[0].id,
              product: {
                id: devProducts[0].id,
                name: 'UnoProducto',
                image: 'https://placehold.co/150x100?text=image%20not%20found',
                description: 'Producto de prueba en la base de datos',
                type: 'STANDARD',
              },
            },
          },
          {
            id: devSaleProducts[1].id,
            quantity: 10,
            saleId: devSales[0].id,
            variationId: devVariations[1].id,
            variation: {
              id: devVariations[1].id,
              name: 'Unit',
              number: 1,
              costPrice: '200',
              sellingPrice: '400',
              productId: devProducts[1].id,
              product: {
                id: devProducts[1].id,
                name: 'DuoProducto',
                image: 'https://placehold.co/150x100?text=image%20not%20found',
                description: 'Producto de prueba en la base de datos',
                type: 'STANDARD',
              },
            },
          },
        ],
      },
    }),
    deletedBy: JSON.stringify({
      name: 'Gustavo',
      phone: '+21341123423',
    }),
    table: 'sale',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'f1d8d843-36b7-462e-9b05-409a1db4a9d7',
    description: JSON.stringify({
      user: {
        id: devUsers[0].id,
        name: 'keeper 1',
        email: 'keeper1@gmail.com',
        phone: '+123456789024',
        gender: 'UNSPECIFIED',
        location: 'Maputo Center',
        role: 'keeper',
        storeId: devStores[0].id,
        image: 'https://placehold.co/150x100?text=image%20not%20found',
        isActive: true,
        createdAt: '2024-05-19T11:17:40.387Z',
        updatedAt: '2024-05-19T11:17:44.239Z',
        deletedAt: '2024-05-19T11:17:44.239Z',
        store: {
          id: devStores[0].id,
          name: 'Store 2',
          location: 'Maputo 13',
          phone: '+258840000001',
          isActive: true,
        },
      },
    }),
    deletedBy: JSON.stringify({
      name: 'Gustavo',
      phone: '+21341123423',
    }),
    table: 'user',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'f1d8d843-36b7-462e-9b05-409a1db4a9d9',
    description: JSON.stringify({
      product: {
        id: devProducts[0].id,
        name: 'UnoProducto',
        image: 'https://placehold.co/150x100?text=image%20not%20found',
        description: 'Producto de prueba en la base de datos',
        type: 'STANDARD',
        createdAt: '2024-05-19T14:22:03.774Z',
        updatedAt: '2024-05-19T14:23:01.363Z',
        deletedAt: '2024-05-19T14:23:01.363Z',
        variations: [
          {
            id: devVariations[0].id,
            name: 'Unit',
            number: 1,
            sellingPrice: '200',
            productId: devProducts[0].id,
          },
        ],
      },
    }),
    deletedBy: JSON.stringify({
      name: 'Gustavo',
      phone: '+21341123423',
    }),
    table: 'product',
    createdAt: new Date().toISOString(),
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  baseDeleteds,
  devDeleteds,
  async up(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const deleteds = isDevelopment ? baseDeleteds.concat(devDeleteds) : baseDeleteds;

    if (deleteds.length > 0) {
      await queryInterface.bulkInsert('Deleteds', deleteds, {});
    }
  },

  async down(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const deletedIds = (isDevelopment ? baseDeleteds.concat(devDeleteds) : baseDeleteds).map((deleted) => deleted.id);

    if (deletedIds.length > 0) {
      await queryInterface.bulkDelete('Deleteds', { id: deletedIds }, {});
    }
  },
};
