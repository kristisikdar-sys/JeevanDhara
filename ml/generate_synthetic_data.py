import numpy as np
import pandas as pd

rng = np.random.default_rng(42)

BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

N = 10000

def generate():
	data = []
	for i in range(N):
		donor_id = f"D{i:05d}"
		blood_group = rng.choice(BLOOD_GROUPS)
		last_donation_days = rng.integers(0, 365)
		avg_donations_per_year = rng.uniform(0, 4)
		engagement_score = rng.uniform(0, 1)
		area_demand_index = rng.uniform(0, 1)
		# True probability function (unknown to model)
		p = 0.2 + 0.4*(last_donation_days>=90) + 0.2*engagement_score + 0.2*area_demand_index - 0.1*(avg_donations_per_year<1)
		p = np.clip(p, 0, 1)
		label = rng.binomial(1, p)
		data.append((donor_id, blood_group, int(last_donation_days), float(avg_donations_per_year), float(engagement_score), float(area_demand_index), int(label)))
	df = pd.DataFrame(data, columns=['donor_id','blood_group','last_donation_days','avg_donations_per_year','engagement_score','area_demand_index','label'])
	return df

if __name__ == '__main__':
	df = generate()
	df.to_csv('synthetic_donors.csv', index=False)
	print('Saved synthetic_donors.csv', df.shape)