class BudgetItem {
  final String id;
  final String tenantId;
  final String category;
  final String description;
  final double estimatedCost;
  final double? actualCost;
  final String? vendorId;
  final bool paid;
  final String? notes;

  const BudgetItem({
    required this.id,
    required this.tenantId,
    required this.category,
    required this.description,
    required this.estimatedCost,
    this.actualCost,
    this.vendorId,
    this.paid = false,
    this.notes,
  });

  factory BudgetItem.fromJson(Map<String, dynamic> json) {
    return BudgetItem(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      category: json['category'] as String,
      description: json['description'] as String,
      estimatedCost: (json['estimatedCost'] as num).toDouble(),
      actualCost: json['actualCost'] != null
          ? (json['actualCost'] as num).toDouble()
          : null,
      vendorId: json['vendorId'] as String?,
      paid: json['paid'] as bool? ?? false,
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'category': category,
      'description': description,
      'estimatedCost': estimatedCost,
      'actualCost': actualCost,
      'vendorId': vendorId,
      'paid': paid,
      'notes': notes,
    };
  }

  static List<BudgetItem> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => BudgetItem.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
