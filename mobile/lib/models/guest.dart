class Guest {
  final String id;
  final String tenantId;
  final String name;
  final String? email;
  final String? phone;
  final String rsvpStatus;
  final bool plusOne;
  final String? dietaryRestrictions;
  final String? tableId;
  final String? side;
  final String? notes;

  const Guest({
    required this.id,
    required this.tenantId,
    required this.name,
    this.email,
    this.phone,
    this.rsvpStatus = 'pending',
    this.plusOne = false,
    this.dietaryRestrictions,
    this.tableId,
    this.side,
    this.notes,
  });

  factory Guest.fromJson(Map<String, dynamic> json) {
    return Guest(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      name: json['name'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      rsvpStatus: json['rsvpStatus'] as String? ?? 'pending',
      plusOne: json['plusOne'] as bool? ?? false,
      dietaryRestrictions: json['dietaryRestrictions'] as String?,
      tableId: json['tableId'] as String?,
      side: json['side'] as String?,
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'name': name,
      'email': email,
      'phone': phone,
      'rsvpStatus': rsvpStatus,
      'plusOne': plusOne,
      'dietaryRestrictions': dietaryRestrictions,
      'tableId': tableId,
      'side': side,
      'notes': notes,
    };
  }

  static List<Guest> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => Guest.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
