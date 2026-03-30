import { loginAs, sampleImage } from '../helpers/http';
import { cleanupTestData, seedTestData, type TestSeed } from '../helpers/testSeed';
import supertest from 'supertest';
import app from '@src/app';
import { generateToken } from '@src/utils/jwtFunctions';

describe('Users API (e2e)', () => {
  let seed: TestSeed;

  beforeAll(async () => {
    seed = await seedTestData();
  });

  afterAll(async () => {
    await cleanupTestData(seed);
  });

  it('logs in, fetches profile, and logs out', async () => {
    const { agent } = await loginAs(seed.users.admin);

    const listResponse = await agent.get('/api/v1/users');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.users.map((u: { id: string }) => u.id)).toContain(seed.users.admin.id);

    const meResponse = await agent.get('/api/v1/users/me');
    expect(meResponse.status).toBe(200);
    expect(meResponse.body.data.id).toBe(seed.users.admin.id);

    const logoutResponse = await agent.post('/api/v1/users/logout');
    expect(logoutResponse.status).toBe(200);
  });

  it('registers, updates, and deletes a user', async () => {
    const admin = await loginAs(seed.users.admin);
    const uniqueSuffix = String(Date.now()).slice(-7);
    const uniqueEmail = `e2e.user.${uniqueSuffix}@example.com`;
    const uniquePhone = `+25884${uniqueSuffix}`;

    const registerResponse = await supertest(app)
      .post('/api/v1/users/register')
      .field('name', 'E2E User')
      .field('email', uniqueEmail)
      .field('phone', uniquePhone)
      .field('password', '1234')
      .field('gender', 'MALE')
      .field('location', 'Maputo')
      .field('storeId', seed.stores.main.id)
      .field('role', 'user')
      .attach('image', sampleImage(), 'user.png');

    expect(registerResponse.status).toBe(200);
    expect(registerResponse.body.data.email).toBe(uniqueEmail);
    expect(registerResponse.body.data.phone).toBe(uniquePhone);
    const userId = registerResponse.body.data.id;

    const singleResponse = await admin.agent.get(`/api/v1/users/${userId}`);
    expect(singleResponse.status).toBe(200);
    expect(singleResponse.body.data.id).toBe(userId);

    const updateResponse = await admin.agent
      .patch(`/api/v1/users/${userId}`)
      .field('name', 'E2E User Updated')
      .attach('image', sampleImage(), 'user2.png');

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.name).toBe('E2E User Updated');

    const deleteResponse = await admin.agent.delete(`/api/v1/users/${userId}`);
    expect(deleteResponse.status).toBe(200);
  });

  it('handles forgot and reset password', async () => {
    const forgotResponse = await supertest(app).post('/api/v1/users/forgot').send({ phone: seed.users.user1.phone });

    expect(forgotResponse.status).toBe(200);

    const token = generateToken({ id: seed.users.user1.id }, 15 * 60 * 60);
    const resetResponse = await supertest(app).put(`/api/v1/users/reset/${token}`).send({ password: '1234' });

    expect(resetResponse.status).toBe(200);
  });

  it('rejects invalid login credentials', async () => {
    const invalidResponse = await supertest(app)
      .post('/api/v1/users/login')
      .send({ phone: seed.users.admin.phone, password: 'wrong-password' });

    expect(invalidResponse.status).toBe(400);
  });
});
