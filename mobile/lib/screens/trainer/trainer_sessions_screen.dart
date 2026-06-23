import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';
import '../../services/auth_provider.dart';
import '../../services/ui_helpers.dart';

class TrainerSessionsScreen extends ConsumerStatefulWidget {
  const TrainerSessionsScreen({super.key});

  @override
  ConsumerState<TrainerSessionsScreen> createState() => _TrainerSessionsScreenState();
}

class _TrainerSessionsScreenState extends ConsumerState<TrainerSessionsScreen> {
  final _api = ApiService();
  List<dynamic> _sessions = [];
  bool _loading = true;
  String? _error;
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _loadSessions();
  }

  Future<void> _loadSessions() async {
    setState(() => _loading = true);
    try {
      final res = await _api.getSessions(limit: 50);
      final user = ref.read(authProvider).user;
      final userId = user?['id']?.toString();
      final allSessions = (res['data'] as List?) ?? [];
      setState(() {
        _sessions = allSessions.where((s) =>
          s['trainer_id']?.toString() == userId
        ).toList();
        _error = null;
      });
    } catch (e) {
      setState(() => _error = 'Gagal memuat sesi');
    } finally {
      setState(() => _loading = false);
    }
  }

  List<dynamic> get _filteredSessions {
    if (_filter == 'all') return _sessions;
    return _sessions.where((s) => s['status'] == _filter).toList();
  }

  Future<void> _deleteSession(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Sesi'),
        content: const Text('Yakin ingin menghapus sesi ini?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Hapus', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    
    if (confirm == true) {
      setState(() => _loading = true);
      try {
        final res = await _api.deleteSession(id);
        if (!mounted) return;
        if (res['success'] != false) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Sesi berhasil dihapus'), backgroundColor: Colors.green),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(res['message'] ?? 'Gagal menghapus'), backgroundColor: Colors.red),
          );
        }
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Koneksi bermasalah'), backgroundColor: Colors.red),
        );
      }
      _loadSessions();
    }
  }

  Future<void> _showSessionForm({dynamic session}) async {
    final isEdit = session != null;
    final titleController = TextEditingController(text: isEdit ? session['title'] : '');
    final descController = TextEditingController(text: isEdit ? session['deskripsi'] : '');
    final priceController = TextEditingController(text: isEdit ? (session['price'] ?? 0).toString() : '150000');
    
    DateTime? startTime = isEdit && session['start_time'] != null ? DateTime.parse(session['start_time']) : null;
    DateTime? endTime = isEdit && session['end_time'] != null ? DateTime.parse(session['end_time']) : null;

    final formKey = GlobalKey<FormState>();

    String formatDT(DateTime? dt) => dt != null ? DateFormat('dd MMM yyyy, HH:mm').format(dt) : 'Pilih Waktu';

    await showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            Future<void> pickDateTime(bool isStart) async {
              final date = await showDatePicker(
                context: context,
                initialDate: (isStart ? startTime : endTime) ?? DateTime.now(),
                firstDate: DateTime.now().subtract(const Duration(days: 365)),
                lastDate: DateTime.now().add(const Duration(days: 365)),
              );
              if (date != null) {
                if (!context.mounted) return;
                final time = await showTimePicker(
                  context: context,
                  initialTime: TimeOfDay.fromDateTime((isStart ? startTime : endTime) ?? DateTime.now()),
                );
                if (time != null) {
                  setDialogState(() {
                    final dt = DateTime(date.year, date.month, date.day, time.hour, time.minute);
                    if (isStart) {
                      startTime = dt;
                    } else {
                      endTime = dt;
                    }
                  });
                }
              }
            }

            return AlertDialog(
              title: Text(isEdit ? 'Edit Sesi' : 'Tambah Sesi Baru'),
              content: SingleChildScrollView(
                child: Form(
                  key: formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextFormField(
                        controller: titleController,
                        decoration: const InputDecoration(labelText: 'Judul Sesi'),
                        validator: (v) => v == null || v.isEmpty ? 'Judul wajib diisi' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: descController,
                        decoration: const InputDecoration(labelText: 'Deskripsi'),
                        maxLines: 3,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: priceController,
                        decoration: const InputDecoration(labelText: 'Harga (Rp)'),
                        keyboardType: TextInputType.number,
                        validator: (v) => v == null || v.isEmpty ? 'Harga wajib diisi' : null,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Mulai:', style: TextStyle(fontWeight: FontWeight.bold)),
                          TextButton(
                            onPressed: () => pickDateTime(true),
                            child: Text(formatDT(startTime)),
                          ),
                        ],
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Selesai:', style: TextStyle(fontWeight: FontWeight.bold)),
                          TextButton(
                            onPressed: () => pickDateTime(false),
                            child: Text(formatDT(endTime)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Batal')),
                ElevatedButton(
                  onPressed: () async {
                    if (!formKey.currentState!.validate()) return;
                    if (startTime == null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Waktu mulai wajib diisi')),
                      );
                      return;
                    }
                    
                    final payload = {
                      'title': titleController.text.trim(),
                      'deskripsi': descController.text.trim(),
                      'trainer_id': ref.read(authProvider).user?['id'],
                      'start_time': DateFormat('yyyy-MM-dd HH:mm:ss').format(startTime!),
                      'end_time': endTime != null ? DateFormat('yyyy-MM-dd HH:mm:ss').format(endTime!) : null,
                      'price': double.tryParse(priceController.text) ?? 0,
                    };

                    Navigator.pop(ctx);
                    setState(() => _loading = true);
                    
                    try {
                      Map<String, dynamic> res;
                      if (isEdit) {
                        res = await _api.updateSession(session['id'], payload);
                      } else {
                        res = await _api.createSession(payload);
                      }
                      
                      if (!context.mounted) return;
                      if (res['success'] != false) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(isEdit ? 'Sesi diperbarui!' : 'Sesi ditambahkan!'), backgroundColor: Colors.green[700]),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(res['message'] ?? 'Gagal memproses'), backgroundColor: Colors.red[700]),
                        );
                      }
                    } catch (e) {
                      if (!context.mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Koneksi bermasalah'), backgroundColor: Colors.red),
                      );
                    }
                    _loadSessions();
                  },
                  child: const Text('Simpan'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Kelola Sesi'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => showProfileMenu(context, ref),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFilterChip('Semua', 'all'),
                        const SizedBox(width: 8),
                        _buildFilterChip('Terjadwal', 'scheduled'),
                        const SizedBox(width: 8),
                        _buildFilterChip('Berlangsung', 'ongoing'),
                        const SizedBox(width: 8),
                        _buildFilterChip('Selesai', 'completed'),
                      ],
                    ),
                  ),
                ),
                Expanded(child: _buildContent(theme)),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showSessionForm(),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isActive = _filter == value;
    return GestureDetector(
      onTap: () => setState(() => _filter = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? Theme.of(context).colorScheme.primary : Colors.grey[200],
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? Colors.white : Colors.grey[700],
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildContent(ThemeData theme) {
    if (_error != null) {
      return Center(child: Text(_error!, style: TextStyle(color: Colors.red[700])));
    }

    final filtered = _filteredSessions;

    if (filtered.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.event_busy, size: 48, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text('Tidak ada sesi', style: TextStyle(color: Colors.grey[500])),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadSessions,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: filtered.length,
        itemBuilder: (context, index) {
          final session = filtered[index];
          return _buildSessionCard(session, theme);
        },
      ),
    );
  }

  Widget _buildSessionCard(dynamic session, ThemeData theme) {
    final title = session['title'] ?? 'Sesi';
    final price = session['price'] ?? 0;
    final status = session['status'] ?? 'scheduled';
    final startTime = session['start_time'] != null
        ? DateFormat('dd MMM yyyy, HH:mm').format(DateTime.parse(session['start_time']))
        : '--';
    final endTime = session['end_time'] != null
        ? DateFormat('HH:mm').format(DateTime.parse(session['end_time']))
        : '--';
    final bookings = session['total_bookings'] ?? session['totalBookings'] ?? 0;

    MaterialColor statusColor;
    String statusLabel;
    switch (status) {
      case 'scheduled':
        statusColor = Colors.blue;
        statusLabel = 'Terjadwal';
        break;
      case 'ongoing':
        statusColor = Colors.green;
        statusLabel = 'Berlangsung';
        break;
      case 'completed':
        statusColor = Colors.grey;
        statusLabel = 'Selesai';
        break;
      default:
        statusColor = Colors.orange;
        statusLabel = status;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: statusColor[200]!),
                  ),
                  child: Text(statusLabel, style: TextStyle(color: statusColor[700], fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.access_time, size: 14, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text(startTime, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                if (endTime != '--') ...[
                  const SizedBox(width: 4),
                  Text('- $endTime', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                ],
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.people, size: 14, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text('$bookings booking', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                const Spacer(),
                Text(
                  'Rp${NumberFormat('#,###', 'id_ID').format(num.tryParse(price.toString()) ?? 0)}',
                  style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ],
            ),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton.icon(
                  onPressed: () => _showSessionForm(session: session),
                  icon: const Icon(Icons.edit, size: 16),
                  label: const Text('Edit', style: TextStyle(fontSize: 12)),
                ),
                const SizedBox(width: 8),
                TextButton.icon(
                  onPressed: () => _deleteSession(session['id']),
                  icon: const Icon(Icons.delete_outline, size: 16, color: Colors.red),
                  label: const Text('Hapus', style: TextStyle(fontSize: 12, color: Colors.red)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
