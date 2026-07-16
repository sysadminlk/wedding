import 'package:flutter/material.dart';

class AtelierTheme {
  static const Color espresso = Color(0xFF2C1810);
  static const Color espressoLight = Color(0xFF3D2317);
  static const Color espressoLighter = Color(0xFF4A2E1F);
  static const Color ivory = Color(0xFFFDF8F3);
  static const Color ivoryDark = Color(0xFFF5F0EB);
  static const Color gold = Color(0xFFC4A882);
  static const Color goldLight = Color(0xFFD4B892);
  static const Color goldDark = Color(0xFFB3976F);

  static ThemeData light() => ThemeData(
    useMaterial3: true,
    fontFamily: 'Playfair Display',
    colorScheme: ColorScheme.light(
      primary: gold,
      onPrimary: espresso,
      secondary: goldLight,
      onSecondary: espresso,
      surface: ivory,
      onSurface: espresso,
    ),
    scaffoldBackgroundColor: ivory,
    appBarTheme: const AppBarTheme(
      backgroundColor: ivory,
      foregroundColor: espresso,
      elevation: 0,
    ),
    cardTheme: CardTheme(
      color: Colors.white,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: gold,
        foregroundColor: espresso,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: ivoryDark,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: goldDark),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: goldDark),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: gold, width: 2),
      ),
    ),
  );

  static ThemeData dark() => ThemeData(
    useMaterial3: true,
    fontFamily: 'Playfair Display',
    colorScheme: ColorScheme.dark(
      primary: gold,
      onPrimary: espresso,
      secondary: goldLight,
      onSecondary: espresso,
      surface: espresso,
      onSurface: ivory,
    ),
    scaffoldBackgroundColor: espresso,
    appBarTheme: const AppBarTheme(
      backgroundColor: espresso,
      foregroundColor: ivory,
      elevation: 0,
    ),
    cardTheme: CardTheme(
      color: espressoLight,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: gold,
        foregroundColor: espresso,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: espressoLighter,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: goldDark),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: goldDark),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: gold, width: 2),
      ),
    ),
  );
}
