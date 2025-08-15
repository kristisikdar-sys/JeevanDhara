import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class HomeScreen extends StatefulWidget {
	const HomeScreen({super.key});
	@override
	State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
	static const LatLng hyderabad = LatLng(17.3850, 78.4867);
	GoogleMapController? _controller;
	Set<Circle> _heat = {};

	Future<void> _loadHeat() async {
		final token = context.read<AuthProvider>().token;
		final uri = Uri.parse('http://10.0.2.2:4000/api/donors/nearby?lat=${hyderabad.latitude}&lng=${hyderabad.longitude}&radius=20');
		final res = await http.get(uri, headers: {'Authorization':'Bearer $token'});
		if (res.statusCode == 200) {
			final List<dynamic> list = jsonDecode(res.body);
			final circles = <Circle>{};
			for (final d in list.take(200)) {
				final lat = (d['location']['lat'] as num).toDouble();
				final lng = (d['location']['lng'] as num).toDouble();
				circles.add(Circle(circleId: CircleId('${lat},${lng}'), center: LatLng(lat, lng), radius: 200, fillColor: Colors.red.withOpacity(0.15), strokeWidth: 0));
			}
			setState(() { _heat = circles; });
		}
	}

	@override
	void initState() {
		super.initState();
		WidgetsBinding.instance.addPostFrameCallback((_) => _loadHeat());
	}

	@override
	Widget build(BuildContext context) {
		return Scaffold(
			appBar: AppBar(title: const Text('JeevanDhara')),
			body: GoogleMap(
				initialCameraPosition: const CameraPosition(target: hyderabad, zoom: 11),
				myLocationEnabled: true,
				circles: _heat,
				onMapCreated: (c) => _controller = c,
			),
		);
	}
}