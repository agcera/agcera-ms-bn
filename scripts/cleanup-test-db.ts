import sequelize from '@database/connection';
import ProductsMovement from '@database/models/productsmovement';
import Sale from '@database/models/sale';
import SaleMixture from '@database/models/salemixture';
import SaleProduct from '@database/models/saleproduct';
import Transaction from '@database/models/transaction';
import Mixture from '@database/models/mixture';
import MixtureItem from '@database/models/mixtureitem';

const cleanup = async () => {
  try {
    await MixtureItem.destroy({ where: {}, force: true, truncate: true, cascade: true });
    await Mixture.destroy({ where: {}, force: true, truncate: true, cascade: true });
    await SaleMixture.destroy({ where: {}, force: true, truncate: true, cascade: true });
    await SaleProduct.destroy({ where: {}, force: true, truncate: true, cascade: true });
    await Sale.destroy({ where: {}, force: true, truncate: true, cascade: true });
    await Transaction.destroy({ where: {}, force: true, truncate: true, cascade: true });
    await ProductsMovement.destroy({ where: {}, force: true, truncate: true, cascade: true });
  } finally {
    await sequelize.close();
  }
};

cleanup().catch(async (error) => {
  console.error('Failed to cleanup test DB:', error);
  await sequelize.close();
  process.exit(1);
});
