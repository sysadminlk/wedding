class UserTenant {
  final String id;
  final String userId;
  final String tenantId;
  final String role;
  final Map<String, dynamic>? permissions;

  const UserTenant({
    required this.id,
    required this.userId,
    required this.tenantId,
    required this.role,
    this.permissions,
  });

  factory UserTenant.fromJson(Map<String, dynamic> json) {
    return UserTenant(
      id: json['id'] as String,
      userId: json['userId'] as String,
      tenantId: json['tenantId'] as String,
      role: json['role'] as String,
      permissions: json['permissions'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'tenantId': tenantId,
      'role': role,
      'permissions': permissions,
    };
  }

  static List<UserTenant> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => UserTenant.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
