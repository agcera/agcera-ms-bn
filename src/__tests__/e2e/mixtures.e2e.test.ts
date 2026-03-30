import { loginAs, sampleImage } from '../helpers/http';
import { cleanupTestData, seedTestData, type TestSeed } from '../helpers/testSeed';

describe('Mixtures API (e2e)', () => {
  let seed: TestSeed;

  beforeAll(async () => {
    seed = await seedTestData();
  });

  afterAll(async () => {
    await cleanupTestData(seed);
  });

  it('creates, updates, lists, and deletes mixtures', async () => {
    const { agent } = await loginAs(seed.users.admin);

    const createRequest = agent
      .post('/api/v1/mixtures')
      .field('name', `E2E Mixture ${Date.now()}`)
      .field('costPrice', '10')
      .field('sellingPrice', '20')
      .field('description', 'E2E mixture')
      .field('items[0][productId]', seed.products.uno.id)
      .field('items[0][number]', '1')
      .attach('image', sampleImage(), 'mixture.png');

    const createResponse = await createRequest;
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.name).toContain('E2E Mixture');
    const mixtureId = createResponse.body.data.id;

    const listResponse = await agent.get('/api/v1/mixtures');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.mixtures.map((m: { id: string }) => m.id)).toContain(mixtureId);

    const singleResponse = await agent.get(`/api/v1/mixtures/${mixtureId}`);
    expect(singleResponse.status).toBe(200);
    expect(singleResponse.body.data.id).toBe(mixtureId);

    const updateRequest = agent
      .patch(`/api/v1/mixtures/${mixtureId}`)
      .field('name', `E2E Mixture Updated ${Date.now()}`)
      .field('costPrice', '12')
      .field('sellingPrice', '24')
      .field('items[0][productId]', seed.products.duo.id)
      .field('items[0][number]', '2')
      .attach('image', sampleImage(), 'mixture-update.png');

    const updateResponse = await updateRequest;
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.name).toContain('E2E Mixture Updated');

    const deleteResponse = await agent.delete(`/api/v1/mixtures/${mixtureId}`);
    expect(deleteResponse.status).toBe(201);
  });

  it('rejects invalid mixture payloads', async () => {
    const { agent } = await loginAs(seed.users.admin);

    const invalidRequest = agent
      .post('/api/v1/mixtures')
      .field('name', `E2E Mixture Invalid ${Date.now()}`)
      .field('costPrice', '10')
      .field('sellingPrice', '20')
      .field('description', 'missing items')
      .attach('image', sampleImage(), 'mixture-invalid.png');

    const invalidResponse = await invalidRequest;
    expect(invalidResponse.status).toBe(400);
  });
});
