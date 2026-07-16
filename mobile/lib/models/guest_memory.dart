class GuestMemory {
  final String id;
  final String tenantId;
  final String guestName;
  final String? guestEmail;
  final String type;
  final String? content;
  final String? fileUrl;
  final String? thumbnailUrl;
  final DateTime? createdAt;

  const GuestMemory({
    required this.id,
    required this.tenantId,
    required this.guestName,
    this.guestEmail,
    required this.type,
    this.content,
    this.fileUrl,
    this.thumbnailUrl,
    this.createdAt,
  });

  factory GuestMemory.fromJson(Map<String, dynamic> json) {
    return GuestMemory(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      guestName: json['guestName'] as String,
      guestEmail: json['guestEmail'] as String?,
      type: json['type'] as String,
      content: json['content'] as String?,
      fileUrl: json['fileUrl'] as String?,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'guestName': guestName,
      'guestEmail': guestEmail,
      'type': type,
      'content': content,
      'fileUrl': fileUrl,
      'thumbnailUrl': thumbnailUrl,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  static List<GuestMemory> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => GuestMemory.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
