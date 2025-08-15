import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app.js';

let mongo;

beforeAll(async () => {
	mongo = await MongoMemoryServer.create();
	const uri = mongo.getUri('jeevandhara_test');
	process.env.MONGO_URI = uri;
	await mongoose.connect(uri, { dbName: 'jeevandhara_test' });
});

afterAll(async () => {
	await mongoose.disconnect();
	if (mongo) await mongo.stop();
});

export default app;