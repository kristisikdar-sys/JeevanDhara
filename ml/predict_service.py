import os
import json
import numpy as np
from flask import Flask, request, jsonify
import tensorflow as tf

MODEL_PATH = os.environ.get('MODEL_PATH', 'donor_predictor.h5')

BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

app = Flask(__name__)
model = None

@app.before_first_request
def load_model():
	global model
	model = tf.keras.models.load_model(MODEL_PATH)

@app.post('/predict')
def predict():
	payload = request.get_json(force=True)
	try:
		bg = [1.0 if payload['blood_group'] == g else 0.0 for g in BLOOD_GROUPS]
		x = np.array([[float(payload['last_donation_days']), float(payload['avg_donations_per_year']), float(payload['engagement_score']), float(payload['area_demand_index'])] + bg], dtype='float32')
		prob = float(model.predict(x, verbose=0)[0][0])
		return jsonify({ 'donor_id': payload.get('donor_id'), 'probability': prob })
	except Exception as e:
		return jsonify({ 'error': str(e) }), 400

if __name__ == '__main__':
	port = int(os.environ.get('PORT', '5001'))
	app.run(host='0.0.0.0', port=port)