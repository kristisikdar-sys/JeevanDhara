import 'package:flutter/material.dart';

class AuthProvider extends ChangeNotifier {
	String? _token;
	bool get isAuthenticated => _token != null;
	String? get token => _token;

	void setToken(String? token) {
		_token = token;
		notifyListeners();
	}
}