import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;
export async function getDbConnection() {
  mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'strava2kilometrikisa',
    },
  });
  const connectionString = mongod.getUri();

  // Connect to MongoDB.
  const options: {
    dbName: string;
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
  } = {
    dbName: 'strava2kilometrikisa',
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  return mongoose.connect(connectionString, options);
}

export async function disconnectDb() {
  await mongoose.connection.close();
  await mongod.stop();
}
