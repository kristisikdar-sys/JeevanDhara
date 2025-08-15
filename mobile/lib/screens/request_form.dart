import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class RequestFormScreen extends StatefulWidget {
	const RequestFormScreen({super.key});
	@override
	State<RequestFormScreen> createState() => _RequestFormScreenState();
}

class _RequestFormScreenState extends State<RequestFormScreen> {
	final _bgController = TextEditingController(text: 'A+');
	double _lat = 17.39;
	double _lng = 78.48;
	bool _loading = false;
	String? _result;

	Future<void> _submit() async {
		setState(() { _loading = true; _result = null; });
		final token = context.read<AuthProvider>().token;
		final uri = Uri.parse('http://10.0.2.2:4000/api/requests');
		final body = jsonEncode({ 'blood_group': _bgController.text, 'units_needed': 2, 'location': { 'lat': _lat, 'lng': _lng, 'address': 'Hyderabad' } });
		final res = await http.post(uri, headers: { 'Authorization':'Bearer $token', 'Content-Type':'application/json' }, body: body);
		setState(() { _loading = false; _result = res.body; });
	}

	@override
	Widget build(BuildContext context) {
		return Scaffold(
			appBar: AppBar(title: const Text('Request Blood')),
			body: Padding(
				padding: const EdgeInsets.all(16),
				child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
					TextField(controller: _bgController, decoration: const InputDecoration(labelText: 'Blood Group')),
					Row(children: [
						Expanded(child: Text('Lat: ${_lat.toStringAsFixed(4)}')),
						Expanded(child: Text('Lng: ${_lng.toStringAsFixed(4)}')),
					]),
					const SizedBox(height: 12),
					ElevatedButton(onPressed: _loading?null:_submit, child: _loading?const CircularProgressIndicator():const Text('Create Request')),
					const SizedBox(height: 12),
					if (_result != null) Expanded(child: SingleChildScrollView(child: Text(_result!)))
				])
			)
		);
	}
}