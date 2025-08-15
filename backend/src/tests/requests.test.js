import request from 'supertest';
import app from '../../src/app.js';

let token;

describe('Requests', () => {
	beforeAll(async () => {
		const email = `rec${Date.now()}@ex.com`;
		await request(app).post('/api/auth/register').send({ email, phone: '9777777777', password: 'secret12', role: 'recipient', consent: true });
		const login = await request(app).post('/api/auth/login').send({ identifier: email, password: 'secret12' });
		token = login.body.accessToken;
	});
	it('creates request and returns matches', async () => {
		const res = await request(app)
			.post('/api/requests')
			.set('Authorization', `Bearer ${token}`)
			.send({ blood_group: 'A+', units_needed: 2, location: { lat: 17.39, lng: 78.48, address: 'Hyderabad' } });
		expect(res.status).toBe(201);
		expect(res.body.request).toBeDefined();
		expect(res.body.matches).toBeDefined();
	});
});