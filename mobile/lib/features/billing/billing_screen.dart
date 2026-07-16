import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../services/api_client.dart';
import '../../models/subscription.dart';
import '../../models/invoice.dart';

final subscriptionProvider =
    FutureProvider.autoDispose<Subscription?>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('/api/billing/subscription');
    if (response.statusCode == 200 && response.data != null) {
      return Subscription.fromJson(response.data as Map<String, dynamic>);
    }
  } catch (_) {}
  return null;
});

final usageProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('/api/billing/usage');
    if (response.statusCode == 200 && response.data != null) {
      return response.data as Map<String, dynamic>;
    }
  } catch (_) {}
  return {};
});

final invoicesProvider =
    FutureProvider.autoDispose<List<PaymentInvoice>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('/api/billing/invoices');
    if (response.statusCode == 200 && response.data != null) {
      return PaymentInvoice.fromJsonList(response.data as List<dynamic>);
    }
  } catch (_) {}
  return [];
});

class BillingScreen extends ConsumerStatefulWidget {
  const BillingScreen({super.key});

  @override
  ConsumerState<BillingScreen> createState() => _BillingScreenState();
}

class _BillingScreenState extends ConsumerState<BillingScreen> {
  final _plans = const [
    {
      'name': 'Free',
      'price': '\$0',
      'period': 'forever',
      'features': [
        'Up to 50 guests',
        '100 photos',
        'Basic RSVP',
        'Single collaborator',
        'Public website',
      ],
    },
    {
      'name': 'Premium',
      'price': '\$29',
      'period': '/month',
      'features': [
        'Up to 500 guests',
        '1,000 photos',
        'Advanced RSVP + plus-ones',
        '5 collaborators',
        'Custom website themes',
        'Email templates',
        'Priority support',
      ],
    },
    {
      'name': 'Planner',
      'price': '\$79',
      'period': '/month',
      'features': [
        'Unlimited guests',
        'Unlimited photos',
        'Full RSVP suite',
        'Unlimited collaborators',
        'All 6 website themes',
        'Email + SMS reminders',
        'Seating chart + 3D floor plan',
        'Dedicated support',
        'White-label branding',
      ],
    },
  ];

