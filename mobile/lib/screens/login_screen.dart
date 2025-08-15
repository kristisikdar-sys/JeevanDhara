import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
	const LoginScreen({super.key});
	@override
	State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
	final _idController = TextEditingController(text: 'user@example.com');
	final _pwController = TextEditingController(text: 'secret12');
	bool _loading = false;
	String? _error;

	Future<void> _login() async {
		setState(() { _loading = true; _error = null; });
		try {
			final res = await http.post(Uri.parse('http://10.0.2.2:4000/api/auth/login'), headers: {'Content-Type':'application/json'}, body: jsonEncode({ 'identifier': _idController.text, 'password': _pwController.text }));
			if (res.statusCode == 200) {
				final body = jsonDecode(res.body) as Map<String,dynamic>;
				context.read<AuthProvider>().setToken(body['accessToken']);
			} else {
				setState(() { _error = res.body; });
			}
		} catch (e) {
			setState(() { _error = e.toString(); });
		} finally {
			setState(() { _loading = false; });
		}
	}

	@override
	Widget build(BuildContext context) {
		return Scaffold(
			appBar: AppBar(title: const Text('Login')),
			body: Padding(
				padding: const EdgeInsets.all(16),
				child: Column(children: [
					TextField(controller: _idController, decoration: const InputDecoration(labelText: 'Email or Phone')),
					TextField(controller: _pwController, obscureText: true, decoration: const InputDecoration(labelText: 'Password')),
					const SizedBox(height: 12),
					if (_error != null) Text(_error!, style: const TextStyle(color: Colors.red)),
					ElevatedButton(onPressed: _loading ? null : _login, child: _loading ? const CircularProgressIndicator() : const Text('Login')),
				])
			)
		);
	}
}