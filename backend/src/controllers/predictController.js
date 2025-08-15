import axios from 'axios';
import Joi from 'joi';

const schema = Joi.object({
	donor_id: Joi.string().required(),
	blood_group: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
	last_donation_days: Joi.number().min(0).required(),
	avg_donations_per_year: Joi.number().min(0).required(),
	engagement_score: Joi.number().min(0).max(100).required(),
	area_demand_index: Joi.number().min(0).max(1).required()
});

export async function predictAvailability(req, res) {
	const { error, value } = schema.validate(req.body);
	if (error) return res.status(400).json({ message: error.message });
	const url = process.env.ML_PREDICT_URL || 'http://localhost:5001/predict';
	try {
		const response = await axios.post(url, value, { timeout: 4000 });
		return res.json(response.data);
	} catch (e) {
		return res.status(502).json({ message: 'ML service unavailable', detail: e.message });
	}
}