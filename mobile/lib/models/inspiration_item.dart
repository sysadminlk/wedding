class InspirationItem {
  final String id;
  final String tenantId;
  final String imageUrl;
  final String? title;
  final String? description;
  final String? category;
  final List<String>? tags;

  const InspirationItem({
    required this.id,
    required this.tenantId,
    required this.imageUrl,
    this.title,
    this.description,
    this.category,
    this.tags,
  });

  factory InspirationItem.fromJson(Map<String, dynamic> json) {
    return InspirationItem(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      imageUrl: json['imageUrl'] as String,
      title: json['title'] as String?,
      description: json['description'] as String?,
      category: json['category'] as String?,
      tags: json['tags'] != null
          ? (json['tags'] as List<dynamic>).cast<String>()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'imageUrl': imageUrl,
      'title': title,
      'description': description,
      'category': category,
      'tags': tags,
    };
  }

  static List<InspirationItem> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => InspirationItem.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
