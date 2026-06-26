import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';
import '../../services/auth_provider.dart';
import '../../services/ui_helpers.dart';

class TrainerDashboardScreen extends ConsumerStatefulWidget {
  const TrainerDashboardScreen({super.key});

  @override
  ConsumerState<TrainerDashboardScreen> createState() => _TrainerDashboardScreenState();
}

class _TrainerDashboardScreenState extends ConsumerState<TrainerDashboardScreen> {
  final _api = ApiService();
  List<dynamic> _sessions = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final res = await _api.getSessions(limit: 50);
      final user = ref.read(authProvider).user;
      final userId = user?['id'];
      final allSessions = (res['data'] as List?) ?? [];
      // Filter by current trainer
      setState(() {
        _sessions = allSessions.where((s) =>
          s['trainer_id']?.toString() == userId?.toString()
        ).toList();
        _error = null;
      });
    } catch (e) {
      setState(() => _error = 'Gagal memuat data');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final activeSessions = _sessions.where((s) =>
      s['status'] == 'scheduled' || s['status'] == 'ongoing'
    ).length;
    final totalBookings = _sessions.fold<int>(0, (sum, s) {
      final b = s['total_bookings'] ?? s['totalBookings'] ?? 0;
      return sum + (int.tryParse(b.toString()) ?? 0);
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard Trainer'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => showProfileMenu(context, ref),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Welcome
                  Text('Selamat Datang, Coach!', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('Kelola sesi dan pantau klien Anda', style: TextStyle(color: Colors.grey[600])),
                  const SizedBox(height: 24),

                  // Stats
                  Row(
                    children: [
                      _buildStatCard('Sesi Aktif', '$activeSessions', Icons.calendar_month, Colors.red, theme, onTap: () => context.push('/trainer/sessions')),
                      const SizedBox(width: 12),
                      _buildStatCard('Total Booker', '$totalBookings', Icons.people, Colors.blue, theme, onTap: () => context.push('/trainer/clients')),
                      const SizedBox(width: 12),
                      _buildStatCard('Total Sesi', '${_sessions.length}', Icons.fitness_center, Colors.green, theme, onTap: () => context.push('/trainer/sessions')),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Quick actions
                  Text('Aksi Cepat', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.grey[800])),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _buildActionCard('Kelola Sesi', Icons.edit_calendar, Colors.red, () => context.push('/trainer/sessions'))),
                      const SizedBox(width: 12),
                      Expanded(child: _buildActionCard('Daftar Booker', Icons.people, Colors.blue, () => context.push('/trainer/clients'))),
                    ],
                  ),

                  // Error
                  if (_error != null) ...[
                    const SizedBox(height: 16),
                    Center(child: Text(_error!, style: TextStyle(color: Colors.red[700]))),
                  ],

                  // Recent sessions
                  if (_sessions.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    Text('Jadwal Mendatang', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.grey[800])),
                    const SizedBox(height: 12),
                    ..._sessions.where((s) => s['status'] == 'scheduled').take(5).map((s) => _buildSessionCard(s, theme)),
                  ],

                  if (_sessions.isEmpty && !_loading)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 32),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(Icons.event_busy, size: 48, color: Colors.grey[300]),
                            const SizedBox(height: 16),
                            Text('Belum ada sesi', style: TextStyle(color: Colors.grey[500])),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, MaterialColor color, ThemeData theme, {VoidCallback? onTap}) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: color[50],
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color[200]!),
          ),
          child: Column(
            children: [
              Icon(icon, color: color[700], size: 24),
              const SizedBox(height: 6),
              Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color[800])),
              Text(label, style: TextStyle(fontSize: 10, color: color[600], fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionCard(String label, IconData icon, MaterialColor color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: color[50],
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color[200]!),
        ),
        child: Column(
          children: [
            Icon(icon, color: color[700], size: 32),
            const SizedBox(height: 8),
            Text(label, style: TextStyle(fontWeight: FontWeight.bold, color: color[800], fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _buildSessionCard(dynamic session, ThemeData theme) {
    final title = session['title'] ?? 'Sesi';
    final date = session['start_time'] != null
        ? DateFormat('dd MMM yyyy, HH:mm').format(DateTime.parse(session['start_time']).toLocal())
        : '--';
    final price = session['price'] ?? 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Container(
          width: 44, height: 44,
          decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(12)),
          child: Icon(Icons.fitness_center, color: Colors.red[700], size: 22),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(date, style: const TextStyle(fontSize: 12)),
        trailing: Text(
          'Rp${NumberFormat('#,###', 'id_ID').format(num.tryParse(price.toString()) ?? 0)}',
          style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.bold, fontSize: 13),
        ),
      ),
    );
  }
}
