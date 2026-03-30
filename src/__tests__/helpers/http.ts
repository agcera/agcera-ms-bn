import supertest, { SuperAgentTest } from 'supertest';
import app from '@src/app';

export const createAgent = () => supertest.agent(app);

export type TestCredentials = { phone: string; password: string };

export const loginAs = async (creds: TestCredentials) => {
  const agent = createAgent();

  const response = await agent.post('/api/v1/users/login').send({
    phone: creds.phone,
    password: creds.password,
  });

  if (response.status !== 200) {
    throw new Error(`Login failed: ${response.status}`);
  }

  return { agent, user: response.body.data };
};

export const sampleImage = () => Buffer.from('image');
