import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		blood_group: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
		last_donation_date: { type: Date },
		location: {
			lat: { type: Number, required: true },
			lng: { type: Number, required: true }
		},
		languages: [{ type: String }],
		engagement_score: { type: Number, default: 0 }
	},
	{ timestamps: true }
);

donorSchema.index({ 'location.lat': 1, 'location.lng': 1 });

export default mongoose.model('Donor', donorSchema);