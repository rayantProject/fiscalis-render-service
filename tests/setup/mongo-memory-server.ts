import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import buildTestServer from '../../src/utils/testServer';

let mongoServer: MongoMemoryServer;
export async function setupTestApp() {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);

    return buildTestServer();
  } catch (error) {
    console.error('❌ Failed to set up the test application:', error);
    throw error;
  }
}

export async function closeTestApp() {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('❌ Failed to shut down the test environment:', error);
    throw error;
  }
}
