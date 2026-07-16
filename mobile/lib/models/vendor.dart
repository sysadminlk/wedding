class Vendor {
  final String id;
  final String tenantId;
  final String name;
  final String category;
  final String? contactName;
  final String? email;
  final String? phone;
  final String? website;
  final double? cost;
  final int? rating;
  final String? notes;
  final String status;

  const Vendor({
    required this.id,
    required this.tenantId,
    required this.name,
    required this.category,
    this.contactName,
    this.email,
    this.phone,
    this.website,
    this.cost,
    this.rating,
    this.notes,
    this.status = 'pending',
  });

  factory Vendor.fromJson(Map<String, dynamic> json) {
    return Vendor(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      name: json['name'] as String,
      category: json['category'] as String,
      contactName: json['contactName'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      website: json['website'] as String?,
      cost: json['cost'] != null ? (json['cost'] as num).toDouble() : null,
      rating: json['rating'] as int?,
      notes: json['notes'] as String?,
      status: json['status'] as String? ?? 'pending',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'name': name,
      'category': category,
      'contactName': contactName,
      'email': email,
      'phone': phone,
      'website': website,
      'cost': cost,
      'rating': rating,
      'notes': notes,
      'status': status,
    };
  }

  static List<Vendor> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => Vendor.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
