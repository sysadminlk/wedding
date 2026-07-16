import 'package:flutter/material.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('weddingWire'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              // TODO: Implement logout
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Countdown Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Text(
                      'Your Wedding Day',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontFamily: 'Playfair Display',
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '123 days to go',
                      style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                        fontFamily: 'Playfair Display',
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Quick Stats
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    title: 'Guests',
                    value: '42',
                    icon: Icons.people,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _StatCard(
                    title: 'Budget',
                    value: '\$12,500',
                    icon: Icons.attach_money,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Section Tiles
            Text(
              'Planning Sections',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontFamily: 'Playfair Display',
              ),
            ),
            const SizedBox(height: 16),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              children: [
                _SectionTile(title: 'Checklist', icon: Icons.check_circle_outline),
                _SectionTile(title: 'Guests', icon: Icons.people_outline),
                _SectionTile(title: 'Seating', icon: Icons.table_chart_outlined),
                _SectionTile(title: 'Budget', icon: Icons.account_balance_wallet_outlined),
                _SectionTile(title: 'Vendors', icon: Icons.store_outlined),
                _SectionTile(title: 'Timeline', icon: Icons.schedule_outlined),
                _SectionTile(title: 'Photos', icon: Icons.photo_library_outlined),
                _SectionTile(title: 'Menu', icon: Icons.restaurant_outlined),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, size: 32, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 8),
            Text(title, style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 4),
            Text(value, style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            )),
          ],
        ),
      ),
    );
  }
}

class _SectionTile extends StatelessWidget {
  final String title;
  final IconData icon;

  const _SectionTile({
    required this.title,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: () {
          // TODO: Navigate to section
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 40, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 8),
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
