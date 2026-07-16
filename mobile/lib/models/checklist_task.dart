class ChecklistTask {
  final String id;
  final String tenantId;
  final String title;
  final String? description;
  final String? category;
  final String? phase;
  final DateTime? dueDate;
  final bool completed;
  final String? assigneeId;

  const ChecklistTask({
    required this.id,
    required this.tenantId,
    required this.title,
    this.description,
    this.category,
    this.phase,
    this.dueDate,
    this.completed = false,
    this.assigneeId,
  });

  factory ChecklistTask.fromJson(Map<String, dynamic> json) {
    return ChecklistTask(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      category: json['category'] as String?,
      phase: json['phase'] as String?,
      dueDate: json['dueDate'] != null
          ? DateTime.parse(json['dueDate'] as String)
          : null,
      completed: json['completed'] as bool? ?? false,
      assigneeId: json['assigneeId'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'title': title,
      'description': description,
      'category': category,
      'phase': phase,
      'dueDate': dueDate?.toIso8601String(),
      'completed': completed,
      'assigneeId': assigneeId,
    };
  }

  static List<ChecklistTask> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => ChecklistTask.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
