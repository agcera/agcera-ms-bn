import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Op } from 'sequelize';
import Store from '@database/models/store';
import User from '@database/models/user';
import Product from '@database/models/product';
import Variation from '@database/models/variation';
import StoreProduct from '@database/models/storeproduct';
import ProductsMovement from '@database/models/productsmovement';
import Sale from '@database/models/sale';
import SaleProduct from '@database/models/saleproduct';
import SaleMixture from '@database/models/salemixture';
import SalePayment from '@database/models/salepayment';
import Transaction from '@database/models/transaction';
import Mixture from '@database/models/mixture';
import MixtureItem from '@database/models/mixtureitem';
import Client from '@database/models/client';
import { UserGendersEnum, UserRolesEnum } from '@src/types/user.types';
import { ProductTypesEnum } from '@src/types/product.types';

type SeededUser = { id: string; phone: string; password: string };

type SeededStore = { id: string };

type SeededProduct = { id: string };

type SeededVariation = { id: string };

export type TestSeed = {
  stores: {
    main: SeededStore;
    store2: SeededStore;
    store3: SeededStore;
  };
  users: {
    admin: SeededUser;
    keeper1: SeededUser;
    keeper2: SeededUser;
    user1: SeededUser;
  };
  products: {
    uno: SeededProduct;
    duo: SeededProduct;
  };
  variations: {
    unoUnit: SeededVariation;
    duoUnit: SeededVariation;
  };
};

const makePhone = (base: string, suffix: number) => `${base}${String(suffix % 1000).padStart(3, '0')}`;

export const seedTestData = async (): Promise<TestSeed> => {
  const suffix = randomUUID().slice(0, 8);
  const phoneSeed = Math.floor(Math.random() * 900 + 100);
  const password = '1234';
  const hashedPassword = await bcrypt.hash(password, bcrypt.genSaltSync(10));

  const [mainStore] = await Store.findOrCreate({
    where: { name: 'main' },
    defaults: {
      name: 'main',
      location: 'Maputo 12',
      phone: makePhone('+258840000', phoneSeed + 1),
      isActive: true,
    },
  });

  if (!mainStore.isActive) {
    mainStore.isActive = true;
    await mainStore.save();
  }

  const store2 = await Store.create({
    name: `Store 2 ${suffix}`,
    location: 'Maputo 13',
    phone: makePhone('+258840001', phoneSeed + 2),
    isActive: true,
  });

  const store3 = await Store.create({
    name: `Store 3 ${suffix}`,
    location: 'Maputo 14',
    phone: makePhone('+258840002', phoneSeed + 3),
    isActive: true,
  });

  const adminUser = await User.create({
    name: `Admin ${suffix}`,
    email: `admin.${suffix}@example.com`,
    password: hashedPassword,
    phone: makePhone('+258865541', phoneSeed + 4),
    role: UserRolesEnum.ADMIN,
    gender: UserGendersEnum.UNSPECIFIED,
    location: 'Maputo Center',
    storeId: mainStore.id,
    image: 'https://placehold.co/150x100?text=Admin',
  });

  const keeper1 = await User.create({
    name: `Keeper 1 ${suffix}`,
    email: `keeper1.${suffix}@example.com`,
    password: hashedPassword,
    phone: makePhone('+123456789', phoneSeed + 5),
    role: UserRolesEnum.KEEPER,
    gender: UserGendersEnum.UNSPECIFIED,
    location: 'Maputo Center',
    storeId: store2.id,
    image: 'https://placehold.co/150x100?text=Keeper',
  });

  const keeper2 = await User.create({
    name: `Keeper 2 ${suffix}`,
    email: `keeper2.${suffix}@example.com`,
    password: hashedPassword,
    phone: makePhone('+123456789', phoneSeed + 6),
    role: UserRolesEnum.KEEPER,
    gender: UserGendersEnum.UNSPECIFIED,
    location: 'Maputo Center',
    storeId: store3.id,
    image: 'https://placehold.co/150x100?text=Keeper',
  });

  const user1 = await User.create({
    name: `User 1 ${suffix}`,
    email: `user1.${suffix}@example.com`,
    password: hashedPassword,
    phone: makePhone('+123456789', phoneSeed + 7),
    role: UserRolesEnum.USER,
    gender: UserGendersEnum.UNSPECIFIED,
    location: 'Maputo Center',
    storeId: store2.id,
    image: 'https://placehold.co/150x100?text=User',
  });

  const productUno = await Product.create({
    name: `Uno ${suffix}`,
    description: 'E2E Uno product',
    type: ProductTypesEnum.STANDARD,
  });

  const productDuo = await Product.create({
    name: `Duo ${suffix}`,
    description: 'E2E Duo product',
    type: ProductTypesEnum.STANDARD,
  });

  const variationUno = await Variation.create({
    name: 'Unit',
    number: 1,
    costPrice: 10,
    sellingPrice: 20,
    productId: productUno.id,
  });

  const variationDuo = await Variation.create({
    name: 'Unit',
    number: 1,
    costPrice: 15,
    sellingPrice: 30,
    productId: productDuo.id,
  });

  await StoreProduct.create({
    storeId: mainStore.id,
    productId: productUno.id,
    quantity: 100,
  });

  await StoreProduct.create({
    storeId: store2.id,
    productId: productUno.id,
    quantity: 100,
  });

  await StoreProduct.create({
    storeId: store2.id,
    productId: productDuo.id,
    quantity: 100,
  });

  return {
    stores: {
      main: { id: mainStore.id },
      store2: { id: store2.id },
      store3: { id: store3.id },
    },
    users: {
      admin: { id: adminUser.id, phone: adminUser.phone, password },
      keeper1: { id: keeper1.id, phone: keeper1.phone, password },
      keeper2: { id: keeper2.id, phone: keeper2.phone, password },
      user1: { id: user1.id, phone: user1.phone, password },
    },
    products: {
      uno: { id: productUno.id },
      duo: { id: productDuo.id },
    },
    variations: {
      unoUnit: { id: variationUno.id },
      duoUnit: { id: variationDuo.id },
    },
  };
};

