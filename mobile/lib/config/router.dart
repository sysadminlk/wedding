import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/register_screen.dart';
import '../features/auth/verify_email_screen.dart';
import '../features/auth/forgot_password_screen.dart';
import '../features/dashboard/dashboard_screen.dart';
import '../features/guests/guest_list_screen.dart';
import '../features/checklist/checklist_screen.dart';
import '../features/budget/budget_screen.dart';
import '../features/vendors/vendor_list_screen.dart';
import '../features/crew/crew_list_screen.dart';
import '../features/timeline/timeline_screen.dart';
import '../features/inspiration/inspiration_screen.dart';
import '../features/menu/menu_screen.dart';
import '../features/photos/photo_gallery_screen.dart';
import '../features/memories/memories_screen.dart';
import '../features/seating/seating_screen.dart';
import '../features/website/website_editor_screen.dart';
import '../features/rsvp/rsvp_screen.dart';
import '../features/email_templates/email_template_list_screen.dart';
import '../features/collaborators/collaborator_list_screen.dart';
import '../features/billing/billing_screen.dart';
import '../features/settings/settings_screen.dart';
import '../services/auth_service.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authService = ref.read(authServiceProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) async {
      final loggedIn = await authService.isLoggedIn();
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register' ||
          state.matchedLocation == '/forgot-password' ||
          state.matchedLocation == '/verify-email' ||
          state.matchedLocation.startsWith('/invite/');

      if (!loggedIn && !isAuthRoute) {
        return '/login';
      }

      if (loggedIn && isAuthRoute) {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/verify-email',
        builder: (context, state) => const VerifyEmailScreen(),
      ),
      GoRoute(
        path: '/',
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: '/guests',
        builder: (context, state) => const GuestListScreen(),
      ),
      GoRoute(
        path: '/checklist',
        builder: (context, state) => const ChecklistScreen(),
      ),
      GoRoute(
        path: '/budget',
        builder: (context, state) => const BudgetScreen(),
      ),
      GoRoute(
        path: '/vendors',
        builder: (context, state) => const VendorListScreen(),
      ),
      GoRoute(
        path: '/crew',
        builder: (context, state) => const CrewListScreen(),
      ),
      GoRoute(
        path: '/timeline',
        builder: (context, state) => const TimelineScreen(),
      ),
      GoRoute(
        path: '/inspiration',
        builder: (context, state) => const InspirationScreen(),
      ),
      GoRoute(
        path: '/menu',
        builder: (context, state) => const MenuScreen(),
      ),
      GoRoute(
        path: '/photos',
        builder: (context, state) => const PhotoGalleryScreen(),
      ),
      GoRoute(
        path: '/memories',
        builder: (context, state) => const MemoriesScreen(),
      ),
      GoRoute(
        path: '/seating',
        builder: (context, state) => const SeatingScreen(),
      ),
      GoRoute(
        path: '/website',
        builder: (context, state) => const WebsiteEditorScreen(),
      ),
      GoRoute(
        path: '/rsvp',
        builder: (context, state) => const RsvpScreen(),
      ),
      GoRoute(
        path: '/email-templates',
        builder: (context, state) => const EmailTemplateListScreen(),
      ),
      GoRoute(
        path: '/collaborators',
        builder: (context, state) => const CollaboratorListScreen(),
      ),
      GoRoute(
        path: '/billing',
        builder: (context, state) => const BillingScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/invite/:token',
        builder: (context, state) {
          final token = state.pathParameters['token']!;
          return InviteAcceptScreen(token: token);
        },
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Page not found: ${state.matchedLocation}')),
    ),
  );
});

class InviteAcceptScreen extends StatelessWidget {
  final String token;
  const InviteAcceptScreen({super.key, required this.token});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Accept Invitation')),
      body: Center(
        child: Text('Processing invitation: $token'),
      ),
    );
  }
}
