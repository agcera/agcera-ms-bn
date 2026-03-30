import { loginAs } from '../helpers/http';
import { cleanupTestData, seedTestData, type TestSeed } from '../helpers/testSeed';

describe('Stores API (e2e)', () => {
  let seed: TestSeed;

  beforeAll(async () => {
    seed = await seedTestData();
  });

  afterAll(async () => {
    await cleanupTestData(seed);
  });

  it('lists stores and store details', async () => {
    const { agent } = await loginAs(seed.users.admin);

    const listResponse = await agent.get('/api/v1/stores');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.stores.map((s: { id: string }) => s.id)).toContain(seed.stores.main.id);

    const allResponse = await agent.get('/api/v1/stores/all');
    expect(allResponse.status).toBe(200);
    expect(Array.isArray(allResponse.body.data)).toBe(true);
    expect(allResponse.body.data.length).toBeGreaterThan(0);

    const singleResponse = await agent.get(`/api/v1/stores/${seed.stores.main.id}`);
    expect(singleResponse.status).toBe(200);
    expect(singleResponse.body.data.id).toBe(seed.stores.main.id);
  });

  it('creates, updates, and deletes a store', async () => {
    const { agent } = await loginAs(seed.users.admin);

    const createResponse = await agent.post('/api/v1/stores').send({
      name: `E2E Store ${Date.now()}`,
      location: 'Maputo 15',
      phone: '+258840000222',
      keepers: [seed.users.keeper1.id],
      isActive: true,
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.name).toContain('E2E Store');
    const storeId = createResponse.body.data.id;

    const updateResponse = await agent.patch(`/api/v1/stores/${storeId}`).send({
      name: `E2E Store Updated ${Date.now()}`,
      keepers: [seed.users.keeper2.id],
    });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.store.name).toContain('E2E Store Updated');

    const deleteResponse = await agent.delete(`/api/v1/stores/${storeId}`);
    expect(deleteResponse.status).toBe(200);

    const invalidKeeperResponse = await agent.post('/api/v1/stores').send({
      name: `E2E Store Invalid ${Date.now()}`,
      location: 'Maputo 16',
      phone: '+258840000223',
      keepers: ['00000000-0000-0000-0000-000000000000'],
      isActive: true,
    });

    expect(invalidKeeperResponse.status).toBe(404);
  });

  it('handles store products, users, add product, and collect profit', async () => {
    const { agent } = await loginAs(seed.users.admin);

    const storeProductsResponse = await agent.get(`/api/v1/stores/${seed.stores.main.id}/products`);
    expect(storeProductsResponse.status).toBe(200);
    expect(storeProductsResponse.body.data.products.length).toBeGreaterThan(0);

    const storeUsersResponse = await agent.get(`/api/v1/stores/${seed.stores.main.id}/users`);
    expect(storeUsersResponse.status).toBe(200);
    expect(storeUsersResponse.body.data.users.length).toBeGreaterThan(0);

    const addProductResponse = await agent.post('/api/v1/stores/addProduct').send({
      from: seed.stores.main.id,
      to: seed.stores.store2.id,
      productId: seed.products.uno.id,
      quantity: 1,
    });

    expect(addProductResponse.status).toBe(201);

    const profitResponse = await agent.post('/api/v1/stores/collectProfit').send({
      storeId: seed.stores.main.id,
      from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    });

    expect(profitResponse.status).toBe(200);
  });
});
