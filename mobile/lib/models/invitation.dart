class CollaboratorInvitation {
  final String id;
  final String tenantId;
  final String email;
  final String role;
  final Map<String, dynamic>? permissions;
  final String? token;
  final DateTime? expiresAt;
  final DateTime? acceptedAt;
  final bool revoked;

  const CollaboratorInvitation({
    required this.id,
    required this.tenantId,
    required this.email,
    required this.role,
    this.permissions,
    this.token,
    this.expiresAt,
    this.acceptedAt,
    this.revoked = false,
  });

  factory CollaboratorInvitation.fromJson(Map<String, dynamic> json) {
    return CollaboratorInvitation(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      permissions: json['permissions'] as Map<String, dynamic>?,
      token: json['token'] as String?,
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'] as String)
          : null,
      acceptedAt: json['acceptedAt'] != null
          ? DateTime.parse(json['acceptedAt'] as String)
          : null,
      revoked: json['revoked'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'email': email,
      'role': role,
      'permissions': permissions,
      'token': token,
      'expiresAt': expiresAt?.toIso8601String(),
      'acceptedAt': acceptedAt?.toIso8601String(),
      'revoked': revoked,
    };
  }

  static List<CollaboratorInvitation> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) =>
            CollaboratorInvitation.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
