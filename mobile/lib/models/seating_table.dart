class SeatingTable {
  final String id;
  final String tenantId;
  final String name;
  final int capacity;
  final double x;
  final double y;
  final double rotation;
  final String shape;

  const SeatingTable({
    required this.id,
    required this.tenantId,
    required this.name,
    required this.capacity,
    this.x = 0,
    this.y = 0,
    this.rotation = 0,
    this.shape = 'round',
  });

  factory SeatingTable.fromJson(Map<String, dynamic> json) {
    return SeatingTable(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      name: json['name'] as String,
      capacity: json['capacity'] as int,
      x: (json['x'] as num?)?.toDouble() ?? 0,
      y: (json['y'] as num?)?.toDouble() ?? 0,
      rotation: (json['rotation'] as num?)?.toDouble() ?? 0,
      shape: json['shape'] as String? ?? 'round',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'name': name,
      'capacity': capacity,
      'x': x,
      'y': y,
      'rotation': rotation,
      'shape': shape,
    };
  }

  static List<SeatingTable> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => SeatingTable.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
