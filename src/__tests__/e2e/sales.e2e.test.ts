import StoreProduct from '@database/models/storeproduct';
import Store from '@database/models/store';
import Variation from '@database/models/variation';
import Combo from '@database/models/combo';
import { loginAs, sampleImage } from '../helpers/http';
import { cleanupTestData, seedTestData, type TestSeed } from '../helpers/testSeed';

const createSpecialProductForStore = async (agent: any, storeId: string, mainStoreId: string) => {
  const uniqueSuffix = String(Date.now()).slice(-6);
  const createRequest = agent
    .post('/api/v1/products')
    .field('name', `E2E Special ${uniqueSuffix}`)
    .field('type', 'SPECIAL')
    .attach('image', sampleImage(), 'special.png')
    .field('variations[0][name]', 'Pack')
    .field('variations[0][number]', '1')
    .field('variations[0][costPrice]', '12')
    .field('variations[0][sellingPrice]', '25');

  const createResponse = await createRequest;
  expect(createResponse.status).toBe(201);
  const productId = createResponse.body.data.id;

  const variationsResponse = await agent.get(`/api/v1/products/${productId}/variations`);
  expect(variationsResponse.status).toBe(200);
  const variationId = variationsResponse.body.data?.[0]?.id;

  await agent.post('/api/v1/stores/addProduct').send({
    from: 'main',
    to: mainStoreId,
    productId,
    quantity: 20,
  });

  await agent.post('/api/v1/stores/addProduct').send({
    from: 'main',
    to: storeId,
    productId,
    quantity: 5,
  });

  return { productId, variationId, name: createResponse.body.data.name };
};

const createCombo = async (agent: any, productId: string, itemNumber = 1) => {
  const uniqueSuffix = String(Date.now()).slice(-6);
  const createRequest = agent
    .post('/api/v1/combos')
    .field('name', `E2E Combo ${uniqueSuffix}`)
    .field('costPrice', '10')
    .field('sellingPrice', '22')
    .field('description', 'E2E combo')
    .field('items[0][productId]', productId)
    .field('items[0][number]', String(itemNumber))
    .attach('image', sampleImage(), 'combo.png');

  const createResponse = await createRequest;
  expect(createResponse.status).toBe(201);
  return {
    id: createResponse.body.data.id,
    name: createResponse.body.data.name,
    sellingPrice: Number(createResponse.body.data.sellingPrice || 0),
  };
};

const getVariationSellingPrice = async (variationId: string) => {
  const variation = await Variation.findByPk(variationId);
  return Number(variation?.sellingPrice || 0);
};

const getComboSellingPrice = async (comboId: string) => {
  const combo = await Combo.findByPk(comboId);
  return Number(combo?.sellingPrice || 0);
};

const buildPayments = (total: number, methods: string[] = ['CASH']) => {
  if (methods.length === 1) {
    return [{ paymentMethod: methods[0], amount: Number(total.toFixed(2)) }];
  }

  const half = Number((total / methods.length).toFixed(2));
  const payments = methods.map((method, index) => ({
    paymentMethod: method,
    amount: index === methods.length - 1 ? Number((total - half * (methods.length - 1)).toFixed(2)) : half,
  }));
  return payments;
};

const getStoreProductQuantity = async (storeId: string, productId: string) => {
  const record = await StoreProduct.findOne({ where: { storeId, productId } });
  return record?.quantity ?? 0;
};

