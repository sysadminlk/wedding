import 'package:flutter/material.dart';
import 'config/theme.dart';
import 'config/router.dart';

class WeddingWireApp extends ConsumerWidget {
  const WeddingWireApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'weddingWire',
      debugShowCheckedModeBanner: false,
      theme: AtelierTheme.light(),
      darkTheme: AtelierTheme.dark(),
      themeMode: ThemeMode.light,
      routerConfig: router,
    );
  }
}
