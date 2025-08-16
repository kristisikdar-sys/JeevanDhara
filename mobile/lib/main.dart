import 'package:flutter/material.dart';

void main() {
  runApp(const JeevanDharaApp());
}

class JeevanDharaApp extends StatelessWidget {
  const JeevanDharaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'JeevanDhara',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),
      home: const Scaffold(
        body: Center(child: Text('Hello JeevanDhara')),
      ),
    );
  }
}