describe('Sales API (e2e)', () => {
  let seed: TestSeed;

  beforeAll(async () => {
    seed = await seedTestData();
  });

  afterAll(async () => {
    await cleanupTestData(seed);
  });

  it('creates sales with standard, special, combo, and mixed items', async () => {
    const admin = await loginAs(seed.users.admin);
    const keeper = await loginAs(seed.users.keeper1);

    const special = await createSpecialProductForStore(admin.agent, seed.stores.store2.id, seed.stores.main.id);
    const combo = await createCombo(admin.agent, seed.products.uno.id);

    const standardTotal =
      (await getVariationSellingPrice(seed.variations.unoUnit.id)) * 2 +
      (await getVariationSellingPrice(seed.variations.duoUnit.id)) * 1;
    const standardSaleResponse = await keeper.agent.post('/api/v1/sales').send({
      storeId: seed.stores.store2.id,
      payments: buildPayments(standardTotal, ['CASH']),
      clientName: 'E2E Client Standard',
      phone: '+258840000333',
      isMember: false,
      variations: {
        [seed.variations.unoUnit.id]: 2,
        [seed.variations.duoUnit.id]: 1,
      },
    });

    expect(standardSaleResponse.status).toBe(200);
    expect(standardSaleResponse.body.data.storeId).toBe(seed.stores.store2.id);
    expect(standardSaleResponse.body.data.payments?.[0]?.paymentMethod).toBe('CASH');
    expect(standardSaleResponse.body.data.variations).toHaveLength(2);

    const specialTotal = Number((await getVariationSellingPrice(special.variationId)) || 0);
    const specialSaleResponse = await keeper.agent.post('/api/v1/sales').send({
      storeId: seed.stores.store2.id,
      payments: buildPayments(specialTotal, ['M-PESA']),
      clientName: 'E2E Client Special',
      phone: '+258840000334',
      isMember: true,
      variations: {
        [special.variationId]: 1,
      },
    });

    expect(specialSaleResponse.status).toBe(200);
    expect(specialSaleResponse.body.data.payments?.[0]?.paymentMethod).toBe('M-PESA');
    expect(specialSaleResponse.body.data.variations).toHaveLength(1);
    expect(specialSaleResponse.body.data.variations[0]?.variation?.product?.name).toContain('E2E Special');

    const comboTotal = (await getComboSellingPrice(combo.id)) * 2;
    const comboSaleResponse = await keeper.agent.post('/api/v1/sales').send({
      storeId: seed.stores.store2.id,
      payments: buildPayments(comboTotal, ['CASH']),
      clientName: 'E2E Client Combo',
      phone: '+258840000335',
      isMember: false,
      combos: {
        [combo.id]: 2,
      },
    });

    expect(comboSaleResponse.status).toBe(200);
    expect(comboSaleResponse.body.data.combos).toHaveLength(1);
    expect(comboSaleResponse.body.data.combos[0]?.combo?.name).toBe(combo.name);

    const mixedTotal =
      (await getVariationSellingPrice(seed.variations.unoUnit.id)) * 1 + (await getComboSellingPrice(combo.id)) * 1;
    const mixedSaleResponse = await keeper.agent.post('/api/v1/sales').send({
      storeId: seed.stores.store2.id,
      payments: buildPayments(mixedTotal, ['CASH']),
      clientName: 'E2E Client Mixed',
      phone: '+258840000336',
      isMember: false,
      variations: {
        [seed.variations.unoUnit.id]: 1,
      },
      combos: {
        [combo.id]: 1,
      },
    });

    expect(mixedSaleResponse.status).toBe(200);
    expect(mixedSaleResponse.body.data.variations).toHaveLength(1);
    expect(mixedSaleResponse.body.data.combos).toHaveLength(1);
  });

  it('updates store quantities for combo sales and refunds', async () => {
    const admin = await loginAs(seed.users.admin);
    const keeper = await loginAs(seed.users.keeper1);

    const combo = await createCombo(admin.agent, seed.products.uno.id, 2);
    const storeId = seed.stores.store2.id;
    const productId = seed.products.uno.id;

    const beforeQuantity = await getStoreProductQuantity(storeId, productId);

    const saleTotal =
      (await getVariationSellingPrice(seed.variations.unoUnit.id)) * 1 + (await getComboSellingPrice(combo.id)) * 2;
    const saleResponse = await keeper.agent.post('/api/v1/sales').send({
      storeId,
      payments: buildPayments(saleTotal, ['CASH']),
      clientName: 'E2E Client Combo Inventory',
      phone: '+258840000339',
      isMember: false,
      variations: {
        [seed.variations.unoUnit.id]: 1,
      },
      combos: {
        [combo.id]: 2,
      },
    });

    expect(saleResponse.status).toBe(200);
    const saleId = saleResponse.body.data.id;

    const afterSaleQuantity = await getStoreProductQuantity(storeId, productId);
    expect(afterSaleQuantity).toBe(beforeQuantity - 5);

    const refundResponse = await keeper.agent.patch(`/api/v1/sales/${saleId}`);
    expect(refundResponse.status).toBe(200);

    const afterRefundQuantity = await getStoreProductQuantity(storeId, productId);
    expect(afterRefundQuantity).toBe(beforeQuantity);
  });

  it('lists, gets, refunds a sale, and validates error scenarios', async () => {
    const { agent } = await loginAs(seed.users.keeper1);

    const createTotal = (await getVariationSellingPrice(seed.variations.unoUnit.id)) * 1;
    const createResponse = await agent.post('/api/v1/sales').send({
      storeId: seed.stores.store2.id,
      payments: buildPayments(createTotal, ['CASH']),
      clientName: 'E2E Client',
      phone: '+258840000333',
      isMember: false,
      variations: {
        [seed.variations.unoUnit.id]: 1,
      },
    });

    expect(createResponse.status).toBe(200);
    const saleId = createResponse.body.data.id;

    const listResponse = await agent.get('/api/v1/sales');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.sales.length).toBeGreaterThan(0);

    const getResponse = await agent.get(`/api/v1/sales/${saleId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.id).toBe(saleId);

    const refundResponse = await agent.patch(`/api/v1/sales/${saleId}`);
    expect(refundResponse.status).toBe(200);
    expect(refundResponse.body.message.sale.refundedAt).toBeTruthy();

    const missingItemsResponse = await agent.post('/api/v1/sales').send({
      storeId: seed.stores.store2.id,
      payments: buildPayments(createTotal, ['CASH']),
      clientName: 'E2E Client Missing',
      phone: '+258840000337',
      isMember: false,
    });
    expect(missingItemsResponse.status).toBe(400);

    const forbiddenResponse = await agent.post('/api/v1/sales').send({
      storeId: seed.stores.main.id,
      payments: buildPayments(createTotal, ['CASH']),
      clientName: 'E2E Client Forbidden',
      phone: '+258840000338',
      isMember: false,
      variations: {
        [seed.variations.unoUnit.id]: 1,
      },
    });
    expect(forbiddenResponse.status).toBe(403);
  });

  it('blocks sales when product or combo stock is insufficient', async () => {
    const admin = await loginAs(seed.users.admin);
    const keeper = await loginAs(seed.users.keeper1);

    const overProductTotal = (await getVariationSellingPrice(seed.variations.unoUnit.id)) * 101;
    const overProductResponse = await keeper.agent.post('/api/v1/sales').send({
      storeId: seed.stores.store2.id,
      payments: buildPayments(overProductTotal, ['CASH']),
      clientName: 'E2E Client Too Many Products',
      phone: '+258840000340',
      isMember: false,
      variations: {
        [seed.variations.unoUnit.id]: 101,
      },
    });

    expect(overProductResponse.status).toBe(400);
    expect(overProductResponse.body?.message).toContain('not available');

    const combo = await createCombo(admin.agent, seed.products.uno.id, 60);

    const overComboTotal = (await getComboSellingPrice(combo.id)) * 2;
    const overComboResponse = await keeper.agent.post('/api/v1/sales').send({
      storeId: seed.stores.store2.id,
      payments: buildPayments(overComboTotal, ['CASH']),
      clientName: 'E2E Client Too Many Combos',
      phone: '+258840000341',
      isMember: false,
      combos: {
        [combo.id]: 2,
      },
    });

    expect(overComboResponse.status).toBe(400);
    expect(overComboResponse.body?.message).toContain('not available');
  });

  it('blocks sales in collected time ranges and allows refunds after collection', async () => {
    const keeper = await loginAs(seed.users.keeper1);
    const storeId = seed.stores.store2.id;

    const t1 = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const t2 = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const t3 = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const futureBase = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const mpesaT1 = new Date(futureBase + 60 * 60 * 1000);
    const mpesaT2 = new Date(futureBase + 2 * 60 * 60 * 1000);
    const mpesaT3 = new Date(futureBase + 3 * 60 * 60 * 1000);

    const cashTotal = (await getVariationSellingPrice(seed.variations.unoUnit.id)) * 1;
    const cashBefore = await keeper.agent.post('/api/v1/sales').send({
      storeId,
      payments: buildPayments(cashTotal, ['CASH']),
      clientName: 'E2E Collected Cash Before',
      phone: '+258840000912',
      isMember: false,
      doneOn: t1.toISOString(),
      variations: {
        [seed.variations.unoUnit.id]: 1,
      },
    });
    expect(cashBefore.status).toBe(200);

    const cashAfter = await keeper.agent.post('/api/v1/sales').send({
      storeId,
      payments: buildPayments(cashTotal, ['CASH']),
      clientName: 'E2E Collected Cash After',
      phone: '+258840000913',
      isMember: false,
      doneOn: t3.toISOString(),
      variations: {
        [seed.variations.unoUnit.id]: 1,
      },
    });
    expect(cashAfter.status).toBe(200);

    await Store.update({ lastCollectedAt: t2 }, { where: { id: storeId } });

    const blockedResponse = await keeper.agent.post('/api/v1/sales').send({
      storeId,
      payments: buildPayments(cashTotal, ['CASH']),
      clientName: 'E2E Collected Client',
      phone: '+258840000914',
      isMember: false,
      doneOn: t2.toISOString(),
      variations: {
        [seed.variations.unoUnit.id]: 1,
      },
    });

    expect(blockedResponse.status).toBe(400);
    expect(blockedResponse.body?.message).toContain('collected time range');

    const mpesaBefore = await keeper.agent.post('/api/v1/sales').send({
      storeId,
      payments: buildPayments(cashTotal, ['M-PESA']),
      clientName: 'E2E Collected Mpesa Before',
      phone: '+258840000915',
      isMember: false,
      doneOn: mpesaT1.toISOString(),
      variations: {
        [seed.variations.unoUnit.id]: 1,
      },
    });
    expect(mpesaBefore.status).toBe(200);

    const refundSale = await keeper.agent.post('/api/v1/sales').send({
      storeId,
      payments: buildPayments(cashTotal, ['M-PESA']),
      clientName: 'E2E Refund Sale',
      phone: '+258840000916',
      isMember: false,
      doneOn: mpesaT2.toISOString(),
      variations: {
        [seed.variations.unoUnit.id]: 1,
      },
    });
    expect(refundSale.status).toBe(200);
    const saleId = refundSale.body.data?.id;
    expect(saleId).toBeTruthy();

    const mpesaAfter = await keeper.agent.post('/api/v1/sales').send({
      storeId,
      payments: buildPayments(cashTotal, ['M-PESA']),
      clientName: 'E2E Collected Mpesa After',
      phone: '+258840000917',
      isMember: false,
      doneOn: mpesaT3.toISOString(),
      variations: {
        [seed.variations.unoUnit.id]: 1,
      },
    });
    expect(mpesaAfter.status).toBe(200);

    await Store.update({ lastCollectedAt: mpesaT2 }, { where: { id: storeId } });

    const refundResponse = await keeper.agent.patch(`/api/v1/sales/${saleId}`);
    expect(refundResponse.status).toBe(200);
    expect(refundResponse.body?.message?.sale?.refundedAt || refundResponse.body?.data?.refundedAt).toBeTruthy();

    await Store.update({ lastCollectedAt: new Date(0) }, { where: { id: storeId } });
  });

  it('creates sales with multiple payments and rejects mismatched totals', async () => {
    const { agent } = await loginAs(seed.users.keeper1);
    const variationTotal = (await getVariationSellingPrice(seed.variations.unoUnit.id)) * 1;

    const multiPaymentResponse = await agent.post('/api/v1/sales').send({
      storeId: seed.stores.store2.id,
      payments: buildPayments(variationTotal, ['CASH', 'M-PESA']),
      clientName: 'E2E Multi Payment',
      phone: '+258840000550',
      isMember: false,
      variations: {
        [seed.variations.unoUnit.id]: 1,
      },
    });

    expect(multiPaymentResponse.status).toBe(200);
    expect(multiPaymentResponse.body.data.payments).toHaveLength(2);

    const invalidPaymentResponse = await agent.post('/api/v1/sales').send({
      storeId: seed.stores.store2.id,
      payments: [{ paymentMethod: 'CASH', amount: Number((variationTotal - 1).toFixed(2)) }],
      clientName: 'E2E Payment Mismatch',
      phone: '+258840000551',
      isMember: false,
      variations: {
        [seed.variations.unoUnit.id]: 1,
      },
    });

    expect(invalidPaymentResponse.status).toBe(400);
    expect(invalidPaymentResponse.body?.message).toContain('Total payment amount does not match sale total');
  });

  it('only exposes cost price to admins', async () => {
    const admin = await loginAs(seed.users.admin);
    const keeper = await loginAs(seed.users.keeper1);

    const saleTotal = (await getVariationSellingPrice(seed.variations.unoUnit.id)) * 1;
    const saleResponse = await keeper.agent.post('/api/v1/sales').send({
      storeId: seed.stores.store2.id,
      payments: buildPayments(saleTotal, ['CASH']),
      clientName: 'E2E Cost Price Sale',
      phone: '+258840000552',
      isMember: false,
      variations: {
        [seed.variations.unoUnit.id]: 1,
      },
    });

    expect(saleResponse.status).toBe(200);
    const saleId = saleResponse.body.data.id;

    const keeperSaleResponse = await keeper.agent.get(`/api/v1/sales/${saleId}`);
    expect(keeperSaleResponse.status).toBe(200);
    const keeperVariation = keeperSaleResponse.body.data.variations?.[0]?.variation;
    expect(keeperVariation?.costPrice).toBeUndefined();

    const adminSaleResponse = await admin.agent.get(`/api/v1/sales/${saleId}`);
    expect(adminSaleResponse.status).toBe(200);
    const adminVariation = adminSaleResponse.body.data.variations?.[0]?.variation;
    expect(adminVariation?.costPrice).toBeDefined();
  });
});
