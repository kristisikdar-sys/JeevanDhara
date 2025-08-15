import IntegrationLog from '../models/IntegrationLog.js';

function mockEraktKosh() {
	return {
		centers: [
			{ id: 'ERK-1', name: 'City Blood Bank', city: 'Hyderabad', bloodGroups: ['A+', 'B+', 'O+'], unitsAvailable: 120 },
			{ id: 'ERK-2', name: 'Metro Hospital Bank', city: 'Hyderabad', bloodGroups: ['AB+', 'O-'], unitsAvailable: 45 }
		],
		updatedAt: new Date().toISOString()
	};
}

function mockBloodBridge() {
	return {
		stores: [
			{ code: 'BB-100', title: 'NGO Blood Store', town: 'Hyderabad', stock: [{ group: 'A+', count: 50 }, { group: 'O+', count: 30 }] }
		],
		generated: Date.now()
	};
}

function normalize(source, payload) {
	if (source === 'eraktkosh') {
		return payload.centers.map(c => ({ id: c.id, name: c.name, city: c.city, summary: `${c.unitsAvailable} units`, groups: c.bloodGroups }));
	}
	if (source === 'bloodbridge') {
		return payload.stores.map(s => ({ id: s.code, name: s.title, city: s.town, summary: `${s.stock.reduce((a,b)=>a+b.count,0)} units`, groups: s.stock.map(x => x.group) }));
	}
	return [];
}

export async function getEraktKosh(req, res) {
	const payload = mockEraktKosh();
	const normalized = normalize('eraktkosh', payload);
	await IntegrationLog.create({ source: 'eraktkosh', payload, normalized, status: 'success' });
	return res.json({ source: 'eraktkosh', data: normalized });
}

export async function getBloodBridge(req, res) {
	const payload = mockBloodBridge();
	const normalized = normalize('bloodbridge', payload);
	await IntegrationLog.create({ source: 'bloodbridge', payload, normalized, status: 'success' });
	return res.json({ source: 'bloodbridge', data: normalized });
}