class EmailTemplate {
  final String id;
  final String tenantId;
  final String name;
  final String subject;
  final String htmlContent;
  final List<String>? variables;
  final String? category;
  final DateTime? lastUsedAt;
  final int useCount;

  const EmailTemplate({
    required this.id,
    required this.tenantId,
    required this.name,
    required this.subject,
    required this.htmlContent,
    this.variables,
    this.category,
    this.lastUsedAt,
    this.useCount = 0,
  });

  factory EmailTemplate.fromJson(Map<String, dynamic> json) {
    return EmailTemplate(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      name: json['name'] as String,
      subject: json['subject'] as String,
      htmlContent: json['htmlContent'] as String,
      variables: json['variables'] != null
          ? (json['variables'] as List<dynamic>).cast<String>()
          : null,
      category: json['category'] as String?,
      lastUsedAt: json['lastUsedAt'] != null
          ? DateTime.parse(json['lastUsedAt'] as String)
          : null,
      useCount: json['useCount'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'name': name,
      'subject': subject,
      'htmlContent': htmlContent,
      'variables': variables,
      'category': category,
      'lastUsedAt': lastUsedAt?.toIso8601String(),
      'useCount': useCount,
    };
  }

  static List<EmailTemplate> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => EmailTemplate.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
