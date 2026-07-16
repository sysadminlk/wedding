import 'package:flutter/material.dart';

class EmailTemplateListScreen extends StatelessWidget {
  const EmailTemplateListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Email Templates')),
      body: const Center(child: Text('Email Templates')),
    );
  }
}
