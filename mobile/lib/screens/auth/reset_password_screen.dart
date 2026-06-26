import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_service.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  final String email;

  const ResetPasswordScreen({super.key, required this.email});

  @override
  ConsumerState<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _otpController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  final _api = ApiService();
  late final String _email = widget.email.trim().toLowerCase();

  bool _isLoading = false;
  bool _resending = false;
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  bool _success = false;
  String? _errorMsg;
  int _resendCooldown = 0;
  Timer? _cooldownTimer;

  @override
  void dispose() {
    _otpController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
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

  Future<void> _resendOtp() async {
    if (_resendCooldown > 0 || _resending) return;

    setState(() {
      _resending = true;
      _errorMsg = null;
    });

    final res = await _api.forgotPassword(_email);

    if (!mounted) return;

    if (res['success'] != false) {
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
        _errorMsg = res['error']?['message'] ?? res['message'] ?? 'Gagal mengirim ulang OTP.';
        _resending = false;
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_email.isEmpty) {
      setState(() => _errorMsg = 'Email tidak ditemukan. Silakan ulangi proses lupa password.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMsg = null;
    });

    final res = await _api.resetPassword(
      _email,
      _otpController.text.trim(),
      _passwordController.text,
    );

    if (!mounted) return;

    if (res['success'] != false && res['error'] == null) {
      setState(() {
        _success = true;
        _isLoading = false;
      });
    } else {
      setState(() {
        _errorMsg = res['error']?['message'] ?? res['message'] ?? 'Gagal mereset password. Kode OTP mungkin salah atau sudah kedaluwarsa.';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Reset Password'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/login'),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.lock_outline, size: 64, color: theme.colorScheme.primary),
                  const SizedBox(height: 16),
                  Text(
                    'Password Baru',
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Masukkan kode OTP yang dikirim ke email Anda dan buat password baru.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey, fontSize: 14),
                  ),
                  if (_email.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      _email,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                  const SizedBox(height: 32),

                  if (_success) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.green[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.green[200]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.check_circle, color: Colors.green[700], size: 24),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Password berhasil diubah! Silakan login dengan password baru.',
                              style: TextStyle(color: Colors.green[700], fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () => context.go('/login'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: theme.colorScheme.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text('LOGIN SEKARANG', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ] else ...[
                    if (_errorMsg != null) ...[
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
                              child: Text(_errorMsg!, style: TextStyle(color: Colors.red[700], fontSize: 13)),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // OTP field
                    TextFormField(
                      controller: _otpController,
                      keyboardType: TextInputType.number,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(6),
                      ],
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 28, letterSpacing: 8, fontWeight: FontWeight.bold),
                      decoration: const InputDecoration(
                        labelText: 'Kode OTP (6 Digit)',
                        hintText: '000000',
                        prefixIcon: Icon(Icons.password_outlined),
                        border: OutlineInputBorder(),
                      ),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Kode OTP wajib diisi';
                        if (v.trim().length != 6) return 'Kode OTP harus 6 digit';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // New password field
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: InputDecoration(
                        labelText: 'Password Baru',
                        prefixIcon: const Icon(Icons.lock_outlined),
                        border: const OutlineInputBorder(),
                        hintText: 'Minimal 6 karakter',
                        suffixIcon: IconButton(
                          icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                      validator: (v) {
                        if (v == null || v.isEmpty) return 'Password wajib diisi';
                        if (v.length < 6) return 'Password minimal 6 karakter';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Confirm password field
                    TextFormField(
                      controller: _confirmController,
                      obscureText: _obscureConfirm,
                      decoration: InputDecoration(
                        labelText: 'Konfirmasi Password',
                        prefixIcon: const Icon(Icons.lock_outlined),
                        border: const OutlineInputBorder(),
                        hintText: 'Ulangi password baru',
                        suffixIcon: IconButton(
                          icon: Icon(_obscureConfirm ? Icons.visibility_off : Icons.visibility),
                          onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
                        ),
                      ),
                      validator: (v) {
                        if (v == null || v.isEmpty) return 'Konfirmasi password wajib diisi';
                        if (v != _passwordController.text) return 'Password tidak cocok';
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),

                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: theme.colorScheme.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                height: 20, width: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Text('UBAH PASSWORD', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Resend OTP
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
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
