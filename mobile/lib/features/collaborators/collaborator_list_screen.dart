import 'package:flutter/material.dart';

class CollaboratorListScreen extends StatelessWidget {
  const CollaboratorListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Collaborators')),
      body: const Center(child: Text('Collaborator Management')),
    );
  }
}
