class PublicWedding {
  final String tenantName;
  final String slug;
  final String? theme;
  final String? partner1Name;
  final String? partner2Name;
  final DateTime? weddingDate;
  final String? venue;
  final String? story;
  final List<PublicTimelineEvent>? timeline;
  final List<PublicGift>? gifts;
  final List<PublicPhoto>? photos;
  final List<PublicMenuItem>? menu;
  final String? heroImage;
  final String? heroTitle;
  final String? heroSubtitle;

  const PublicWedding({
    required this.tenantName,
    required this.slug,
    this.theme,
    this.partner1Name,
    this.partner2Name,
    this.weddingDate,
    this.venue,
    this.story,
    this.timeline,
    this.gifts,
    this.photos,
    this.menu,
    this.heroImage,
    this.heroTitle,
    this.heroSubtitle,
  });

  factory PublicWedding.fromJson(Map<String, dynamic> json) {
    return PublicWedding(
      tenantName: json['tenantName'] as String,
      slug: json['slug'] as String,
      theme: json['theme'] as String?,
      partner1Name: json['partner1Name'] as String?,
      partner2Name: json['partner2Name'] as String?,
      weddingDate: json['weddingDate'] != null
          ? DateTime.parse(json['weddingDate'] as String)
          : null,
      venue: json['venue'] as String?,
      story: json['story'] as String?,
      timeline: json['timeline'] != null
          ? PublicTimelineEvent.fromJsonList(json['timeline'] as List<dynamic>)
          : null,
      gifts: json['gifts'] != null
          ? PublicGift.fromJsonList(json['gifts'] as List<dynamic>)
          : null,
      photos: json['photos'] != null
          ? PublicPhoto.fromJsonList(json['photos'] as List<dynamic>)
          : null,
      menu: json['menu'] != null
          ? PublicMenuItem.fromJsonList(json['menu'] as List<dynamic>)
          : null,
      heroImage: json['heroImage'] as String?,
      heroTitle: json['heroTitle'] as String?,
      heroSubtitle: json['heroSubtitle'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tenantName': tenantName,
      'slug': slug,
      'theme': theme,
      'partner1Name': partner1Name,
      'partner2Name': partner2Name,
      'weddingDate': weddingDate?.toIso8601String(),
      'venue': venue,
      'story': story,
      'timeline': timeline?.map((e) => e.toJson()).toList(),
      'gifts': gifts?.map((e) => e.toJson()).toList(),
      'photos': photos?.map((e) => e.toJson()).toList(),
      'menu': menu?.map((e) => e.toJson()).toList(),
      'heroImage': heroImage,
      'heroTitle': heroTitle,
      'heroSubtitle': heroSubtitle,
    };
  }

  static List<PublicWedding> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => PublicWedding.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}

class PublicTimelineEvent {
  final String title;
  final String? description;
  final DateTime? startTime;
  final DateTime? endTime;
  final String? location;

  const PublicTimelineEvent({
    required this.title,
    this.description,
    this.startTime,
    this.endTime,
    this.location,
  });

  factory PublicTimelineEvent.fromJson(Map<String, dynamic> json) {
    return PublicTimelineEvent(
      title: json['title'] as String,
      description: json['description'] as String?,
      startTime: json['startTime'] != null
          ? DateTime.parse(json['startTime'] as String)
          : null,
      endTime: json['endTime'] != null
          ? DateTime.parse(json['endTime'] as String)
          : null,
      location: json['location'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'startTime': startTime?.toIso8601String(),
      'endTime': endTime?.toIso8601String(),
      'location': location,
    };
  }

  static List<PublicTimelineEvent> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) =>
            PublicTimelineEvent.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}

class PublicGift {
  final String id;
  final String name;
  final String? description;
  final String? imageUrl;
  final double? targetAmount;
  final double? currentAmount;
  final String? link;

  const PublicGift({
    required this.id,
    required this.name,
    this.description,
    this.imageUrl,
    this.targetAmount,
    this.currentAmount,
    this.link,
  });

  factory PublicGift.fromJson(Map<String, dynamic> json) {
    return PublicGift(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
      targetAmount: json['targetAmount'] != null
          ? (json['targetAmount'] as num).toDouble()
          : null,
      currentAmount: json['currentAmount'] != null
          ? (json['currentAmount'] as num).toDouble()
          : null,
      link: json['link'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'targetAmount': targetAmount,
      'currentAmount': currentAmount,
      'link': link,
    };
  }

  static List<PublicGift> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => PublicGift.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}

class PublicPhoto {
  final String url;
  final String? thumbnailUrl;
  final String? caption;

  const PublicPhoto({
    required this.url,
    this.thumbnailUrl,
    this.caption,
  });

  factory PublicPhoto.fromJson(Map<String, dynamic> json) {
    return PublicPhoto(
      url: json['url'] as String,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      caption: json['caption'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'url': url,
      'thumbnailUrl': thumbnailUrl,
      'caption': caption,
    };
  }

  static List<PublicPhoto> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => PublicPhoto.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}

class PublicMenuItem {
  final String course;
  final String name;
  final String? description;
  final List<String>? dietaryTags;

  const PublicMenuItem({
    required this.course,
    required this.name,
    this.description,
    this.dietaryTags,
  });

  factory PublicMenuItem.fromJson(Map<String, dynamic> json) {
    return PublicMenuItem(
      course: json['course'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      dietaryTags: json['dietaryTags'] != null
          ? (json['dietaryTags'] as List<dynamic>).cast<String>()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'course': course,
      'name': name,
      'description': description,
      'dietaryTags': dietaryTags,
    };
  }

  static List<PublicMenuItem> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => PublicMenuItem.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
