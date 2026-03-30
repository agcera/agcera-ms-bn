import { PaymentMethodsEnum } from '@database/models/sale';
import Transaction from '@database/models/transaction';
import { TransactionTypesEnum } from '@src/types/transaction.types';
import type { SuperAgentTest } from 'supertest';
import { loginAs, sampleImage } from '../helpers/http';
import { cleanupTestData, seedTestData, type TestSeed } from '../helpers/testSeed';

jest.setTimeout(20000);

const readPdfBuffer = async (agent: SuperAgentTest, url: string) => {
  const response = await agent
    .get(url)
    .buffer(true)
    .parse((res: any, cb: (error: Error | null, data?: Buffer) => void) => {
      const data: Buffer[] = [];
      res.on('data', (chunk: Buffer) => data.push(chunk));
      res.on('end', () => cb(null, Buffer.concat(data)));
    });

  return response.body as Buffer;
};

const expectPdfHeader = (buffer: Buffer) => {
  expect(buffer.slice(0, 4).toString('ascii')).toBe('%PDF');
};

const getPdfSize = (buffer: Buffer) => buffer.length;

describe('Analytics, report, history, and clients API (e2e)', () => {
  let seed: TestSeed;

  beforeAll(async () => {
    seed = await seedTestData();
  });

  afterAll(async () => {
    await cleanupTestData(seed);
  });

  it('returns analytics and report', async () => {
    const { agent } = await loginAs(seed.users.admin);

    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const to = new Date().toISOString();

    const analyticsResponse = await agent.get(`/api/v1/analytics?from=${from}&to=${to}`);
    expect(analyticsResponse.status).toBe(200);
    expect(analyticsResponse.body.data.usersCount).toBeGreaterThan(0);
    expect(analyticsResponse.body.data.productsCount).toBeGreaterThan(0);
    expect(analyticsResponse.body.data.storeCount).toBeGreaterThan(0);

    const reportBuffer = await readPdfBuffer(agent, `/api/v1/report?from=${from}&to=${to}`);
    expectPdfHeader(reportBuffer);
    expect(getPdfSize(reportBuffer)).toBeGreaterThan(1000);

    const invalidReportResponse = await agent.get(`/api/v1/report?from=${from}`);
    expect(invalidReportResponse.body?.message).toBeTruthy();
  });

  it('generates reports with role constraints and checked filters', async () => {
    const from = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const to = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const checkedDescription = `E2E Checked Transaction ${Date.now()}`;

    const checkedTransaction = await Transaction.create({
      storeId: seed.stores.store2.id,
      userId: seed.users.keeper1.id,
      type: TransactionTypesEnum.INCOME,
      amount: 123,
      description: checkedDescription,
      paymentMethod: PaymentMethodsEnum.CASH,
      checked: true,
    });

    try {
      const { agent: adminAgent } = await loginAs(seed.users.admin);
      const adminBuffer = await readPdfBuffer(
        adminAgent,
        `/api/v1/report?from=${from}&to=${to}&storeId=${seed.stores.store2.id}&includeChecked=true`
      );
      expectPdfHeader(adminBuffer);
      const adminSize = getPdfSize(adminBuffer);
      expect(adminSize).toBeGreaterThan(1000);

      const adminNoCheckedBuffer = await readPdfBuffer(
        adminAgent,
        `/api/v1/report?from=${from}&to=${to}&storeId=${seed.stores.store2.id}&includeChecked=false`
      );
      const adminNoCheckedSize = getPdfSize(adminNoCheckedBuffer);
      expect(adminNoCheckedSize).toBeGreaterThan(1000);
      expect(Math.abs(adminSize - adminNoCheckedSize)).toBeGreaterThan(50);

      const { agent: keeperAgent } = await loginAs(seed.users.keeper1);
      const keeperBuffer = await readPdfBuffer(
        keeperAgent,
        `/api/v1/report?from=${from}&to=${to}&storeId=${seed.stores.store3.id}`
      );
      expectPdfHeader(keeperBuffer);
      const keeperSize = getPdfSize(keeperBuffer);
      expect(keeperSize).toBeGreaterThan(1000);
      expect(adminSize).toBeGreaterThan(keeperSize);

      const keeperOwnBuffer = await readPdfBuffer(keeperAgent, `/api/v1/report?from=${from}&to=${to}`);
      const keeperOwnSize = getPdfSize(keeperOwnBuffer);
      expect(keeperOwnSize).toBeGreaterThan(1000);
      expect(Math.abs(keeperOwnSize - keeperSize)).toBeLessThan(200);

      const { agent: userAgent } = await loginAs(seed.users.user1);
      const forbiddenResponse = await userAgent.get(`/api/v1/report?from=${from}&to=${to}`);
      expect(forbiddenResponse.body?.message).toBe('You are not authorized to perform this action');
    } finally {
      await checkedTransaction.destroy({ force: true });
    }
  }, 20000);

  it('returns history and clients data', async () => {
    const { agent } = await loginAs(seed.users.admin);

    const addProductResponse = await agent.post('/api/v1/stores/addProduct').send({
      from: seed.stores.main.id,
      to: seed.stores.store2.id,
      productId: seed.products.uno.id,
      quantity: 1,
    });
    expect(addProductResponse.status).toBe(201);

    const movementsResponse = await agent.get('/api/v1/history/movements');
    expect(movementsResponse.status).toBe(200);
    expect(movementsResponse.body.data.movements.length).toBeGreaterThan(0);

    const createRequest = agent
      .post('/api/v1/products')
      .field('name', `E2E History Product ${Date.now()}`)
      .field('type', 'SPECIAL')
      .attach('image', sampleImage(), 'product.png')
      .field('variations[0][name]', 'Alpha')
      .field('variations[0][number]', '1')
      .field('variations[0][costPrice]', '10')
      .field('variations[0][sellingPrice]', '20');

    const createResponse = await createRequest;
    expect(createResponse.status).toBe(201);
    const productId = createResponse.body.data.id;

    const deleteResponse = await agent.delete(`/api/v1/products/${productId}`);
    expect(deleteResponse.status).toBe(201);

    const deletedResponse = await agent.get('/api/v1/history/deleted');
    expect(deletedResponse.status).toBe(200);
    expect(deletedResponse.body.data.deletedItems.length).toBeGreaterThan(0);
    const deletedItemId = deletedResponse.body.data?.deletedItems?.[0]?.id;

    if (deletedItemId) {
      const deletedItemResponse = await agent.get(`/api/v1/history/deleted/${deletedItemId}`);
      expect(deletedItemResponse.status).toBe(200);
    }

    const clientsResponse = await agent.get('/api/v1/clients');
    expect(clientsResponse.status).toBe(200);
    expect(Array.isArray(clientsResponse.body.data)).toBe(true);
  });

  it('handles the error endpoint', async () => {
    const { agent } = await loginAs(seed.users.admin);

    const errorResponse = await agent.post('/api/v1/error');
    expect(errorResponse.status).toBe(500);
  });
});
