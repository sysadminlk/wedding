class WebsiteConfig {
  final String id;
  final String tenantId;
  final String? theme;
  final String? primaryColor;
  final String? fontFamily;
  final String? heroImage;
  final String? heroTitle;
  final String? heroSubtitle;
  final String? loveStory;
  final String? schedule;
  final List<String>? galleryImages;
  final String? customCss;

  const WebsiteConfig({
    required this.id,
    required this.tenantId,
    this.theme,
    this.primaryColor,
    this.fontFamily,
    this.heroImage,
    this.heroTitle,
    this.heroSubtitle,
    this.loveStory,
    this.schedule,
    this.galleryImages,
    this.customCss,
  });

  factory WebsiteConfig.fromJson(Map<String, dynamic> json) {
    return WebsiteConfig(
      id: json['id'] as String,
      tenantId: json['tenantId'] as String,
      theme: json['theme'] as String?,
      primaryColor: json['primaryColor'] as String?,
      fontFamily: json['fontFamily'] as String?,
      heroImage: json['heroImage'] as String?,
      heroTitle: json['heroTitle'] as String?,
      heroSubtitle: json['heroSubtitle'] as String?,
      loveStory: json['loveStory'] as String?,
      schedule: json['schedule'] as String?,
      galleryImages: json['galleryImages'] != null
          ? (json['galleryImages'] as List<dynamic>).cast<String>()
          : null,
      customCss: json['customCss'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tenantId': tenantId,
      'theme': theme,
      'primaryColor': primaryColor,
      'fontFamily': fontFamily,
      'heroImage': heroImage,
      'heroTitle': heroTitle,
      'heroSubtitle': heroSubtitle,
      'loveStory': loveStory,
      'schedule': schedule,
      'galleryImages': galleryImages,
      'customCss': customCss,
    };
  }

  static List<WebsiteConfig> fromJsonList(List<dynamic> jsonList) {
    return jsonList
        .map((json) => WebsiteConfig.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
