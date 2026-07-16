class Tenant {
  final String id;
  final String name;
  final String slug;
  final String? plan;
  final DateTime? weddingDate;
  final String? venue;
  final String? partner1Name;
  final String? partner2Name;

  const Tenant({
    required this.id,
    required this.name,
    required this.slug,
    this.plan,
    this.weddingDate,
    this.venue,
    this.partner1Name,
    this.partner2Name,
  });

  factory Tenant.fromJson(Map<String, dynamic> json) {
    return Tenant(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      plan: json['plan'] as String?,
      weddingDate: json['weddingDate'] != null
          ? DateTime.parse(json['weddingDate'] as String)
          : null,
      venue: json['venue'] as String?,
      partner1Name: json['partner1Name'] as String?,
      partner2Name: json['partner2Name'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'plan': plan,
      'weddingDate': weddingDate?.toIso8601String(),
      'venue': venue,
      'partner1Name': partner1Name,
      'partner2Name': partner2Name,
    };
  }

  static List<Tenant> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => Tenant.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
