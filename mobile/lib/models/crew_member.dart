class CrewMember {
  final String id;
  final String tenantId;
  final String name;
  final String role;
  final String? phone;
  final String? email;
  final bool isExternal;
  final String? notes;
  final String dutyStatus;

  const CrewMember({
    required this.id,
    required this.tenantId,
    required this.name,
    required this.role,
    this.phone,
    this.email,
    this.isExternal = false,
    this.notes,
    this.dutyStatus = 'pending',
  });

  factory CrewMember.fromJson(Map<String, dynamic> json) {
    return CrewMember(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      name: json['name'] as String,
      role: json['role'] as String,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      isExternal: json['isExternal'] as bool? ?? false,
      notes: json['notes'] as String?,
      dutyStatus: json['dutyStatus'] as String? ?? 'pending',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'name': name,
      'role': role,
      'phone': phone,
      'email': email,
      'isExternal': isExternal,
      'notes': notes,
      'dutyStatus': dutyStatus,
    };
  }

  static List<CrewMember> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => CrewMember.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
