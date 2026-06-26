import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_service.dart';

class VerifyOtpScreen extends StatefulWidget {
  final String email;

  const VerifyOtpScreen({super.key, required this.email});

  @override
  State<VerifyOtpScreen> createState() => _VerifyOtpScreenState();
}

class _VerifyOtpScreenState extends State<VerifyOtpScreen> {
  final _otpController = TextEditingController();
  final _api = ApiService();
  late final String _email = widget.email.trim().toLowerCase();
  bool _loading = false;
  bool _resending = false;
  String? _error;
  int _resendCooldown = 0;
  Timer? _cooldownTimer;

  @override
  void dispose() {
    _otpController.dispose();
    _cooldownTimer?.cancel();
    super.dispose();
  }

  void _startCooldown() {
    setState(() => _resendCooldown = 60);
    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _resendCooldown--;
        if (_resendCooldown <= 0) {
          timer.cancel();
        }
      });
    });
  }

  Future<void> _verifyOtp() async {
    final otp = _otpController.text.trim();
    if (otp.length != 6) {
      setState(() => _error = 'Kode OTP harus 6 digit');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    final res = await _api.verifyOtp(_email, otp);

    if (!mounted) return;

    if (res['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Email berhasil diverifikasi! Silakan login.'),
          backgroundColor: Colors.green[700],
        ),
      );
      context.go('/login');
    } else {
      setState(() {
        _error = res['message'] ?? 'Kode OTP salah atau sudah kedaluwarsa.';
        _loading = false;
      });
    }
  }

  Future<void> _resendOtp() async {
    if (_resendCooldown > 0) return;

    setState(() {
      _resending = true;
      _error = null;
    });

    final res = await _api.resendOtp(_email);

    if (!mounted) return;

    if (res['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Kode OTP baru telah dikirim ke email Anda.'),
          backgroundColor: Colors.green[700],
        ),
      );
      _startCooldown();
      setState(() => _resending = false);
    } else {
      setState(() {
        _error = res['message'] ?? 'Gagal mengirim ulang OTP.';
        _resending = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.asset(
                    'assets/images/logo.png',
                    height: 80,
                    width: 80,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(height: 16),
                Icon(Icons.mark_email_unread_outlined, size: 48, color: theme.colorScheme.primary),
                const SizedBox(height: 16),
                Text(
                  'Verifikasi Email',
                  style: theme.textTheme.headlineLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Kode OTP telah dikirim ke',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _email,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 32),

                if (_error != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.red[50],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red[200]!),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline, color: Colors.red[700], size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _error!,
                            style: TextStyle(color: Colors.red[700], fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),

                TextFormField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(6),
                  ],
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 32, letterSpacing: 8, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(
                    labelText: 'Kode OTP (6 Digit)',
                    hintText: '000000',
                    prefixIcon: Icon(Icons.password_outlined),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _verifyOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: theme.colorScheme.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: _loading
                        ? const SizedBox(
                            height: 20, width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('VERIFIKASI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 16),

                TextButton(
                  onPressed: _resendCooldown > 0 || _resending ? null : _resendOtp,
                  child: Text(
                    _resendCooldown > 0
                        ? 'Kirim ulang OTP ($_resendCooldown s)'
                        : _resending
                            ? 'Mengirim...'
                            : 'Tidak menerima kode? Kirim ulang OTP',
                  ),
                ),
                const SizedBox(height: 8),

                TextButton(
                  onPressed: () => context.go('/login'),
                  child: const Text('Kembali ke Login'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
