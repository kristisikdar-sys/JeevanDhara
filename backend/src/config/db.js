import mongoose from 'mongoose';

export async function connectToDatabase() {
	const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/jeevandhara';
	mongoose.set('strictQuery', true);
	try {
		await mongoose.connect(uri, { dbName: uri.split('/').pop() });
		console.log('MongoDB connected');
	} catch (err) {
		console.error('MongoDB connection error:', err.message);
		if (process.env.JEST_WORKER_ID !== undefined) {
			throw err;
		}
		process.exit(1);
	}
}