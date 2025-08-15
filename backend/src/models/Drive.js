import mongoose from 'mongoose';

const driveSchema = new mongoose.Schema(
	{
		city: { type: String, index: true },
		title: { type: String },
		description: { type: String },
		location: { lat: Number, lng: Number },
		scheduledAt: { type: Date }
	},
	{ timestamps: true }
);

export default mongoose.model('Drive', driveSchema);