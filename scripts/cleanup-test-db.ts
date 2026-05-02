import sequelize from '@database/connection';
import ProductsMovement from '@database/models/productsmovement';
import Sale from '@database/models/sale';
import SaleCombo from '@database/models/salecombo';
import SaleProduct from '@database/models/saleproduct';
import Transaction from '@database/models/transaction';
import Combo from '@database/models/combo';
import ComboItem from '@database/models/comboitem';

const cleanup = async () => {
  try {
    await ComboItem.destroy({ where: {}, force: true, truncate: true, cascade: true });
    await Combo.destroy({ where: {}, force: true, truncate: true, cascade: true });
    await SaleCombo.destroy({ where: {}, force: true, truncate: true, cascade: true });
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
