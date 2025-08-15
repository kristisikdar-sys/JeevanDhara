import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true, index: true },
		phone: { type: String, required: true, unique: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ['donor', 'recipient', 'admin'], default: 'donor' },
		consent: {
			recorded: { type: Boolean, default: false },
			recordedAt: { type: Date }
		},
		refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }]
	},
	{ timestamps: true }
);

export default mongoose.model('User', userSchema);