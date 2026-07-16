class Photo {
  final String id;
  final String tenantId;
  final String url;
  final String? thumbnailUrl;
  final String? caption;
  final String? uploadedBy;
  final DateTime? uploadedAt;
  final List<String>? memories;

  const Photo({
    required this.id,
    required this.tenantId,
    required this.url,
    this.thumbnailUrl,
    this.caption,
    this.uploadedBy,
    this.uploadedAt,
    this.memories,
  });

  factory Photo.fromJson(Map<String, dynamic> json) {
    return Photo(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      url: json['url'] as String,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      caption: json['caption'] as String?,
      uploadedBy: json['uploadedBy'] as String?,
      uploadedAt: json['uploadedAt'] != null
          ? DateTime.parse(json['uploadedAt'] as String)
          : null,
      memories: json['memories'] != null
          ? (json['memories'] as List<dynamic>).cast<String>()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'url': url,
      'thumbnailUrl': thumbnailUrl,
      'caption': caption,
      'uploadedBy': uploadedBy,
      'uploadedAt': uploadedAt?.toIso8601String(),
      'memories': memories,
    };
  }

  static List<Photo> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => Photo.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
