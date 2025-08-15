import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score
import tensorflow as tf

CSV_PATH = os.environ.get('CSV_PATH', 'synthetic_donors.csv')
MODEL_PATH = os.environ.get('MODEL_PATH', 'donor_predictor.h5')

BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

def load_data():
	df = pd.read_csv(CSV_PATH)
	X_num = df[['last_donation_days','avg_donations_per_year','engagement_score','area_demand_index']].values.astype('float32')
	bg = pd.get_dummies(df['blood_group'], columns=BLOOD_GROUPS).values.astype('float32')
	X = np.concatenate([X_num, bg], axis=1)
	y = df['label'].values.astype('float32')
	return X, y

if __name__ == '__main__':
	X, y = load_data()
	x_train, x_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
	model = tf.keras.Sequential([
		tf.keras.layers.Input(shape=(x_train.shape[1],)),
		tf.keras.layers.Dense(32, activation='relu'),
		tf.keras.layers.Dense(16, activation='relu'),
		tf.keras.layers.Dense(1, activation='sigmoid')
	])
	model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
	model.summary()
	model.fit(x_train, y_train, validation_split=0.2, epochs=8, batch_size=64, verbose=2)
	pred = (model.predict(x_test)[:,0]).astype('float32')
	acc = accuracy_score(y_test, (pred>0.5).astype(int))
	try:
		auc = roc_auc_score(y_test, pred)
	except Exception:
		auc = float('nan')
	print({'accuracy': float(acc), 'roc_auc': float(auc)})
	model.save(MODEL_PATH)
	print('Saved model to', MODEL_PATH)