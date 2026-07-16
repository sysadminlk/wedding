class TimelineEvent {
  final String id;
  final String tenantId;
  final String title;
  final String? description;
  final DateTime? startTime;
  final DateTime? endTime;
  final String? location;
  final String? assignedCrewId;
  final String status;
  final String? category;

  const TimelineEvent({
    required this.id,
    required this.tenantId,
    required this.title,
    this.description,
    this.startTime,
    this.endTime,
    this.location,
    this.assignedCrewId,
    this.status = 'pending',
    this.category,
  });

  factory TimelineEvent.fromJson(Map<String, dynamic> json) {
    return TimelineEvent(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      startTime: json['startTime'] != null
          ? DateTime.parse(json['startTime'] as String)
          : null,
      endTime: json['endTime'] != null
          ? DateTime.parse(json['endTime'] as String)
          : null,
      location: json['location'] as String?,
      assignedCrewId: json['assignedCrewId'] as String?,
      status: json['status'] as String? ?? 'pending',
      category: json['category'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'title': title,
      'description': description,
      'startTime': startTime?.toIso8601String(),
      'endTime': endTime?.toIso8601String(),
      'location': location,
      'assignedCrewId': assignedCrewId,
      'status': status,
      'category': category,
    };
  }

  static List<TimelineEvent> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => TimelineEvent.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
