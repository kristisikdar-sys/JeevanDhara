import mongoose from 'mongoose';

const integrationLogSchema = new mongoose.Schema(
	{
		source: { type: String, enum: ['eraktkosh', 'bloodbridge'], required: true },
		payload: { type: Object },
		normalized: { type: Object },
		status: { type: String, enum: ['success', 'error'], default: 'success' }
	},
	{ timestamps: true }
);

export default mongoose.model('IntegrationLog', integrationLogSchema);