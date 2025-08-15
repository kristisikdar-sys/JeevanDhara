import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import Request from '../models/Request.js';
import { connectToDatabase } from '../config/db.js';

dotenv.config();

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function seed() {
	await connectToDatabase();
	await Promise.all([User.deleteMany({}), Donor.deleteMany({}), Request.deleteMany({})]);
	const passwordHash = await bcrypt.hash('password123', 10);
	const users = [];
	for (let i = 0; i < 50; i++) {
		users.push(await User.create({ email: `donor${i}@example.com`, phone: `9000000${(100+i)}`, passwordHash, role: 'donor', consent: { recorded: true, recordedAt: new Date() } }));
	}
	const groups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
	const base = { lat: 17.3850, lng: 78.4867 }; // Hyderabad
	const donors = [];
	for (let i = 0; i < 500; i++) {
		const u = users[i % users.length];
		const jitterLat = base.lat + (Math.random() - 0.5) * 0.3;
		const jitterLng = base.lng + (Math.random() - 0.5) * 0.3;
		donors.push(await Donor.create({
			user: u._id,
			blood_group: randomChoice(groups),
			last_donation_date: new Date(Date.now() - Math.floor(Math.random() * 200) * 24*60*60*1000),
			location: { lat: jitterLat, lng: jitterLng },
			languages: ['en', 'hi'],
			engagement_score: Math.floor(Math.random() * 100)
		}));
	}
	for (let i = 0; i < 5; i++) {
		await Request.create({ recipient: users[i]._id, blood_group: randomChoice(groups), units_needed: 2, location: { lat: base.lat + (Math.random()-0.5)*0.1, lng: base.lng + (Math.random()-0.5)*0.1, address: 'Hyderabad' } });
	}
	console.log('Seed complete');
	await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });