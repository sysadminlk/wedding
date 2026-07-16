import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_client.dart';

class AuthService {
  final ApiClient _apiClient;
  final FlutterSecureStorage _storage;

  static const _userIdKey = 'user_id';
  static const _tenantIdKey = 'tenant_id';
  static const _nameKey = 'user_name';
  static const _emailKey = 'user_email';

  AuthService(this._apiClient) : _storage = const FlutterSecureStorage();

  Future<void> login(String email, String password) async {
    final response = await _apiClient.dio.post(
      '/api/auth/login',
      data: {'email': email, 'password': password},
    );
    final data = response.data as Map<String, dynamic>;
    await _storeAuthData(data);
  }

  Future<void> register(String name, String email, String password) async {
    final response = await _apiClient.dio.post(
      '/api/auth/register',
      data: {'name': name, 'email': email, 'password': password},
    );
    final data = response.data as Map<String, dynamic>;
    await _storeAuthData(data);
  }

  Future<void> logout() async {
    try {
      await _apiClient.post('/api/auth/logout');
    } catch (_) {}
    await _apiClient.clearTokens();
    await _storage.delete(key: _userIdKey);
    await _storage.delete(key: _tenantIdKey);
    await _storage.delete(key: _nameKey);
    await _storage.delete(key: _emailKey);
  }

  Future<void> refreshToken() async {
    final success = await _apiClient.refreshTokens();
    if (!success) {
      throw Exception('Token refresh failed');
    }
  }

  Future<bool> isLoggedIn() async {
    return _apiClient.hasTokens();
  }

  Future<String?> getAccessToken() => _apiClient.getAccessToken();

  Future<String?> getCurrentUserId() => _storage.read(key: _userIdKey);

  Future<String?> getCurrentTenantId() => _storage.read(key: _tenantIdKey);

  Future<String?> getCurrentUserName() => _storage.read(key: _nameKey);

  Future<String?> getCurrentUserEmail() => _storage.read(key: _emailKey);

  Future<void> forgotPassword(String email) async {
    await _apiClient.dio.post(
      '/api/auth/forgot-password',
      data: {'email': email},
    );
  }

  Future<void> verifyEmail(String token) async {
    await _apiClient.dio.post(
      '/api/auth/verify-email',
      data: {'token': token},
    );
  }

  Future<void> resendVerification(String email) async {
    await _apiClient.dio.post(
      '/api/auth/resend-verification',
      data: {'email': email},
    );
  }

  Future<void> _storeAuthData(Map<String, dynamic> data) async {
    final accessToken = data['accessToken'] as String?;
    final refreshToken = data['refreshToken'] as String?;
    if (accessToken != null && refreshToken != null) {
      await _apiClient.storeTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );
    }

    final user = data['user'] as Map<String, dynamic>?;
    if (user != null) {
      await _storage.write(key: _userIdKey, value: user['id'] as String?);
      await _storage.write(key: _nameKey, value: user['name'] as String?);
      await _storage.write(key: _emailKey, value: user['email'] as String?);
    }

    final tenantId = data['tenantId'] as String?;
    if (tenantId != null) {
      await _storage.write(key: _tenantIdKey, value: tenantId);
    }
  }
}

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.read(apiClientProvider));
});
