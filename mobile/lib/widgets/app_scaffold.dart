import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../config/theme.dart';
import '../providers/current_section_provider.dart';
import '../services/auth_state.dart';
import 'app_drawer.dart';

class AppScaffold extends ConsumerWidget {
  final String title;
  final Widget body;
  final String sectionKey;

  const AppScaffold({
    super.key,
    required this.title,
    required this.body,
    required this.sectionKey,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentSection = ref.watch(currentSectionProvider);

    return Builder(
      builder: (context) {
        final scaffoldKey = Scaffold.maybeOf(context)?.key;
        return Scaffold(
          appBar: AppBar(
            title: Text(
              title,
              style: const TextStyle(
                fontFamily: 'Playfair Display',
                fontWeight: FontWeight.w600,
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.search),
                onPressed: () {},
              ),
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () {},
              ),
            ],
          ),
          drawer: AppDrawer(
            currentSection: currentSection,
            onLogout: () async {
              await ref.read(authStateProvider.notifier).onLogout();
              if (context.mounted) {
                context.go('/login');
              }
            },
          ),
          body: body,
          bottomNavigationBar: _buildBottomNav(context, ref, currentSection),
        );
      },
    );
  }

  Widget _buildBottomNav(BuildContext context, WidgetRef ref, String currentSection) {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(color: AtelierTheme.goldDark.withOpacity(0.3)),
        ),
      ),
      child: BottomNavigationBar(
        backgroundColor: AtelierTheme.ivory,
        selectedItemColor: AtelierTheme.gold,
        unselectedItemColor: AtelierTheme.espresso.withOpacity(0.5),
        type: BottomNavigationBarType.fixed,
        currentIndex: _indexForSection(currentSection),
        onTap: (index) {
          final route = _routeForIndex(index);
          if (route == null) {
            Scaffold.of(context).openDrawer();
          } else {
            ref.read(currentSectionProvider.notifier).state = _keyForIndex(index);
            context.go(route);
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people_outline),
            activeIcon: Icon(Icons.people),
            label: 'Guests',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.account_balance_wallet_outlined),
            activeIcon: Icon(Icons.account_balance_wallet),
            label: 'Budget',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.store_outlined),
            activeIcon: Icon(Icons.store),
            label: 'Vendors',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.more_horiz),
            activeIcon: Icon(Icons.more_horiz),
            label: 'More',
          ),
        ],
      ),
    );
  }

  int _indexForSection(String section) {
    switch (section) {
      case 'dashboard':
        return 0;
      case 'guests':
        return 1;
      case 'budget':
        return 2;
      case 'vendors':
        return 3;
      default:
        return 4;
    }
  }

  String _keyForIndex(int index) {
    switch (index) {
      case 0:
        return 'dashboard';
      case 1:
        return 'guests';
      case 2:
        return 'budget';
      case 3:
        return 'vendors';
      default:
        return 'dashboard';
    }
  }

  String? _routeForIndex(int index) {
    switch (index) {
      case 0:
        return '/';
      case 1:
        return '/guests';
      case 2:
        return '/budget';
      case 3:
        return '/vendors';
      default:
        return null;
    }
  }
}
