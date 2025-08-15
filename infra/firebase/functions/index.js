const functions = require('firebase-functions');
const admin = require('firebase-admin');

try { admin.initializeApp(); } catch (e) {}

exports.sendReminder = functions.firestore
	.document('reminders/{reminderId}')
	.onCreate(async (snap, context) => {
		const data = snap.data();
		console.log('Reminder created for user', data.userId, 'at', data.scheduledAt);
		return true;
	});