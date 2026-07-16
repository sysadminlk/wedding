import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../services/api_client.dart';
import '../../models/guest.dart';

class RsvpSettings {
  String? responseDeadline;
  bool allowPlusOnes;
  String customMessage;

  RsvpSettings({
    this.responseDeadline,
    this.allowPlusOnes = true,
    this.customMessage = '',
  });
}

final rsvpSettingsProvider =
    FutureProvider.autoDispose<RsvpSettings>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('/api/rsvp/settings');
    if (response.statusCode == 200 && response.data != null) {
      final data = response.data as Map<String, dynamic>;
      return RsvpSettings(
        responseDeadline: data['responseDeadline'] as String?,
        allowPlusOnes: data['allowPlusOnes'] as bool? ?? true,
        customMessage: data['customMessage'] as String? ?? '',
      );
    }
  } catch (_) {}
  return RsvpSettings();
});

final guestListProvider =
    FutureProvider.autoDispose<List<Guest>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('/api/guests');
    if (response.statusCode == 200 && response.data != null) {
      return Guest.fromJsonList(response.data as List<dynamic>);
    }
  } catch (_) {}
  return [];
});

class RsvpScreen extends ConsumerStatefulWidget {
  const RsvpScreen({super.key});

  @override
  ConsumerState<RsvpScreen> createState() => _RsvpScreenState();
}

class _RsvpScreenState extends ConsumerState<RsvpScreen> {
  bool _allowPlusOnes = true;
  final _messageController = TextEditingController();
  DateTime? _deadline;
  bool _saving = false;
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final settings = await ref.read(rsvpSettingsProvider.future);
    if (mounted) {
      setState(() {
        _allowPlusOnes = settings.allowPlusOnes;
        _messageController.text = settings.customMessage;
        _deadline = settings.responseDeadline != null
            ? DateTime.tryParse(settings.responseDeadline!)
            : null;
        _initialized = true;
      });
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _pickDeadline() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _deadline ?? DateTime.now().add(const Duration(days: 30)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() => _deadline = picked);
    }
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    final api = ref.read(apiClientProvider);
    try {
      await api.put('/api/rsvp/settings', data: {
        'responseDeadline': _deadline?.toIso8601String(),
        'allowPlusOnes': _allowPlusOnes,
        'customMessage': _messageController.text,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('RSVP settings saved')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final guestsAsync = ref.watch(guestListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('RSVP Management')),
      body: guestsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Failed to load')),
        data: (guests) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(rsvpSettingsProvider);
            ref.invalidate(guestListProvider);
            await _loadSettings();
          },
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildStatsSection(guests),
              const SizedBox(height: 24),
              _buildSectionTitle('RSVP Settings'),
              const SizedBox(height: 12),
              _buildDeadlineField(),
              const SizedBox(height: 12),
              _buildPlusOnesToggle(),
              const SizedBox(height: 12),
              TextField(
                controller: _messageController,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Custom RSVP message...',
                ),
              ),
              const SizedBox(height: 24),
              _buildSectionTitle('Guest Responses'),
              const SizedBox(height: 12),
              ...guests.map((g) => _buildGuestTile(g)),
              const SizedBox(height: 32),
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: _saving ? null : _save,
                  child: _saving
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Save'),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsSection(List<Guest> guests) {
    final total = guests.length;
    final attending = guests.where((g) => g.rsvpStatus == 'attending').length;
    final declined = guests.where((g) => g.rsvpStatus == 'declined').length;
    final pending = guests.where((g) => g.rsvpStatus == 'pending').length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('RSVP Stats'),
        const SizedBox(height: 12),
        Row(
          children: [
            _buildStatCard('Total', total, AtelierTheme.espresso),
            const SizedBox(width: 8),
            _buildStatCard('Attending', attending, Colors.green),
            const SizedBox(width: 8),
            _buildStatCard('Declined', declined, Colors.red),
            const SizedBox(width: 8),
            _buildStatCard('Pending', pending, AtelierTheme.gold),
          ],
        ),
        const SizedBox(height: 16),
        if (total > 0)
          Column(
            children: [
              _buildProgressRow('Attending', attending, total, Colors.green),
              const SizedBox(height: 8),
              _buildProgressRow('Declined', declined, total, Colors.red),
              const SizedBox(height: 8),
              _buildProgressRow('Pending', pending, total, AtelierTheme.gold),
            ],
          ),
      ],
    );
  }

  Widget _buildStatCard(String label, int count, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Text(
              count.toString(),
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                color: color,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressRow(String label, int value, int total, Color color) {
    return Row(
      children: [
        SizedBox(
          width: 72,
          child: Text(label, style: const TextStyle(fontSize: 12)),
        ),
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: total > 0 ? value / total : 0,
              backgroundColor: color.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 8,
            ),
          ),
        ),
        const SizedBox(width: 8),
        SizedBox(
          width: 40,
          child: Text(
            total > 0 ? '${(value / total * 100).round()}%' : '0%',
            style: const TextStyle(fontSize: 12),
            textAlign: TextAlign.right,
          ),
        ),
      ],
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

  Widget _buildDeadlineField() {
    return GestureDetector(
      onTap: _pickDeadline,
      child: InputDecorator(
        decoration: const InputDecoration(
          suffixIcon: Icon(Icons.calendar_today),
        ),
        child: Text(
          _deadline != null
              ? '${_deadline!.day}/${_deadline!.month}/${_deadline!.year}'
              : 'Response deadline (optional)',
          style: TextStyle(
            color: _deadline != null ? null : Colors.grey,
          ),
        ),
      ),
    );
  }

  Widget _buildPlusOnesToggle() {
    return SwitchListTile(
      title: const Text('Allow plus-ones'),
      subtitle: const Text('Let guests bring a companion'),
      value: _allowPlusOnes,
      onChanged: (v) => setState(() => _allowPlusOnes = v),
      activeColor: AtelierTheme.gold,
      contentPadding: EdgeInsets.zero,
    );
  }

  Widget _buildGuestTile(Guest guest) {
    final statusColor = {
      'attending': Colors.green,
      'declined': Colors.red,
      'pending': AtelierTheme.gold,
    }[guest.rsvpStatus] ?? Colors.grey;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: statusColor.withOpacity(0.15),
          child: Text(
            guest.name.isNotEmpty ? guest.name[0].toUpperCase() : '?',
            style: TextStyle(color: statusColor, fontWeight: FontWeight.bold),
          ),
        ),
        title: Text(guest.name),
        subtitle: Text(guest.email ?? 'No email'),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            guest.rsvpStatus[0].toUpperCase() + guest.rsvpStatus.substring(1),
            style: TextStyle(
              fontSize: 11,
              color: statusColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}
