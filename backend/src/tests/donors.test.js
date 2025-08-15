import request from 'supertest';
import app from '../../src/app.js';

let token;

describe('Donors', () => {
	beforeAll(async () => {
		const email = `donor${Date.now()}@ex.com`;
		await request(app).post('/api/auth/register').send({ email, phone: '9888888888', password: 'secret12', role: 'donor', consent: true });
		const login = await request(app).post('/api/auth/login').send({ identifier: email, password: 'secret12' });
		token = login.body.accessToken;
	});
	it('creates donor', async () => {
		const res = await request(app)
			.post('/api/donors')
			.set('Authorization', `Bearer ${token}`)
			.send({ blood_group: 'A+', location: { lat: 17.4, lng: 78.48 }, languages: ['en'], engagement_score: 42 });
		expect(res.status).toBe(201);
	});
	it('nearby donors works', async () => {
		const res = await request(app)
			.get('/api/donors/nearby?lat=17.4&lng=78.48&radius=50')
			.set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
	});
});