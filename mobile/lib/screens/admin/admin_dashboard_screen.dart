import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';
import '../../services/ui_helpers.dart';
import 'admin_drawer.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  final _api = ApiService();
  bool _loading = true;
  Map<String, dynamic> _stats = {};
  List<dynamic> _recentBookings = [];
  List<dynamic> _users = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _api.adminGetDashboard(),
        _api.adminGetBookings(),
        _api.adminGetUsers(limit: 10),
      ], eagerError: false);

      final dashboard = results[0];
      final bookings = results[1];
      final users = results[2];

      setState(() {
        _stats = (dashboard['data'] as Map<String, dynamic>?) ?? {};
        _recentBookings = ((bookings['data'] as List?) ?? []).take(5).toList();
        _users = ((users['data'] as List?) ?? []);
        _error = null;
      });
    } catch (e) {
      setState(() => _error = 'Gagal memuat data dashboard');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Panel'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => showProfileMenu(context, ref),
          ),
        ],
      ),
      drawer: const AdminDrawer(),
      body: _buildContent(theme),
    );
  }

  Widget _buildContent(ThemeData theme) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 48, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(_error!, style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadData,
              child: const Text('Coba Lagi'),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Header
          Text(
            'Dashboard',
            style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            'Ringkasan data platform GymBuddy',
            style: TextStyle(color: Colors.grey[600]),
          ),
          const SizedBox(height: 24),

          // Stats cards
          _buildStatsGrid(theme),
          const SizedBox(height: 24),

          // Recent bookings section
          if (_recentBookings.isNotEmpty) ...[
            Text(
              'Booking Terbaru',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 12),
            ..._recentBookings.map((b) => _buildBookingItem(b, theme)),
            const SizedBox(height: 24),
          ],

          // Users section
          if (_users.isNotEmpty) ...[
            Text(
              'User Terdaftar (${_users.length})',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 12),
            ..._users.map((u) => _buildUserItem(u)),
          ],
        ],
      ),
    );
  }

  Widget _buildStatsGrid(ThemeData theme) {
    final items = [
      _StatItem('Total User', _stats['totalUsers'] ?? 0, Icons.people, Colors.blue),
      _StatItem('Trainer', _stats['trainers'] ?? 0, Icons.fitness_center, Colors.green),
      _StatItem('Booking', _stats['totalBookings'] ?? _recentBookings.length, Icons.book_online, Colors.orange),
      _StatItem('Revenue', _formatCurrency(_stats['totalRevenue'] ?? 0), Icons.monetization_on, Colors.red),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 1.5,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: item.color[50],
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: item.color[200]!),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(item.icon, color: item.color[700], size: 28),
              const SizedBox(height: 8),
              Text(
                item.value.toString(),
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: item.color[800],
                ),
              ),
              Text(
                item.label,
                style: TextStyle(
                  fontSize: 11,
                  color: item.color[600],
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBookingItem(dynamic booking, ThemeData theme) {
    final title = booking['session_title'] ?? 'Sesi';
    final memberName = booking['member_nama'] ?? 'Member';
    final status = booking['status'] ?? '';
    final date = booking['session_start_time'] != null
        ? DateFormat('dd MMM').format(DateTime.parse(booking['session_start_time']).toLocal())
        : '--';

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: status == 'confirmed' ? Colors.green[100] : Colors.orange[100],
          child: Icon(
            status == 'confirmed' ? Icons.check_circle : Icons.pending,
            color: status == 'confirmed' ? Colors.green[700] : Colors.orange[700],
            size: 20,
          ),
        ),
        title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text('$memberName • $date'),
        trailing: _buildStatusBadge(status),
      ),
    );
  }

  Widget _buildUserItem(dynamic user) {
    final nama = user['nama'] ?? 'User';
    final email = user['email'] ?? '';
    final role = user['role'] ?? 'customer';
    final roleColor = role == 'admin' ? Colors.red
        : role == 'trainer' ? Colors.blue
        : Colors.green;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: roleColor[100],
          child: Text(
            (nama.toString().isNotEmpty ? nama.toString()[0] : 'U').toUpperCase(),
            style: TextStyle(color: roleColor[700], fontWeight: FontWeight.bold),
          ),
        ),
        title: Text(nama, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text(email, style: const TextStyle(fontSize: 12)),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: roleColor[50],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            role.toUpperCase(),
            style: TextStyle(
              color: roleColor[700],
              fontSize: 9,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bgColor;
    Color textColor;

    switch (status) {
      case 'confirmed':
        bgColor = Colors.green[50]!;
        textColor = Colors.green[700]!;
        break;
      case 'cancelled':
        bgColor = Colors.red[50]!;
        textColor = Colors.red[700]!;
        break;
      case 'completed':
        bgColor = Colors.blue[50]!;
        textColor = Colors.blue[700]!;
        break;
      default:
        bgColor = Colors.orange[50]!;
        textColor = Colors.orange[700]!;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: textColor, fontSize: 9, fontWeight: FontWeight.bold),
      ),
    );
  }

  String _formatCurrency(dynamic value) {
    final num = double.tryParse(value.toString()) ?? 0;
    if (num >= 1000000) return '${(num / 1000000).toStringAsFixed(1)}jt';
    if (num >= 1000) return '${(num / 1000).toStringAsFixed(0)}rb';
    return num.toStringAsFixed(0);
  }
}

class _StatItem {
  final String label;
  final dynamic value;
  final IconData icon;
  final MaterialColor color;

  _StatItem(this.label, this.value, this.icon, this.color);
}
