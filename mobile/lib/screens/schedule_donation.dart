import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class ScheduleDonationScreen extends StatefulWidget {
	const ScheduleDonationScreen({super.key});
	@override
	State<ScheduleDonationScreen> createState() => _ScheduleDonationScreenState();
}

class _ScheduleDonationScreenState extends State<ScheduleDonationScreen> {
	final FlutterLocalNotificationsPlugin _notifier = FlutterLocalNotificationsPlugin();
	DateTime? _scheduled;

	@override
	void initState() {
		super.initState();
		const android = AndroidInitializationSettings('@mipmap/ic_launcher');
		_notifier.initialize(const InitializationSettings(android: android));
	}

	Future<void> _pickAndSchedule() async {
		final now = DateTime.now();
		final date = await showDatePicker(context: context, firstDate: now, lastDate: now.add(const Duration(days: 30)), initialDate: now);
		if (date == null) return;
		final time = await showTimePicker(context: context, initialTime: const TimeOfDay(hour: 9, minute: 0));
		if (time == null) return;
		final dt = DateTime(date.year, date.month, date.day, time.hour, time.minute);
		setState(() { _scheduled = dt; });
		await _notifier.zonedSchedule(
			0,
			'Donation Reminder',
			"It's time for your scheduled donation",
			// For simplicity in hackathon, schedule 5 seconds from now instead of actual dt
			DateTime.now().add(const Duration(seconds: 5)),
			const NotificationDetails(android: AndroidNotificationDetails('donate','Donations', importance: Importance.max, priority: Priority.high)),
			androidAllowWhileIdle: true,
			uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
			matchDateTimeComponents: DateTimeComponents.dateAndTime
		);
	}

	@override
	Widget build(BuildContext context) {
		return Scaffold(
			appBar: AppBar(title: const Text('Schedule Donation')),
			body: Center(
				child: Column(mainAxisSize: MainAxisSize.min, children: [
					if (_scheduled != null) Text('Scheduled: $_scheduled'),
					ElevatedButton(onPressed: _pickAndSchedule, child: const Text('Pick date & schedule'))
				])
			)
		);
	}
}