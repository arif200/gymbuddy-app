import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';
import '../../services/ui_helpers.dart';

class TrainerClientsScreen extends ConsumerStatefulWidget {
  const TrainerClientsScreen({super.key});

  @override
  ConsumerState<TrainerClientsScreen> createState() => _TrainerClientsScreenState();
}

class _TrainerClientsScreenState extends ConsumerState<TrainerClientsScreen> {
  final _api = ApiService();
  final _searchController = TextEditingController();
  List<dynamic> _clients = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadClients();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadClients() async {
    setState(() => _loading = true);
    try {
      final res = await _api.getTrainerBookingHistory();
      final data = (res['data'] as List?) ?? [];
      setState(() {
        _clients = data;
        _error = null;
      });
    } catch (e) {
      setState(() => _error = 'Gagal memuat data klien');
    } finally {
      setState(() => _loading = false);
    }
  }

  List<dynamic> get _filteredClients {
    if (_searchController.text.isEmpty) return _clients;
    final q = _searchController.text.toLowerCase();
    return _clients.where((c) {
      final name = (c['member_nama'] ?? '').toString().toLowerCase();
      final session = (c['session_title'] ?? '').toString().toLowerCase();
      return name.contains(q) || session.contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Daftar Booker'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => showProfileMenu(context, ref),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Cari member...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
                fillColor: Colors.grey[100],
                isDense: true,
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),

          // Content
          Expanded(child: _buildContent(theme)),
        ],
      ),
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
            ElevatedButton(onPressed: _loadClients, child: const Text('Coba Lagi')),
          ],
        ),
      );
    }

    final filtered = _filteredClients;

    if (filtered.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.people_outline, size: 48, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text('Belum ada booker', style: TextStyle(color: Colors.grey[500])),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadClients,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: filtered.length,
        itemBuilder: (context, index) {
          final client = filtered[index];
          return _buildClientCard(client, theme);
        },
      ),
    );
  }

  Widget _buildClientCard(dynamic client, ThemeData theme) {
    final name = client['member_nama'] ?? 'Member';
    final sessionTitle = client['session_title'] ?? 'Sesi';
    final startTime = client['session_start_time'] != null
        ? DateFormat('dd MMM yyyy, HH:mm').format(DateTime.parse(client['session_start_time']).toLocal())
        : '--';
    final status = client['status'] ?? 'pending';
    final email = client['member_email'] ?? '';

    MaterialColor statusColor;
    switch (status) {
      case 'confirmed':
        statusColor = Colors.green;
        break;
      case 'pending':
        statusColor = Colors.orange;
        break;
      default:
        statusColor = Colors.grey;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: Colors.red[100],
              child: Text(
                name.isNotEmpty ? name[0].toUpperCase() : 'M',
                style: TextStyle(color: Colors.red[700], fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Icon(Icons.fitness_center, size: 12, color: Colors.grey[500]),
                      const SizedBox(width: 4),
                      Text(sessionTitle, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                      const SizedBox(width: 8),
                      Icon(Icons.access_time, size: 12, color: Colors.grey[500]),
                      const SizedBox(width: 4),
                      Text(startTime, style: TextStyle(color: Colors.grey[500], fontSize: 11)),
                    ],
                  ),
                  if (email.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(email, style: TextStyle(color: Colors.grey[400], fontSize: 11)),
                  ],
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: statusColor[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                status,
                style: TextStyle(color: statusColor[700], fontSize: 9, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
