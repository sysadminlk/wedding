class Subscription {
  final String id;
  final String tenantId;
  final String plan;
  final String? previousPlan;
  final DateTime? subscribedAt;
  final DateTime? expiresAt;
  final bool active;

  const Subscription({
    required this.id,
    required this.tenantId,
    required this.plan,
    this.previousPlan,
    this.subscribedAt,
    this.expiresAt,
    this.active = true,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      plan: json['plan'] as String,
      previousPlan: json['previousPlan'] as String?,
      subscribedAt: json['subscribedAt'] != null
          ? DateTime.parse(json['subscribedAt'] as String)
          : null,
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'] as String)
          : null,
      active: json['active'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'plan': plan,
      'previousPlan': previousPlan,
      'subscribedAt': subscribedAt?.toIso8601String(),
      'expiresAt': expiresAt?.toIso8601String(),
      'active': active,
    };
  }

  static List<Subscription> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => Subscription.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
