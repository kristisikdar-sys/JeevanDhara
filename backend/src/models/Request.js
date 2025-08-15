import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
	{
		recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		blood_group: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
		units_needed: { type: Number, default: 1 },
		location: {
			lat: { type: Number, required: true },
			lng: { type: Number, required: true },
			address: { type: String }
		},
		status: { type: String, enum: ['open', 'matched', 'fulfilled', 'cancelled'], default: 'open' },
		firestoreId: { type: String },
		matchedDonorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donor' }]
	},
	{ timestamps: true }
);

export default mongoose.model('Request', requestSchema);