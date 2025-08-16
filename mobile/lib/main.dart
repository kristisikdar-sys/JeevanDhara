import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

void main() {
	runApp(const JeevanDharaApp());
}

class JeevanDharaApp extends StatelessWidget {
	const JeevanDharaApp({super.key});

	@override
	Widget build(BuildContext context) {
		return MaterialApp(
			title: 'JeevanDhara',
			supportedLocales: const [
				Locale('en'),
				Locale('hi'),
				Locale('te'),
			],
			localizationsDelegates: const [
				GlobalMaterialLocalizations.delegate,
				GlobalWidgetsLocalizations.delegate,
				GlobalCupertinoLocalizations.delegate,
			],
			home: const Scaffold(
				body: Center(child: Text('Hello JeevanDhara')),
			),
		);
	}
}