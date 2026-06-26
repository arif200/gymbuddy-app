import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class MidtransWebViewScreen extends StatefulWidget {
  final String paymentUrl;
  final String finishUrl;
  final VoidCallback? onFinish;

  const MidtransWebViewScreen({
    super.key,
    required this.paymentUrl,
    required this.finishUrl,
    this.onFinish,
  });

  @override
  State<MidtransWebViewScreen> createState() => _MidtransWebViewScreenState();
}

class _MidtransWebViewScreenState extends State<MidtransWebViewScreen> {
  bool _isLoading = true;
  double _progress = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pembayaran Midtrans'),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            if (_progress < 1.0)
              LinearProgressIndicator(
                value: _progress,
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation<Color>(
                  Theme.of(context).colorScheme.primary,
                ),
              ),
            Expanded(
              child: InAppWebView(
                initialUrlRequest: URLRequest(
                  url: WebUri(widget.paymentUrl),
                ),
                initialOptions: InAppWebViewGroupOptions(
                  crossPlatform: InAppWebViewOptions(
                    useShouldOverrideUrlLoading: true,
                    mediaPlaybackRequiresUserGesture: false,
                  ),
                  android: AndroidInAppWebViewOptions(
                    useHybridComposition: true,
                  ),
                  ios: IOSInAppWebViewOptions(
                    allowsInlineMediaPlayback: true,
                  ),
                ),
                onProgressChanged: (controller, progress) {
                  setState(() {
                    _progress = progress / 100;
                    _isLoading = progress < 100;
                  });
                },
                onLoadStart: (controller, url) {
                  final currentUrl = url?.toString() ?? '';
                  if (_isFinishUrl(currentUrl)) {
                    widget.onFinish?.call();
                    if (mounted) Navigator.of(context).pop();
                  }
                },
                onLoadStop: (controller, url) {
                  setState(() => _isLoading = false);
                  final currentUrl = url?.toString() ?? '';
                  if (_isFinishUrl(currentUrl)) {
                    widget.onFinish?.call();
                    if (mounted) Navigator.of(context).pop();
                  }
                },
                shouldOverrideUrlLoading: (controller, navigationAction) async {
                  final url = navigationAction.request.url?.toString() ?? '';
                  if (_isFinishUrl(url)) {
                    widget.onFinish?.call();
                    if (mounted) Navigator.of(context).pop();
                    return NavigationActionPolicy.CANCEL;
                  }
                  return NavigationActionPolicy.ALLOW;
                },
                onConsoleMessage: (controller, consoleMessage) {
                  debugPrint('Midtrans WebView: ${consoleMessage.message}');
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  bool _isFinishUrl(String url) {
    return url.startsWith(widget.finishUrl) ||
        url.contains('/dashboard/my-bookings');
  }
}