  @override
  Widget build(BuildContext context) {
    final subscriptionAsync = ref.watch(subscriptionProvider);
    final usageAsync = ref.watch(usageProvider);
    final invoicesAsync = ref.watch(invoicesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Billing & Plans')),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(subscriptionProvider);
          ref.invalidate(usageProvider);
          ref.invalidate(invoicesProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            subscriptionAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (_, __) => const SizedBox(),
              data: (sub) => sub != null ? _buildCurrentPlan(sub) : const SizedBox(),
            ),
            const SizedBox(height: 16),
            usageAsync.when(
              loading: () => const SizedBox(),
              error: (_, __) => const SizedBox(),
              data: (usage) => usage.isNotEmpty ? _buildUsageSection(usage) : const SizedBox(),
            ),
            const SizedBox(height: 24),
            _buildSectionTitle('Plans'),
            const SizedBox(height: 12),
            ..._plans.map((p) => _buildPlanCard(p, subscriptionAsync.value)),
            const SizedBox(height: 24),
            _buildSectionTitle('Invoice History'),
            const SizedBox(height: 12),
            invoicesAsync.when(
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (_, __) => const Text('Failed to load'),
              data: (invoices) => invoices.isEmpty
                  ? Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: AtelierTheme.ivoryDark,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(
                          'No invoices yet',
                          style: TextStyle(color: AtelierTheme.goldDark),
                        ),
                      ),
                    )
                  : Column(
                      children: invoices
                          .map((inv) => _buildInvoiceTile(inv))
                          .toList(),
                    ),
            ),
            const SizedBox(height: 24),
            if (subscriptionAsync.value?.plan != 'Free')
              _buildCancelButton(),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentPlan(Subscription sub) {
    final planColor = sub.plan == 'Planner'
        ? Colors.purple
        : sub.plan == 'Premium'
            ? AtelierTheme.gold
            : Colors.grey;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            planColor.withOpacity(0.1),
            planColor.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: planColor.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                sub.plan,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: planColor,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: sub.active ? Colors.green : Colors.red,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  sub.active ? 'Active' : 'Inactive',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          if (sub.expiresAt != null) ...[
            const SizedBox(height: 8),
            Text(
              'Next billing: ${_formatDate(sub.expiresAt!)}',
              style: TextStyle(color: AtelierTheme.goldDark),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildUsageSection(Map<String, dynamic> usage) {
    final items = [
      _UsageItem('Guests', usage['guests'] ?? 0, usage['guestLimit'] ?? 50),
      _UsageItem('Photos', usage['photos'] ?? 0, usage['photoLimit'] ?? 100),
      _UsageItem(
          'Memories', usage['memories'] ?? 0, usage['memoryLimit'] ?? 50),
      _UsageItem(
          'Menu Items', usage['menuItems'] ?? 0, usage['menuLimit'] ?? 20),
      _UsageItem(
          'Crew Members', usage['crew'] ?? 0, usage['crewLimit'] ?? 10),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Usage'),
        const SizedBox(height: 12),
        ...items.map((item) => _buildUsageBar(item)),
      ],
    );
  }

  Widget _buildUsageBar(_UsageItem item) {
    final fraction = item.limit > 0 ? item.current / item.limit : 0.0;
    final isWarning = fraction > 0.8;
    final color = isWarning ? Colors.orange : AtelierTheme.gold;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(item.label, style: const TextStyle(fontSize: 13)),
              Text(
                '${item.current} / ${item.limit}',
                style: TextStyle(fontSize: 12, color: AtelierTheme.goldDark),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: fraction.clamp(0.0, 1.0),
              backgroundColor: color.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildPlanCard(Map<String, dynamic> plan, Subscription? current) {
    final isCurrent = current?.plan == plan['name'];
    final isUpgrade = current == null ||
        _planIndex(plan['name']!) > _planIndex(current.plan);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    plan['name'] as String,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ),
                Text(
                  plan['price'] as String,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 22,
                  ),
                ),
                Text(
                  plan['period'] as String,
                  style: TextStyle(color: AtelierTheme.goldDark),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...(plan['features'] as List<String>).map((f) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    children: [
                      Icon(Icons.check, size: 16, color: AtelierTheme.gold),
                      const SizedBox(width: 8),
                      Expanded(child: Text(f, style: const TextStyle(fontSize: 13))),
                    ],
                  ),
                )),
            const SizedBox(height: 12),
            if (isCurrent)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: AtelierTheme.gold.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(
                  child: Text(
                    'Current Plan',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: Colors.green,
                    ),
                  ),
                ),
              )
            else if (isUpgrade)
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () => _upgradePlan(plan['name'] as String),
                  child: const Text('Upgrade'),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildInvoiceTile(PaymentInvoice invoice) {
    final statusColor = invoice.status == 'paid' ? Colors.green : Colors.orange;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        title: Text(invoice.plan),
        subtitle: Text(
          invoice.paidAt != null ? _formatDate(invoice.paidAt!) : 'N/A',
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${invoice.amount.toStringAsFixed(2)} ${invoice.currency}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                invoice.status,
                style: TextStyle(
                  fontSize: 10,
                  color: statusColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCancelButton() {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: _confirmCancelSubscription,
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.red,
          side: const BorderSide(color: Colors.red),
          padding: const EdgeInsets.symmetric(vertical: 14),
        ),
        child: const Text('Cancel Subscription'),
      ),
    );
  }

  int _planIndex(String plan) {
    switch (plan) {
      case 'Planner':
        return 2;
      case 'Premium':
        return 1;
      default:
        return 0;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  Future<void> _upgradePlan(String plan) async {
    final api = ref.read(apiClientProvider);
    try {
      await api.post('/api/billing/upgrade', data: {'plan': plan});
      ref.invalidate(subscriptionProvider);
      ref.invalidate(usageProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Upgraded to $plan')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  void _confirmCancelSubscription() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Subscription'),
        content: const Text(
          'Are you sure you want to cancel? You will lose access to premium features at the end of your billing period.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Keep Plan'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _cancelSubscription();
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Cancel Subscription'),
          ),
        ],
      ),
    );
  }

  Future<void> _cancelSubscription() async {
    final api = ref.read(apiClientProvider);
    try {
      await api.post('/api/billing/cancel');
      ref.invalidate(subscriptionProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Subscription cancelled')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }
}

class _UsageItem {
  final String label;
  final int current;
  final int limit;

  _UsageItem(this.label, this.current, this.limit);
}
