const { devClients } = require('./20240413092223-Client');
const { devStores } = require('./20240406114830-Store');

const baseSales = [];
const devSales = [
  // create sale for store 2 on product UnoProducto
  {
    id: '7ffdcde2-a8dc-427f-bac2-863f52401fb0',
    paymentMethod: 'CASH',
    clientId: devClients[0].id,
    storeId: devStores[0].id,
    createdAt: new Date().toISOString(),
  },
  // sale for store 3 on product Agcera
  {
    id: 'e485f1c7-5a0b-4b9d-bcf6-5b62f3a2bc9a',
    paymentMethod: 'CASH',
    clientId: devClients[2].id,
    storeId: devStores[0].id,
    createdAt: new Date().toISOString(),
  },
  {
    id: '7ffdcde2-a8dc-427f-bac2-863f52401fc0',
    paymentMethod: 'CASH',
    clientId: devClients[2].id,
    storeId: devStores[1].id,
    createdAt: new Date().toISOString(),
  },
  {
    id: '7ffdcde2-a8dc-427f-bac2-863f52401fc1',
    paymentMethod: 'P.O.S',
    clientId: devClients[1].id,
    storeId: devStores[1].id,
    createdAt: new Date().toISOString(),
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  baseSales,
  devSales,
  async up(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const sales = isDevelopment ? baseSales.concat(devSales) : baseSales;

    if (sales.length > 0) {
      await queryInterface.bulkInsert('Sales', sales, {});
    }
  },
  async down(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const saleIds = (isDevelopment ? baseSales.concat(devSales) : baseSales).map((sale) => sale.id);

    if (saleIds.length > 0) {
      await queryInterface.bulkDelete('Sales', { id: saleIds }, {});
    }
  },
};
