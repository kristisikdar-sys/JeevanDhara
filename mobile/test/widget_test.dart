import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jeevandhara/main.dart';

void main() {
	testWidgets('App renders login by default', (tester) async {
		await tester.pumpWidget(const JeevanDharaApp());
		expect(find.text('Login'), findsOneWidget);
	});
}