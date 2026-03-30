import { loginAs } from '../helpers/http';
import { cleanupTestData, seedTestData, type TestSeed } from '../helpers/testSeed';

describe('Transactions API (e2e)', () => {
  let seed: TestSeed;

  beforeAll(async () => {
    seed = await seedTestData();
  });

  afterAll(async () => {
    await cleanupTestData(seed);
  });

  it('creates and fetches transactions', async () => {
    const { agent } = await loginAs(seed.users.keeper1);

    const createResponse = await agent.post('/api/v1/transactions').send({
      amount: 100,
      description: 'E2E transaction',
      paymentMethod: 'CASH',
      type: 'INCOME',
    });

    expect(createResponse.status).toBe(201);
    expect(Number(createResponse.body.data.amount)).toBe(100);
    expect(createResponse.body.data.description).toBe('E2E transaction');
    expect(createResponse.body.data.type).toBe('INCOME');
    expect(createResponse.body.data.paymentMethod).toBe('CASH');
    const transactionId = createResponse.body.data.id;

    const listResponse = await agent.get('/api/v1/transactions');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.transactions.length).toBeGreaterThan(0);
    expect(listResponse.body.data.transactions.map((t: { id: string }) => t.id)).toContain(transactionId);

    const getResponse = await agent.get(`/api/v1/transactions/${transactionId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.id).toBe(transactionId);
    expect(getResponse.body.data.description).toBe('E2E transaction');
  });

  it('rejects invalid transaction payloads', async () => {
    const { agent } = await loginAs(seed.users.keeper1);

    const invalidTypeResponse = await agent.post('/api/v1/transactions').send({
      amount: 50,
      description: 'Bad transaction',
      paymentMethod: 'CASH',
      type: 'INVALID',
    });

    expect(invalidTypeResponse.status).toBe(400);
  });
});
