import Joi from 'joi';
import Donor from '../models/Donor.js';

const donorSchema = Joi.object({
	blood_group: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
	last_donation_date: Joi.date().optional(),
	location: Joi.object({ lat: Joi.number().required(), lng: Joi.number().required() }).required(),
	languages: Joi.array().items(Joi.string()).default([]),
	engagement_score: Joi.number().min(0).max(100).default(0)
});

export async function createDonor(req, res) {
	const { error, value } = donorSchema.validate(req.body);
	if (error) return res.status(400).json({ message: error.message });
	const donor = await Donor.create({ ...value, user: req.user.sub });
	return res.status(201).json(donor);
}

export async function getDonors(req, res) {
	const donors = await Donor.find({ user: req.user.sub });
	return res.json(donors);
}

export async function updateDonor(req, res) {
	const { error, value } = donorSchema.fork(['blood_group', 'location'], (s) => s.optional()).validate(req.body);
	if (error) return res.status(400).json({ message: error.message });
	const donor = await Donor.findOneAndUpdate({ _id: req.params.id, user: req.user.sub }, value, { new: true });
	if (!donor) return res.status(404).json({ message: 'Not found' });
	return res.json(donor);
}

export async function deleteDonor(req, res) {
	const donor = await Donor.findOneAndDelete({ _id: req.params.id, user: req.user.sub });
	if (!donor) return res.status(404).json({ message: 'Not found' });
	return res.json({ ok: true });
}

function daysSince(date) {
	if (!date) return Number.MAX_SAFE_INTEGER;
	const ms = Date.now() - new Date(date).getTime();
	return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export async function getNearby(req, res) {
	const lat = parseFloat(req.query.lat);
	const lng = parseFloat(req.query.lng);
	const radiusKm = parseFloat(req.query.radius || '10');
	if (Number.isNaN(lat) || Number.isNaN(lng)) return res.status(400).json({ message: 'lat,lng required' });
	const donors = await Donor.find();
	// Simple filter by radius using haversine
	const R = 6371;
	function haversine(d1, d2) {
		const dLat = (d2.lat - d1.lat) * Math.PI / 180;
		const dLng = (d2.lng - d1.lng) * Math.PI / 180;
		const a = Math.sin(dLat/2)**2 + Math.cos(d1.lat*Math.PI/180) * Math.cos(d2.lat*Math.PI/180) * Math.sin(dLng/2)**2;
		return 2 * R * Math.asin(Math.sqrt(a));
	}
	const center = { lat, lng };
	const result = donors
		.map(d => ({ d, dist: haversine(center, d.location) }))
		.filter(x => x.dist <= radiusKm)
		.map(x => ({ ...x.d.toObject(), distance_km: Number(x.dist.toFixed(2)), eligible: daysSince(x.d.last_donation_date) >= 90 }));
	return res.json(result);
}