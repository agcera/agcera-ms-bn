const { devSales } = require('./20240413095216-Sale');
const { devVariations } = require('./20240413074122-Variation');

const baseSaleProducts = [];
const devSaleProducts = [
  // for this sale 7ffdcde2-a8dc-427f-bac2-863f52401fb0 give it 20 unoProducto of variation basic and 10 duoProducto of variation unit
  {
    id: '5d432d64-5991-4c00-9f70-7bc89e4375e0',
    quantity: 20,
    saleId: devSales[0].id,
    variationId: devVariations[0].id,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5d432d64-5991-4c00-9f70-7bc89e4375e1',
    quantity: 10,
    saleId: devSales[0].id,
    variationId: devVariations[1].id,
    createdAt: new Date().toISOString(),
  },

  // give 20 agcera of variation basic and 10 agcera of variation unit to sale e485f1c7-5a0b-4b9d-bcf6-5b62f3a2bc9a
  {
    id: '5d432d64-5991-4c00-9f70-7bc89e4375e2',
    quantity: 20,
    saleId: devSales[1].id,
    variationId: devVariations[3].id,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5d432d64-5991-4c00-9f70-7bc89e4375e3',
    quantity: 10,
    saleId: devSales[1].id,
    variationId: devVariations[4].id,
    createdAt: new Date().toISOString(),
  },

  // give 20 agcera of variation premium and 10 tresProducto of variation unit 7ffdcde2-a8dc-427f-bac2-863f52401fc0
  {
    id: '5d432d64-5991-4c00-9f70-7bc89e4375e4',
    quantity: 20,
    saleId: devSales[2].id,
    variationId: devVariations[3].id,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5d432d64-5991-4c00-9f70-7bc89e4375e5',
    quantity: 10,
    saleId: devSales[2].id,
    variationId: devVariations[2].id,
    createdAt: new Date().toISOString(),
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  baseSaleProducts,
  devSaleProducts,
  async up(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const saleProducts = isDevelopment ? baseSaleProducts.concat(devSaleProducts) : baseSaleProducts;

    if (saleProducts.length > 0) {
      await queryInterface.bulkInsert('SaleProducts', saleProducts, {});
    }
  },
  async down(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const saleProductIds = (isDevelopment ? baseSaleProducts.concat(devSaleProducts) : baseSaleProducts).map(
      (saleProduct) => saleProduct.id
    );

    if (saleProductIds.length > 0) {
      await queryInterface.bulkDelete('SaleProducts', { id: saleProductIds }, {});
    }
  },
};
