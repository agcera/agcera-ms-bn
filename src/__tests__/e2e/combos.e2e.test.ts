import { loginAs, sampleImage } from '../helpers/http';
import { cleanupTestData, seedTestData, type TestSeed } from '../helpers/testSeed';

describe('Combos API (e2e)', () => {
  let seed: TestSeed;

  beforeAll(async () => {
    seed = await seedTestData();
  });

  afterAll(async () => {
    await cleanupTestData(seed);
  });

  it('creates, updates, lists, and deletes combos', async () => {
    const { agent } = await loginAs(seed.users.admin);

    const createRequest = agent
      .post('/api/v1/combos')
      .field('name', `E2E Combo ${Date.now()}`)
      .field('costPrice', '10')
      .field('sellingPrice', '20')
      .field('description', 'E2E combo')
      .field('items[0][productId]', seed.products.uno.id)
      .field('items[0][number]', '1')
      .attach('image', sampleImage(), 'combo.png');

    const createResponse = await createRequest;
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.name).toContain('E2E Combo');
    const comboId = createResponse.body.data.id;

    const listResponse = await agent.get('/api/v1/combos');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.combos.map((m: { id: string }) => m.id)).toContain(comboId);

    const singleResponse = await agent.get(`/api/v1/combos/${comboId}`);
    expect(singleResponse.status).toBe(200);
    expect(singleResponse.body.data.id).toBe(comboId);

    const updateRequest = agent
      .patch(`/api/v1/combos/${comboId}`)
      .field('name', `E2E Combo Updated ${Date.now()}`)
      .field('costPrice', '12')
      .field('sellingPrice', '24')
      .field('items[0][productId]', seed.products.duo.id)
      .field('items[0][number]', '2')
      .attach('image', sampleImage(), 'combo-update.png');

    const updateResponse = await updateRequest;
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.name).toContain('E2E Combo Updated');

    const deleteResponse = await agent.delete(`/api/v1/combos/${comboId}`);
    expect(deleteResponse.status).toBe(201);
  });

  it('rejects invalid combo payloads', async () => {
    const { agent } = await loginAs(seed.users.admin);

    const invalidRequest = agent
      .post('/api/v1/combos')
      .field('name', `E2E Combo Invalid ${Date.now()}`)
      .field('costPrice', '10')
      .field('sellingPrice', '20')
      .field('description', 'missing items')
      .attach('image', sampleImage(), 'combo-invalid.png');

    const invalidResponse = await invalidRequest;
    expect(invalidResponse.status).toBe(400);
  });

  it('exposes cost price only to admins', async () => {
    const admin = await loginAs(seed.users.admin);
    const keeper = await loginAs(seed.users.keeper1);

    const createRequest = admin.agent
      .post('/api/v1/combos')
      .field('name', `E2E Combo Cost ${Date.now()}`)
      .field('costPrice', '10')
      .field('sellingPrice', '20')
      .field('description', 'E2E combo')
      .field('items[0][productId]', seed.products.uno.id)
      .field('items[0][number]', '1')
      .attach('image', sampleImage(), 'combo.png');

    const createResponse = await createRequest;
    expect(createResponse.status).toBe(201);
    const comboId = createResponse.body.data.id;

    const adminSingle = await admin.agent.get(`/api/v1/combos/${comboId}`);
    expect(adminSingle.status).toBe(200);
    expect(adminSingle.body.data.costPrice).toBeDefined();

    const keeperSingle = await keeper.agent.get(`/api/v1/combos/${comboId}`);
    expect(keeperSingle.status).toBe(200);
    expect(keeperSingle.body.data.costPrice).toBeUndefined();

    const adminList = await admin.agent.get('/api/v1/combos');
    expect(adminList.status).toBe(200);
    const adminCombo = adminList.body.data.combos.find((m: { id: string }) => m.id === comboId);
    expect(adminCombo?.costPrice).toBeDefined();

    const keeperList = await keeper.agent.get('/api/v1/combos');
    expect(keeperList.status).toBe(200);
    const keeperCombo = keeperList.body.data.combos.find((m: { id: string }) => m.id === comboId);
    expect(keeperCombo?.costPrice).toBeUndefined();
  });
});
