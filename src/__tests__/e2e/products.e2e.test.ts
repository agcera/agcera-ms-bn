import { loginAs, sampleImage } from '../helpers/http';
import { cleanupTestData, seedTestData, type TestSeed } from '../helpers/testSeed';

const buildVariationFields = (prefix: string, values: Record<string, any>) =>
  Object.entries(values).map(([key, value]) => [`${prefix}[${key}]`, value]);

describe('Products API (e2e)', () => {
  let seed: TestSeed;

  beforeAll(async () => {
    seed = await seedTestData();
  });

  afterAll(async () => {
    await cleanupTestData(seed);
  });

  it('creates, updates, lists, and deletes products and variations', async () => {
    const { agent } = await loginAs(seed.users.admin);

    const createRequest = agent
      .post('/api/v1/products')
      .field('name', `E2E Product ${Date.now()}`)
      .field('type', 'SPECIAL')
      .attach('image', sampleImage(), 'product.png');

    buildVariationFields('variations[0]', {
      name: 'Alpha',
      number: 1,
      costPrice: 10,
      sellingPrice: 20,
    }).forEach(([key, value]) => createRequest.field(key, String(value)));

    buildVariationFields('variations[1]', {
      name: 'Beta',
      number: 2,
      costPrice: 15,
      sellingPrice: 30,
    }).forEach(([key, value]) => createRequest.field(key, String(value)));

    const createResponse = await createRequest;
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.name).toContain('E2E Product');
    expect(createResponse.body.data.type).toBe('SPECIAL');
    const productId = createResponse.body.data.id;

    const listResponse = await agent.get('/api/v1/products');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.products.map((p: { id: string }) => p.id)).toContain(productId);

    const singleResponse = await agent.get(`/api/v1/products/${productId}`);
    expect(singleResponse.status).toBe(200);
    expect(singleResponse.body.data.id).toBe(productId);

    const updateRequest = agent
      .patch(`/api/v1/products/${productId}`)
      .field('name', `E2E Product Updated ${Date.now()}`)
      .attach('image', sampleImage(), 'product-update.png');

    buildVariationFields('variations[0]', {
      name: 'Alpha',
      number: 1,
      costPrice: 11,
      sellingPrice: 22,
    }).forEach(([key, value]) => updateRequest.field(key, String(value)));

    buildVariationFields('variations[1]', {
      name: 'Beta',
      number: 2,
      costPrice: 16,
      sellingPrice: 32,
    }).forEach(([key, value]) => updateRequest.field(key, String(value)));

    const updateResponse = await updateRequest;
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.name).toContain('E2E Product Updated');

    const variationsResponse = await agent.get(`/api/v1/products/${productId}/variations`);
    expect(variationsResponse.status).toBe(200);
    const variationId = variationsResponse.body.data[0]?.id;

    if (variationId) {
      const deleteVariationResponse = await agent.delete(`/api/v1/products/${productId}/variations/${variationId}`);
      expect(deleteVariationResponse.status).toBe(200);
    }

    const deleteResponse = await agent.delete(`/api/v1/products/${productId}`);
    expect(deleteResponse.status).toBe(201);
  });

  it('rejects invalid standard product payloads', async () => {
    const { agent } = await loginAs(seed.users.admin);

    const invalidRequest = agent
      .post('/api/v1/products')
      .field('name', `E2E Standard ${Date.now()}`)
      .field('type', 'STANDARD')
      .attach('image', sampleImage(), 'standard.png')
      .field('variations[0][name]', 'Default')
      .field('variations[0][number]', '1')
      .field('variations[0][costPrice]', '10')
      .field('variations[0][sellingPrice]', '20')
      .field('variations[1][name]', 'Extra')
      .field('variations[1][number]', '2')
      .field('variations[1][costPrice]', '12')
      .field('variations[1][sellingPrice]', '24');

    const invalidResponse = await invalidRequest;
    expect(invalidResponse.status).toBe(400);
  });

  it('exposes cost price only to admins', async () => {
    const admin = await loginAs(seed.users.admin);
    const keeper = await loginAs(seed.users.keeper1);

    const createRequest = admin.agent
      .post('/api/v1/products')
      .field('name', `E2E Cost Product ${Date.now()}`)
      .field('type', 'SPECIAL')
      .attach('image', sampleImage(), 'product.png');

    buildVariationFields('variations[0]', {
      name: 'Alpha',
      number: 1,
      costPrice: 10,
      sellingPrice: 20,
    }).forEach(([key, value]) => createRequest.field(key, String(value)));

    const createResponse = await createRequest;
    expect(createResponse.status).toBe(201);
    const productId = createResponse.body.data.id;

    const seedMainResponse = await admin.agent.post('/api/v1/stores/addProduct').send({
      from: 'main',
      to: seed.stores.main.id,
      productId,
      quantity: 5,
    });
    expect(seedMainResponse.status).toBe(201);

    const addToKeeperStore = await admin.agent.post('/api/v1/stores/addProduct').send({
      from: seed.stores.main.id,
      to: seed.stores.store2.id,
      productId,
      quantity: 2,
    });
    expect(addToKeeperStore.status).toBe(201);

    const adminProduct = await admin.agent.get(`/api/v1/products/${productId}`);
    expect(adminProduct.status).toBe(200);
    expect(adminProduct.body.data.variations?.[0]?.costPrice).toBeDefined();

    const keeperProduct = await keeper.agent.get(`/api/v1/products/${productId}`);
    expect(keeperProduct.status).toBe(200);
    expect(keeperProduct.body.data.variations?.[0]?.costPrice).toBeUndefined();

    const adminVariations = await admin.agent.get(`/api/v1/products/${productId}/variations`);
    expect(adminVariations.status).toBe(200);
    expect(adminVariations.body.data?.[0]?.costPrice).toBeDefined();

    const keeperVariations = await keeper.agent.get(`/api/v1/products/${productId}/variations`);
    expect(keeperVariations.status).toBe(200);
    expect(keeperVariations.body.data?.[0]?.costPrice).toBeUndefined();
  });
});
