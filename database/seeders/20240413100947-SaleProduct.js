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

const saleTotalsById = devSaleProducts.reduce((acc, saleProduct) => {
  const variation = devVariations.find((item) => item.id === saleProduct.variationId);
  const sellingPrice = Number(variation?.sellingPrice || 0);
  acc[saleProduct.saleId] = (acc[saleProduct.saleId] || 0) + saleProduct.quantity * sellingPrice;
  return acc;
}, {});

const devSalePayments = Object.entries(saleTotalsById).map(([saleId, amount]) => {
  const sale = devSales.find((item) => item.id === saleId);
  return {
    id: saleId,
    saleId,
    paymentMethod: sale?.paymentMethod || 'CASH',
    amount,
    createdAt: new Date().toISOString(),
  };
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  baseSaleProducts,
  devSaleProducts,
  async up(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const saleProducts = isDevelopment ? baseSaleProducts.concat(devSaleProducts) : baseSaleProducts;
    const salePayments = isDevelopment ? devSalePayments : [];

    if (saleProducts.length > 0) {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.bulkInsert('SaleProducts', saleProducts, { transaction });
        if (salePayments.length > 0) {
          await queryInterface.bulkInsert('SalePayments', salePayments, { transaction });
        }
      });
    }
  },
  async down(queryInterface) {
    const isDevelopment = ['development', 'test'].includes(process.env.NODE_ENV ?? 'development');

    const saleProductIds = (isDevelopment ? baseSaleProducts.concat(devSaleProducts) : baseSaleProducts).map(
      (saleProduct) => saleProduct.id
    );

    const salePaymentIds = isDevelopment ? devSalePayments.map((payment) => payment.id) : [];

    await queryInterface.sequelize.transaction(async (transaction) => {
      if (salePaymentIds.length > 0) {
        await queryInterface.bulkDelete('SalePayments', { id: salePaymentIds }, { transaction });
      }

      if (saleProductIds.length > 0) {
        await queryInterface.bulkDelete('SaleProducts', { id: saleProductIds }, { transaction });
      }
    });
  },
};
