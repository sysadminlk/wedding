import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../config/theme.dart';
import '../services/auth_state.dart';

class AppDrawer extends ConsumerWidget {
  final String currentSection;
  final VoidCallback onLogout;

  const AppDrawer({
    super.key,
    required this.currentSection,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return Drawer(
      backgroundColor: AtelierTheme.espresso,
      child: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  _buildHeader(context, authState),
                  _buildNavGroup(context, 'Planning', [
                    _NavItem('Dashboard', Icons.dashboard, 'dashboard', '/'),
                    _NavItem('Checklist', Icons.check_circle_outline, 'checklist', '/checklist'),
                    _NavItem('Guests', Icons.people_outline, 'guests', '/guests'),
                    _NavItem('Seating', Icons.table_chart_outlined, 'seating', '/seating'),
                    _NavItem('Budget', Icons.account_balance_wallet_outlined, 'budget', '/budget'),
                    _NavItem('Vendors', Icons.store_outlined, 'vendors', '/vendors'),
                    _NavItem('Wedding Crew', Icons.group_outlined, 'crew', '/crew'),
                    _NavItem('Timeline', Icons.schedule_outlined, 'timeline', '/timeline'),
                  ]),
                  _buildNavGroup(context, 'Content', [
                    _NavItem('Inspiration', Icons.lightbulb_outline, 'inspiration', '/inspiration'),
                    _NavItem('Wedding Menu', Icons.restaurant_outlined, 'menu', '/menu'),
                    _NavItem('Photos', Icons.photo_library_outlined, 'photos', '/photos'),
                    _NavItem('Guest Memories', Icons.video_library_outlined, 'memories', '/memories'),
                  ]),
                  _buildNavGroup(context, 'Customize', [
                    _NavItem('Public Website', Icons.language, 'website', '/website'),
                    _NavItem('RSVP Page', Icons.mail_outline, 'rsvp', '/rsvp'),
                    _NavItem('Email Templates', Icons.email_outlined, 'email-templates', '/email-templates'),
                    _NavItem('Collaborators', Icons.person_add_outlined, 'collaborators', '/collaborators'),
                  ]),
                  _buildNavGroup(context, 'Account', [
                    _NavItem('Billing', Icons.credit_card_outlined, 'billing', '/billing'),
                    _NavItem('Settings', Icons.settings_outlined, 'settings', '/settings'),
                  ]),
                ],
              ),
            ),
            _buildBottomLogout(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, AuthStateModel authState) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AtelierTheme.goldDark, width: 0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: AtelierTheme.gold,
            child: Text(
              (authState.name ?? 'U').substring(0, 1).toUpperCase(),
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AtelierTheme.espresso,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            authState.name ?? 'User',
            style: const TextStyle(
              color: AtelierTheme.ivory,
              fontSize: 18,
              fontWeight: FontWeight.w600,
              fontFamily: 'Playfair Display',
            ),
          ),
          const SizedBox(height: 4),
          Text(
            authState.email ?? '',
            style: const TextStyle(
              color: AtelierTheme.goldLight,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 10),
          _buildPlanBadge('Premium'),
          const SizedBox(height: 8),
          Text(
            '247 days until the big day',
            style: const TextStyle(
              color: AtelierTheme.gold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlanBadge(String plan) {
    final Color badgeColor;
    switch (plan) {
      case 'Premium':
        badgeColor = AtelierTheme.gold;
        break;
      case 'Planner':
        badgeColor = const Color(0xFF4CAF50);
        break;
      default:
        badgeColor = AtelierTheme.goldDark;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: badgeColor.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: badgeColor),
      ),
      child: Text(
        plan,
        style: TextStyle(
          color: badgeColor,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildNavGroup(BuildContext context, String groupTitle, List<_NavItem> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
          child: Text(
            groupTitle,
            style: const TextStyle(
              color: AtelierTheme.goldDark,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
            ),
          ),
        ),
        ...items.map((item) => _buildNavItem(context, item)),
      ],
    );
  }

  Widget _buildNavItem(BuildContext context, _NavItem item) {
    final selected = currentSection == item.key;
    return InkWell(
      onTap: () {
        Navigator.pop(context);
        context.go(item.route);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: selected ? AtelierTheme.gold.withOpacity(0.15) : Colors.transparent,
          border: Border(
            left: BorderSide(
              color: selected ? AtelierTheme.gold : Colors.transparent,
              width: 3,
            ),
          ),
        ),
        child: Row(
          children: [
            Icon(
              item.icon,
              size: 20,
              color: selected ? AtelierTheme.gold : AtelierTheme.goldLight,
            ),
            const SizedBox(width: 16),
            Text(
              item.label,
              style: TextStyle(
                color: selected ? AtelierTheme.gold : AtelierTheme.ivory,
                fontSize: 15,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomLogout(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(color: AtelierTheme.goldDark, width: 0.5),
        ),
      ),
      child: InkWell(
        onTap: onLogout,
        child: const Padding(
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Row(
            children: [
              Icon(Icons.logout, size: 20, color: AtelierTheme.goldLight),
              SizedBox(width: 16),
              Text(
                'Logout',
                style: TextStyle(
                  color: AtelierTheme.goldLight,
                  fontSize: 15,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final String label;
  final IconData icon;
  final String key;
  final String route;

  const _NavItem(this.label, this.icon, this.key, this.route);
}
