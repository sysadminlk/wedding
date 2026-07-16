# Mobile — Flutter (Android + iOS)

## Tech Stack

| Component        | Choice                    | Notes                           |
|------------------|---------------------------|---------------------------------|
| Framework        | Flutter 3.x               | Stable channel                  |
| Language         | Dart 3.x                  | Sound null safety               |
| State            | Riverpod                  | Compile-safe, testable          |
| Navigation       | GoRouter                  | Declarative, deep linking       |
| HTTP             | Dio + Retrofit             | Type-safe API client            |
| Forms            | Flutter Form + Formz       | Validation shared concepts      |
| Storage          | Flutter Secure Storage     | JWT tokens                      |
| Platform         | Android + iOS             | Single codebase                 |
| Testing          | flutter_test + mocktail    | Unit + widget + integration     |

## Project Layout

```
mobile/
├── lib/
│   ├── main.dart
│   ├── app.dart                    # MaterialApp, theme, router
│   ├── config/
│   │   ├── api.dart                # Dio setup, interceptors, base URL
│   │   ├── env.dart                # Environment config
│   │   └── theme.dart              # Atelier theme (Material 3)
│   ├── features/
│   │   ├── auth/                   # Login, register, email verification
│   │   ├── dashboard/              # Overview cards
│   │   ├── checklist/              # Task list
│   │   ├── budget/                 # Budget tracker
│   │   ├── guests/                 # Guest list, RSVP
│   │   ├── seating/                # 2D seating chart (NOT 3D)
│   │   ├── vendors/                # Vendor list, ratings
│   │   ├── crew/                   # Wedding crew
│   │   ├── timeline/               # Day-of schedule
│   │   ├── inspiration/            # Mood board
│   │   ├── menu/                   # Menu pages
│   │   ├── photos/                 # Guest gallery
│   │   ├── memories/               # Video/voice guestbook
│   │   ├── website/                # Public site editor
│   │   ├── rsvp/                   # RSVP page editor
│   │   ├── email_templates/        # Email template editor
│   │   ├── collaborators/          # Manage collaborators
│   │   ├── billing/                # Plan & payment
│   │   └── settings/               # Wedding settings
│   ├── models/                     # Freezed data classes
│   ├── providers/                  # Riverpod providers
│   ├── services/                   # API service classes
│   ├── widgets/                    # Shared widgets
│   └── utils/                      # Helpers, extensions
├── android/
├── ios/
├── test/
├── pubspec.yaml
└── README.md
```

## Feature Module Pattern

Each feature follows the same structure:

```
features/guests/
├── data/
│   ├── guest_repository.dart       # API calls
│   └── guest_model.dart            # Freezed data class
├── providers/
│   ├── guest_list_provider.dart    # StateNotifier / AsyncNotifier
│   └── guest_form_provider.dart
├── screens/
│   ├── guest_list_screen.dart      # List with search, filter
│   └── guest_detail_screen.dart    # Edit form
└── widgets/
    ├── guest_card.dart
    └── guest_import_button.dart
```

## Key Screens

| Screen              | Auth | Description                          |
|---------------------|------|--------------------------------------|
| Login / Register    | No   | Auth flows, email verification       |
| Dashboard           | Yes  | Countdown, budget, guest counts      |
| Checklist           | Yes  | Phased task list                     |
| Budget              | Yes  | Categories, donut chart              |
| Guest List          | Yes  | Searchable list, RSVP status         |
| Guest Detail        | Yes  | Edit guest, dietary, table           |
| Seating Chart       | Yes  | 2D table layout (drag-and-drop)      |
| Vendors             | Yes  | List, comparison                     |
| Crew                | Yes  | Team roster                          |
| Timeline            | Yes  | Day-of schedule                      |
| Inspiration         | Yes  | Mood board grid                      |
| Menu                | Yes  | Page carousel                        |
| Photos              | Yes  | Gallery grid                         |
| Memories            | Yes  | Video/voice list                     |
| Website Editor      | Yes  | Content editor                       |
| RSVP Editor         | Yes  | Theme/font customizer                |
| Email Templates     | Yes  | Template editor with preview         |
| Collaborators       | Yes  | Invite, permissions                  |
| Billing             | Yes  | Plan display                         |
| Settings            | Yes  | Wedding config                       |

