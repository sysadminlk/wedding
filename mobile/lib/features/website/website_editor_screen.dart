import 'package:flutter/material.dart';

class WebsiteEditorScreen extends StatelessWidget {
  const WebsiteEditorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Website')),
      body: const Center(child: Text('Website Editor')),
    );
  }
}
