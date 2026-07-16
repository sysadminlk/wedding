import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_service.dart';

class AuthStateModel {
  final bool isLoggedIn;
  final String? userId;
  final String? tenantId;
  final String? name;
  final String? email;

  const AuthStateModel({
    this.isLoggedIn = false,
    this.userId,
    this.tenantId,
    this.name,
    this.email,
  });

  AuthStateModel copyWith({
    bool? isLoggedIn,
    String? userId,
    String? tenantId,
    String? name,
    String? email,
  }) {
    return AuthStateModel(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      userId: userId ?? this.userId,
      tenantId: tenantId ?? this.tenantId,
      name: name ?? this.name,
      email: email ?? this.email,
    );
  }

  static const initial = AuthStateModel();
}

class AuthStateNotifier extends StateNotifier<AuthStateModel> {
  final AuthService _authService;

  AuthStateNotifier(this._authService) : super(AuthStateModel.initial);

  Future<void> checkAuthStatus() async {
    final loggedIn = await _authService.isLoggedIn();
    if (loggedIn) {
      final userId = await _authService.getCurrentUserId();
      final tenantId = await _authService.getCurrentTenantId();
      state = AuthStateModel(
        isLoggedIn: true,
        userId: userId,
        tenantId: tenantId,
      );
    } else {
      state = AuthStateModel.initial;
    }
  }

  Future<void> onLogin({
    required String? userId,
    required String? tenantId,
    String? name,
    String? email,
  }) async {
    state = AuthStateModel(
      isLoggedIn: true,
      userId: userId,
      tenantId: tenantId,
      name: name,
      email: email,
    );
  }

  Future<void> onLogout() async {
    await _authService.logout();
    state = AuthStateModel.initial;
  }
}

final authStateProvider = StateNotifierProvider<AuthStateNotifier, AuthStateModel>((ref) {
  return AuthStateNotifier(ref.read(authServiceProvider));
});
