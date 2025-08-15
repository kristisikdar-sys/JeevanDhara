import Joi from 'joi';
import Donor from '../models/Donor.js';
import Request from '../models/Request.js';

function haversine(d1, d2) {
	const R = 6371;
	const dLat = (d2.lat - d1.lat) * Math.PI / 180;
	const dLng = (d2.lng - d1.lng) * Math.PI / 180;
	const a = Math.sin(dLat/2)**2 + Math.cos(d1.lat*Math.PI/180) * Math.cos(d2.lat*Math.PI/180) * Math.sin(dLng/2)**2;
	return 2 * R * Math.asin(Math.sqrt(a));
}

export async function suggestHotspots(req, res) {
	const schema = Joi.object({ city: Joi.string().optional(), bbox: Joi.array().items(Joi.number()).length(4).optional() });
	const { error, value } = schema.validate({ city: req.query.city, bbox: req.query.bbox });
	if (error) return res.status(400).json({ message: error.message });

	// For hackathon speed, ignore city/bbox and compute global grid heatmap
	const donors = await Donor.find();
	const requests = await Request.find({ status: 'open' });

	// Grid size ~ 2km by 2km in degrees (~0.018 deg) at equator
	const cell = 0.02;
	const grid = new Map();
	function key(lat, lng) {
		const gx = Math.floor(lat / cell);
		const gy = Math.floor(lng / cell);
		return `${gx}:${gy}`;
	}
	function addPoint(p, weight) {
		const k = key(p.lat, p.lng);
		const g = grid.get(k) || { lat: p.lat, lng: p.lng, score: 0, donors: 0, requests: 0 };
		g.score += weight;
		if (weight > 0) g.requests += 1; else g.donors += 1;
		grid.set(k, g);
	}
	donors.forEach(d => addPoint(d.location, -0.5));
	requests.forEach(r => addPoint(r.location, 1));

	const hotspots = Array.from(grid.values())
		.sort((a, b) => b.score - a.score)
		.slice(0, 3)
		.map(h => ({ lat: Number(h.lat.toFixed(6)), lng: Number(h.lng.toFixed(6)), score: Number(h.score.toFixed(2)), donors: h.donors, requests: h.requests }));

	return res.json({ hotspots });
}