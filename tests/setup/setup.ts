import { beforeAll, afterAll } from 'vitest';
import { setupTestApp, closeTestApp } from './mongo-memory-server';

const testApp = await setupTestApp();
beforeAll(async () => {
  await testApp.ready();
});

afterAll(async () => {
  await closeTestApp();
  await testApp.close();
});

export { testApp };
