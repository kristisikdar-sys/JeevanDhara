import Joi from 'joi';
import Donor from '../models/Donor.js';
import Request from '../models/Request.js';
import admin from 'firebase-admin';

let firebaseInitialized = false;
function initFirebase() {
	if (firebaseInitialized) return;
	try {
		admin.initializeApp({
			credential: admin.credential.applicationDefault(),
			projectId: process.env.FIREBASE_PROJECT_ID
		});
		firebaseInitialized = true;
	} catch (e) {
		// ignore double init
		firebaseInitialized = true;
	}
}

const createSchema = Joi.object({
	blood_group: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
	units_needed: Joi.number().min(1).max(10).default(1),
	location: Joi.object({ lat: Joi.number().required(), lng: Joi.number().required(), address: Joi.string().allow('') }).required()
});

function daysSince(date) {
	if (!date) return Number.MAX_SAFE_INTEGER;
	const ms = Date.now() - new Date(date).getTime();
	return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function haversine(d1, d2) {
	const R = 6371;
	const dLat = (d2.lat - d1.lat) * Math.PI / 180;
	const dLng = (d2.lng - d1.lng) * Math.PI / 180;
	const a = Math.sin(dLat/2)**2 + Math.cos(d1.lat*Math.PI/180) * Math.cos(d2.lat*Math.PI/180) * Math.sin(dLng/2)**2;
	return 2 * R * Math.asin(Math.sqrt(a));
}

async function matchDonors(blood_group, location, radiusKm = 20) {
	const donors = await Donor.find({ blood_group });
	const center = { lat: location.lat, lng: location.lng };
	return donors
		.map(d => ({ d, dist: haversine(center, d.location), eligible: daysSince(d.last_donation_date) >= 90 }))
		.filter(x => x.dist <= radiusKm && x.eligible)
		.sort((a, b) => a.dist - b.dist)
		.slice(0, 10)
		.map(x => ({ donor: x.d, distance_km: Number(x.dist.toFixed(2)) }));
}

export async function createRequest(req, res) {
	const { error, value } = createSchema.validate(req.body);
	if (error) return res.status(400).json({ message: error.message });
	const request = await Request.create({ ...value, recipient: req.user.sub });
	// Write to Firestore for realtime
	initFirebase();
	let firestoreId = null;
	try {
		const db = admin.firestore();
		const doc = await db.collection('blood_requests').add({
			requestId: request._id.toString(),
			blood_group: request.blood_group,
			units_needed: request.units_needed,
			location: request.location,
			status: request.status,
			createdAt: admin.firestore.FieldValue.serverTimestamp()
		});
		firestoreId = doc.id;
		request.firestoreId = firestoreId;
		await request.save();
	} catch (e) {
		console.warn('Firestore not configured, skipping write.');
	}
	// Match donors
	const matches = await matchDonors(request.blood_group, request.location);
	request.matchedDonorIds = matches.map(m => m.donor._id);
	await request.save();
	return res.status(201).json({ request, matches });
}

export async function getNearbyRequests(req, res) {
	const lat = parseFloat(req.query.lat);
	const lng = parseFloat(req.query.lng);
	const radiusKm = parseFloat(req.query.radius || '25');
	if (Number.isNaN(lat) || Number.isNaN(lng)) return res.status(400).json({ message: 'lat,lng required' });
	const requests = await Request.find({ status: 'open' });
	const center = { lat, lng };
	const result = requests
		.map(r => ({ r, dist: haversine(center, r.location) }))
		.filter(x => x.dist <= radiusKm)
		.map(x => ({ ...x.r.toObject(), distance_km: Number(x.dist.toFixed(2)) }));
	return res.json(result);
}

export async function updateRequestStatus(req, res) {
	const schema = Joi.object({ status: Joi.string().valid('open', 'matched', 'fulfilled', 'cancelled').required() });
	const { error, value } = schema.validate(req.body);
	if (error) return res.status(400).json({ message: error.message });
	const request = await Request.findOneAndUpdate({ _id: req.params.id, recipient: req.user.sub }, { status: value.status }, { new: true });
	if (!request) return res.status(404).json({ message: 'Not found' });
	return res.json(request);
}