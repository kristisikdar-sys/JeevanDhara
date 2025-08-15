import request from 'supertest';
import app from '../../src/app.js';

describe('Auth', () => {
	const email = `test${Date.now()}@example.com`;
	it('registers a user', async () => {
		const res = await request(app).post('/api/auth/register').send({ email, phone: '9999999999', password: 'secret12', role: 'donor', consent: true });
		expect(res.status).toBe(201);
		expect(res.body.user.email).toBe(email);
		expect(res.body.accessToken).toBeDefined();
	});
	it('logs in user', async () => {
		const res = await request(app).post('/api/auth/login').send({ identifier: email, password: 'secret12' });
		expect(res.status).toBe(200);
		expect(res.body.accessToken).toBeDefined();
	});
});