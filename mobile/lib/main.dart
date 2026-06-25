import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'routing/app_router.dart';
import 'services/auth_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('id');
  // Load token ke cache ApiService sebelum app jalan
  await initAuthToken();
  runApp(const ProviderScope(child: GymBuddyApp()));
}

class GymBuddyApp extends ConsumerStatefulWidget {
  const GymBuddyApp({super.key});

  @override
  ConsumerState<GymBuddyApp> createState() => _GymBuddyAppState();
}

class _GymBuddyAppState extends ConsumerState<GymBuddyApp> {
  late GoRouter _router;

  @override
  void initState() {
    super.initState();
    _router = createRouter(ref);
    ref.listenManual(authProvider, (prev, next) {
      _router.refresh();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    if (!auth.isInitialized) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFFE53935),
            brightness: Brightness.light,
          ),
          useMaterial3: true,
        ),
        home: const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    return MaterialApp.router(
      title: 'GymBuddy',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFE53935),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'Roboto',
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 0,
        ),
      ),
      routerConfig: _router,
    );
  }
}