export const cleanupTestData = async (seed: TestSeed) => {
  const storeIds = [seed.stores.store2.id, seed.stores.store3.id];
  const movementStoreIds = [seed.stores.main.id, ...storeIds];
  const userIds = Object.values(seed.users).map((user) => user.id);
  const productIds = Object.values(seed.products).map((product) => product.id);

  const sales = await Sale.findAll({
    where: { storeId: { [Op.in]: storeIds } },
    attributes: ['id'],
  });
  const saleIds = sales.map((sale) => sale.id);

  if (saleIds.length) {
    const sequelize = Sale.sequelize;
    if (sequelize) {
      await sequelize.transaction(async (transaction) => {
        await sequelize.query('SET CONSTRAINTS ALL DEFERRED', { transaction });
        await SaleMixture.destroy({ where: { saleId: { [Op.in]: saleIds } }, force: true, transaction });
        await SaleProduct.destroy({ where: { saleId: { [Op.in]: saleIds } }, force: true, transaction });
        await SalePayment.destroy({ where: { saleId: { [Op.in]: saleIds } }, force: true, transaction });
        await Sale.destroy({ where: { id: { [Op.in]: saleIds } }, force: true, transaction });
      });
    } else {
      await SaleMixture.destroy({ where: { saleId: { [Op.in]: saleIds } }, force: true });
      await SaleProduct.destroy({ where: { saleId: { [Op.in]: saleIds } }, force: true });
      await SalePayment.destroy({ where: { saleId: { [Op.in]: saleIds } }, force: true });
      await Sale.destroy({ where: { id: { [Op.in]: saleIds } }, force: true });
    }
  }

  await Transaction.destroy({ where: { storeId: { [Op.in]: storeIds } }, force: true });
  await ProductsMovement.destroy({
    where: {
      [Op.or]: [
        { from: { [Op.in]: movementStoreIds } },
        { to: { [Op.in]: movementStoreIds } },
        { userId: { [Op.in]: userIds } },
      ],
    },
    force: true,
  });

  const mixtureItems = await MixtureItem.findAll({
    where: { productId: { [Op.in]: productIds } },
    attributes: ['mixtureId'],
  });
  const mixtureIds = Array.from(new Set(mixtureItems.map((item) => item.mixtureId)));

  await MixtureItem.destroy({ where: { productId: { [Op.in]: productIds } }, force: true });
  if (mixtureIds.length) {
    await Mixture.destroy({ where: { id: { [Op.in]: mixtureIds } }, force: true });
  }

  await StoreProduct.destroy({ where: { productId: { [Op.in]: productIds } }, force: true });
  await Variation.destroy({ where: { productId: { [Op.in]: productIds } }, force: true });
  await Product.destroy({ where: { id: { [Op.in]: productIds } }, force: true });

  await Client.destroy({ where: { phone: { [Op.in]: ['+258840000333'] } }, force: true });

  await User.destroy({ where: { id: { [Op.in]: userIds } }, force: true });
  await Store.destroy({ where: { id: { [Op.in]: storeIds } }, force: true });
};
