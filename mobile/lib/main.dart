import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'l10n/l10n.dart';
import 'providers/auth_provider.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';

void main() {
	runApp(const JeevanDharaApp());
}

class JeevanDharaApp extends StatelessWidget {
	const JeevanDharaApp({super.key});

	@override
	Widget build(BuildContext context) {
		return MultiProvider(
			providers: [
				ChangeNotifierProvider(create: (_) => AuthProvider()),
			],
			child: MaterialApp(
				title: 'JeevanDhara',
				supportedLocales: L10n.supportedLocales,
				locale: const Locale('en'),
				localizationsDelegates: const [
					GlobalMaterialLocalizations.delegate,
					GlobalWidgetsLocalizations.delegate,
					GlobalCupertinoLocalizations.delegate,
				],
				home: Consumer<AuthProvider>(
					builder: (context, auth, _) => auth.isAuthenticated ? const HomeScreen() : const LoginScreen(),
				),
			));
	}
}