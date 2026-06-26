import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';
import 'admin_drawer.dart';

class AdminBookingsScreen extends ConsumerStatefulWidget {
  const AdminBookingsScreen({super.key});

  @override
  ConsumerState<AdminBookingsScreen> createState() => _AdminBookingsScreenState();
}

class _AdminBookingsScreenState extends ConsumerState<AdminBookingsScreen> {
  final _api = ApiService();
  List<dynamic> _bookings = [];
  bool _isLoading = true;
  String? _statusFilter;

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings({String? status}) async {
    setState(() => _isLoading = true);
    final res = await _api.adminGetBookings(status: status);
    if (res['success'] == true || res['data'] != null) {
      setState(() { _bookings = res['data'] as List<dynamic>? ?? []; _isLoading = false; });
    } else {
      setState(() => _isLoading = false);
    }
  }

  Color _statusColor(String? status) {
    switch (status) {
      case 'confirmed': return Colors.green;
      case 'pending': return Colors.orange;
      case 'cancelled': return Colors.red;
      case 'completed': return Colors.blue;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Kelola Booking'), backgroundColor: theme.colorScheme.primaryContainer),
      drawer: const AdminDrawer(),
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(8),
            child: Row(
              children: ['All', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) {
                final isActive = (s == 'All' && _statusFilter == null) || _statusFilter == s;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: FilterChip(
                    label: Text(s),
                    selected: isActive,
                    onSelected: (_) { setState(() => _statusFilter = s == 'All' ? null : s); _loadBookings(status: _statusFilter); },
                  ),
                );
              }).toList(),
            ),
          ),
          Expanded(
            child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _bookings.isEmpty
                ? const Center(child: Text('Tidak ada booking'))
                : RefreshIndicator(
                    onRefresh: () => _loadBookings(status: _statusFilter),
                    child: ListView.builder(
                      itemCount: _bookings.length,
                      itemBuilder: (ctx, i) {
                        final b = _bookings[i];
                        final date = b['createdAt'] != null
                          ? DateFormat('dd/MM/yy HH:mm').format(DateTime.parse(b['createdAt']).toLocal())
                          : '';
                        return Card(
                          margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          child: ListTile(
                            title: Text(b['session_title'] ?? 'Sesi'),
                            subtitle: Text('${b['member_nama'] ?? ''}  •  $date'),
                            trailing: Chip(
                              label: Text(b['status'] ?? '', style: const TextStyle(fontSize: 11, color: Colors.white)),
                              backgroundColor: _statusColor(b['status']),
                              side: BorderSide.none,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
