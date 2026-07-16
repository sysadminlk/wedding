class MenuItemModel {
  final String id;
  final String tenantId;
  final String course;
  final String name;
  final String? description;
  final String? imageUrl;
  final List<String>? dietaryTags;
  final bool isGlutenFree;
  final bool isVegan;
  final int sortOrder;

  const MenuItemModel({
    required this.id,
    required this.tenantId,
    required this.course,
    required this.name,
    this.description,
    this.imageUrl,
    this.dietaryTags,
    this.isGlutenFree = false,
    this.isVegan = false,
    this.sortOrder = 0,
  });

  factory MenuItemModel.fromJson(Map<String, dynamic> json) {
    return MenuItemModel(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      course: json['course'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
      dietaryTags: json['dietaryTags'] != null
          ? (json['dietaryTags'] as List<dynamic>).cast<String>()
          : null,
      isGlutenFree: json['isGlutenFree'] as bool? ?? false,
      isVegan: json['isVegan'] as bool? ?? false,
      sortOrder: json['sortOrder'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'course': course,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'dietaryTags': dietaryTags,
      'isGlutenFree': isGlutenFree,
      'isVegan': isVegan,
      'sortOrder': sortOrder,
    };
  }

  static List<MenuItemModel> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => MenuItemModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