## Important: Mobile vs Web Differences

1. **3D Floor Plan is WEB-ONLY** — Mobile uses 2D seating view with a flat layout
2. **Guest page** — Mobile app does NOT serve the guest page. The guest page is web-only at `/share/{slug]`. The app is for the couple/planner to manage the wedding.
3. **QR codes** — Mobile can generate/display QR codes for sharing
4. **MediaRecorder** — Guest video/voice recording is web-only (browser API). Mobile app can show/play memories but guests record via the web guest page.
5. **PDF/Excel export** — Backend generates files; mobile triggers download or share via platform share sheet

## API Integration

```dart
// lib/config/api.dart
class ApiClient {
  final Dio _dio;

  ApiClient({required String baseUrl}) : _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    headers: {'Content-Type': 'application/json'},
  )) {
    _dio.interceptors.add(AuthInterceptor());
    _dio.interceptors.add(LogInterceptor());
  }
}

// lib/features/guests/data/guest_repository.dart
@riverpod
GuestRepository guestRepository(GuestRepositoryRef ref) {
  return GuestRepository(ref.watch(apiClientProvider));
}

class GuestRepository {
  final ApiClient _api;

  Future<List<Guest>> getGuests(String tenantId, {int page = 0}) async {
    final res = await _api.get('/api/v1/$tenantId/guests?page=$page');
    return (res.data['data'] as List).map((j) => Guest.fromJson(j)).toList();
  }
  // ...
}
```

## Seating Chart (2D)

Mobile seating is a simplified 2D canvas:
- Circular/rectangular table representations
- Tap table to see guests assigned
- Drag guests between tables
- Capacity indicator per table
- No 3D room editor (that's web-only)

## Theme (Atelier on Mobile)

```dart
// lib/config/theme.dart
class AtelierTheme {
  static ThemeData light() => ThemeData(
    useMaterial3: true,
    fontFamily: 'Playfair Display', // for headings
    colorScheme: ColorScheme.light(
      primary: Color(0xFFC4A882),      // brushed gold
      onPrimary: Color(0xFF2C1810),    // dark espresso
      surface: Color(0xFFFDF8F3),      // warm ivory
      onSurface: Color(0xFF1A1A1A),
    ),
    // ...
  );

  static ThemeData dark() => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.dark(
      primary: Color(0xFFC4A882),
      surface: Color(0xFF2C1810),
      onSurface: Color(0xFFF5F0EB),
    ),
    // ...
  );
}
```

## Implementation Order

1. App shell (theme, router, auth interceptor)
2. Auth screens (login, register, verify)
3. Dashboard overview
4. Guest list (CRUD)
5. Seating chart (2D)
6. Checklist
7. Budget
8. Vendors
9. Crew
10. Timeline
11. Inspiration
12. Menu
13. Photos (view only — uploads via web guest page)
14. Memories (view only)
15. Website editor
16. RSVP editor
17. Email templates
18. Collaborators
19. Billing
20. Settings
21. QR code generation / sharing

## Android & iOS Setup

### Android (`android/app/build.gradle`)
- Min SDK: 21 (Android 5.0)
- Target SDK: 34
- Permissions: INTERNET, CAMERA (QR scanning), WRITE_EXTERNAL_STORAGE

### iOS (`ios/Runner/Info.plist`)
- Minimum iOS version: 12.0
- Permissions: NSCameraUsageDescription, NSMicrophoneUsageDescription

### Build Commands
```bash
flutter run                           # Dev mode (connected device)
flutter build apk                     # Android APK
flutter build ios                     # iOS (requires macOS + Xcode)
flutter test                          # Run all tests
flutter test --dart-define=env=dev    # Test with dev config
```
