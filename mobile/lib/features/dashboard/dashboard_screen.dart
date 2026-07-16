import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../widgets/app_scaffold.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AppScaffold(
      title: 'weddingWire',
      sectionKey: 'dashboard',
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.delayed(const Duration(seconds: 1));
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildCountdownCard(context),
              const SizedBox(height: 16),
              _buildQuickStatsRow(context),
              const SizedBox(height: 24),
              _buildRecentActivity(context),
              const SizedBox(height: 24),
              _buildUpcomingTasks(context),
              const SizedBox(height: 24),
              _buildBudgetSummary(context),
              const SizedBox(height: 24),
              _buildSectionGrid(context),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCountdownCard(BuildContext context) {
    return Card(
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: const LinearGradient(
            colors: [AtelierTheme.espresso, AtelierTheme.espressoLight],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          children: [
            Text(
              'Sarah & Michael',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontFamily: 'Playfair Display',
                color: AtelierTheme.ivory,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'The Ritz-Carlton, New York',
              style: TextStyle(
                color: AtelierTheme.goldLight,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              '247',
              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                fontFamily: 'Playfair Display',
                color: AtelierTheme.gold,
                fontWeight: FontWeight.bold,
                fontSize: 56,
              ),
            ),
            Text(
              'days to go',
              style: TextStyle(
                color: AtelierTheme.goldLight,
                fontSize: 16,
                letterSpacing: 2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickStatsRow(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _StatCard(
          title: 'Total Guests',
          value: '42',
          subtitle: '38 attending',
          icon: Icons.people,
        )),
        const SizedBox(width: 12),
        Expanded(child: _StatCard(
          title: 'Tasks Left',
          value: '18',
          subtitle: 'of 42 complete',
          icon: Icons.check_circle_outline,
        )),
      ],
    );
  }

  Widget _buildRecentActivity(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recent Activity',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontFamily: 'Playfair Display',
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Column(
            children: [
              _ActivityItem(
                icon: Icons.check_circle,
                iconColor: const Color(0xFF4CAF50),
                text: 'Completed venue booking',
                subtitle: 'Checklist',
              ),
              const Divider(height: 1, indent: 60),
              _ActivityItem(
                icon: Icons.person_add,
                iconColor: const Color(0xFF2196F3),
                text: 'Sarah confirmed attendance',
                subtitle: 'Guests',
              ),
              const Divider(height: 1, indent: 60),
              _ActivityItem(
                icon: Icons.attach_money,
                iconColor: const Color(0xFFFF9800),
                text: 'Deposit paid to caterer',
                subtitle: 'Budget',
              ),
              const Divider(height: 1, indent: 60),
              _ActivityItem(
                icon: Icons.star,
                iconColor: AtelierTheme.gold,
                text: 'Photographer confirmed',
                subtitle: 'Vendors',
              ),
              const Divider(height: 1, indent: 60),
              _ActivityItem(
                icon: Icons.restaurant,
                iconColor: const Color(0xFF9C27B0),
                text: 'Menu tasting scheduled',
                subtitle: 'Wedding Menu',
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildUpcomingTasks(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Upcoming Tasks',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontFamily: 'Playfair Display',
                fontWeight: FontWeight.w600,
              ),
            ),
            TextButton(
              onPressed: () => context.push('/checklist'),
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Card(
          child: Column(
            children: [
              _TaskItem(
                title: 'Book florist consultation',
                dueDate: 'Jul 20, 2026',
                category: 'Vendors',
              ),
              const Divider(height: 1, indent: 16),
              _TaskItem(
                title: 'Finalize guest list',
                dueDate: 'Jul 25, 2026',
                category: 'Guests',
              ),
              const Divider(height: 1, indent: 16),
              _TaskItem(
                title: 'Order wedding bands',
                dueDate: 'Aug 1, 2026',
                category: 'Wedding Crew',
              ),
              const Divider(height: 1, indent: 16),
              _TaskItem(
                title: 'Plan honeymoon itinerary',
                dueDate: 'Aug 10, 2026',
                category: 'Timeline',
              ),
              const Divider(height: 1, indent: 16),
              _TaskItem(
                title: 'Send save-the-dates',
                dueDate: 'Aug 15, 2026',
                category: 'Email Templates',
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBudgetSummary(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Budget Summary',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontFamily: 'Playfair Display',
                fontWeight: FontWeight.w600,
              ),
            ),
            TextButton(
              onPressed: () => context.push('/budget'),
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Estimated',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AtelierTheme.espresso.withOpacity(0.6),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '\$45,000',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Spent',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AtelierTheme.espresso.withOpacity(0.6),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '\$28,350',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AtelierTheme.gold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Remaining',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AtelierTheme.espresso.withOpacity(0.6),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '\$16,650',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF4CAF50),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: 28350 / 45000,
                    minHeight: 10,
                    backgroundColor: AtelierTheme.ivoryDark,
                    valueColor: const AlwaysStoppedAnimation<Color>(AtelierTheme.gold),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '63% of budget used',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AtelierTheme.espresso.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSectionGrid(BuildContext context) {
    final sections = [
      _SectionData('Checklist', Icons.check_circle_outline, '/checklist'),
      _SectionData('Guests', Icons.people_outline, '/guests'),
      _SectionData('Seating', Icons.table_chart_outlined, '/seating'),
      _SectionData('Budget', Icons.account_balance_wallet_outlined, '/budget'),
      _SectionData('Vendors', Icons.store_outlined, '/vendors'),
      _SectionData('Wedding Crew', Icons.group_outlined, '/crew'),
      _SectionData('Timeline', Icons.schedule_outlined, '/timeline'),
      _SectionData('Inspiration', Icons.lightbulb_outline, '/inspiration'),
      _SectionData('Wedding Menu', Icons.restaurant_outlined, '/menu'),
      _SectionData('Photos', Icons.photo_library_outlined, '/photos'),
      _SectionData('Guest Memories', Icons.video_library_outlined, '/memories'),
      _SectionData('Public Website', Icons.language, '/website'),
      _SectionData('RSVP Page', Icons.mail_outline, '/rsvp'),
      _SectionData('Email Templates', Icons.email_outlined, '/email-templates'),
      _SectionData('Collaborators', Icons.person_add_outlined, '/collaborators'),
      _SectionData('Billing', Icons.credit_card_outlined, '/billing'),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'All Sections',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontFamily: 'Playfair Display',
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        GridView.builder(
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.1,
          ),
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: sections.length,
          itemBuilder: (context, index) {
            final section = sections[index];
            return _SectionTile(
              title: section.title,
              icon: section.icon,
              onTap: () => context.push(section.route),
            );
          },
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;

  const _StatCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 24, color: AtelierTheme.gold),
            const SizedBox(height: 12),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                fontFamily: 'Playfair Display',
              ),
            ),
            const SizedBox(height: 2),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AtelierTheme.espresso.withOpacity(0.6),
              ),
            ),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AtelierTheme.gold,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActivityItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String text;
  final String subtitle;

  const _ActivityItem({
    required this.icon,
    required this.iconColor,
    required this.text,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: iconColor.withOpacity(0.1),
        child: Icon(icon, color: iconColor, size: 20),
      ),
      title: Text(text, style: const TextStyle(fontSize: 14)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
      dense: true,
    );
  }
}

class _TaskItem extends StatelessWidget {
  final String title;
  final String dueDate;
  final String category;

  const _TaskItem({
    required this.title,
    required this.dueDate,
    required this.category,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: const Icon(Icons.radio_button_unchecked, color: AtelierTheme.goldDark),
      title: Text(title, style: const TextStyle(fontSize: 14)),
      subtitle: Row(
        children: [
          Text(dueDate, style: const TextStyle(fontSize: 12)),
          const SizedBox(width: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: AtelierTheme.gold.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              category,
              style: const TextStyle(
                fontSize: 10,
                color: AtelierTheme.gold,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      dense: true,
    );
  }
}

class _SectionTile extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback onTap;

  const _SectionTile({
    required this.title,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 32, color: AtelierTheme.gold),
              const SizedBox(height: 8),
              Text(
                title,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionData {
  final String title;
  final IconData icon;
  final String route;

  const _SectionData(this.title, this.icon, this.route);
}
