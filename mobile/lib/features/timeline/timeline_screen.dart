import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../config/theme.dart';
import '../../models/timeline_event.dart';
import '../../services/api_client.dart';

final timelineProvider = StateNotifierProvider<TimelineNotifier, AsyncValue<List<TimelineEvent>>>((ref) {
  return TimelineNotifier(ref.read(apiClientProvider));
});

class TimelineNotifier extends StateNotifier<AsyncValue<List<TimelineEvent>>> {
  final ApiClient _api;

  TimelineNotifier(this._api) : super(const AsyncValue.loading());

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.get('/api/timeline');
      final list = TimelineEvent.fromJsonList(response.data as List<dynamic>);
      state = AsyncValue.data(list);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> create(TimelineEvent event) async {
    await _api.post('/api/timeline', data: event.toJson());
    await load();
  }

  Future<void> update(TimelineEvent event) async {
    await _api.put('/api/timeline/${event.id}', data: event.toJson());
    await load();
  }

  Future<void> delete(String id) async {
    await _api.delete('/api/timeline/$id');
    await load();
  }

  Future<void> toggleStatus(TimelineEvent event) async {
    final nextStatus = event.status == 'completed'
        ? 'pending'
        : event.status == 'pending'
            ? 'in-progress'
            : 'completed';
    await update(TimelineEvent(
      id: event.id,
      tenantId: event.tenantId,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      assignedCrewId: event.assignedCrewId,
      status: nextStatus,
      category: event.category,
    ));
  }
}

enum TimelineFilter { all, morning, afternoon, evening }

class TimelineScreen extends ConsumerStatefulWidget {
  const TimelineScreen({super.key});

  @override
  ConsumerState<TimelineScreen> createState() => _TimelineScreenState();
}

class _TimelineScreenState extends ConsumerState<TimelineScreen> {
  TimelineFilter _filter = TimelineFilter.all;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(timelineProvider.notifier).load());
  }

  List<TimelineEvent> _filtered(List<TimelineEvent> events) {
    switch (_filter) {
      case TimelineFilter.all:
        return events;
      case TimelineFilter.morning:
        return events.where((e) => e.startTime != null && e.startTime!.hour < 12).toList();
      case TimelineFilter.afternoon:
        return events.where((e) => e.startTime != null && e.startTime!.hour >= 12 && e.startTime!.hour < 17).toList();
      case TimelineFilter.evening:
        return events.where((e) => e.startTime != null && e.startTime!.hour >= 17).toList();
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'completed':
        return const Color(0xFF4CAF50);
      case 'in-progress':
        return AtelierTheme.gold;
      default:
        return Colors.grey;
    }
  }

  String _formatTime(DateTime? dt) {
    if (dt == null) return '--:--';
    return DateFormat('h:mm a').format(dt);
  }

  @override
  Widget build(BuildContext context) {
    final timelineAsync = ref.watch(timelineProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Day Timeline', style: TextStyle(fontWeight: FontWeight.w600)),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 52,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: TimelineFilter.values.map((f) {
                final selected = _filter == f;
                final label = f == TimelineFilter.all
                    ? 'All'
                    : f == TimelineFilter.morning
                        ? 'Morning'
                        : f == TimelineFilter.afternoon
                            ? 'Afternoon'
                            : 'Evening';
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(label),
                    selected: selected,
                    onSelected: (_) => setState(() => _filter = f),
                    selectedColor: AtelierTheme.gold,
                    backgroundColor: Theme.of(context).colorScheme.surface,
                    labelStyle: TextStyle(
                      color: selected ? AtelierTheme.espresso : Theme.of(context).colorScheme.onSurface,
                      fontWeight: FontWeight.w500,
                    ),
                    checkmarkColor: AtelierTheme.espresso,
                    side: BorderSide(color: AtelierTheme.goldDark),
                  ),
                );
              }).toList(),
            ),
          ),
          Expanded(
            child: timelineAsync.when(
              loading: () => const Center(child: CircularProgressIndicator(color: AtelierTheme.gold)),
              error: (e, _) => Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Failed to load timeline', style: TextStyle(color: Theme.of(context).colorScheme.onSurface)),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () => ref.read(timelineProvider.notifier).load(),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
              data: (events) {
                final filtered = _filtered(events);
                if (filtered.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.timeline, size: 64, color: AtelierTheme.goldDark),
                        const SizedBox(height: 16),
                        Text('No events yet', style: TextStyle(color: Theme.of(context).colorScheme.onSurface, fontSize: 16)),
                      ],
                    ),
                  );
                }
                return RefreshIndicator(
                  color: AtelierTheme.gold,
                  onRefresh: () => ref.read(timelineProvider.notifier).load(),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final event = filtered[index];
                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            width: 70,
                            child: Column(
                              children: [
                                Container(
                                  width: 12,
                                  height: 12,
                                  decoration: BoxDecoration(
                                    color: _statusColor(event.status),
                                    shape: BoxShape.circle,
                                    border: Border.all(color: AtelierTheme.gold, width: 2),
                                  ),
                                ),
                                if (index < filtered.length - 1)
                                  Container(
                                    width: 2,
                                    height: 80,
                                    color: AtelierTheme.goldDark.withOpacity(0.3),
                                  ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: InkWell(
                                borderRadius: BorderRadius.circular(16),
                                onTap: () => _showForm(event: event),
                                onLongPress: () async {
                                  final confirm = await showDialog<bool>(
                                    context: context,
                                    builder: (ctx) => AlertDialog(
                                      backgroundColor: Theme.of(context).colorScheme.surface,
                                      title: const Text('Delete Event'),
                                      content: Text('Remove "${event.title}" from timeline?'),
                                      actions: [
                                        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                                        TextButton(
                                          onPressed: () => Navigator.pop(ctx, true),
                                          child: const Text('Delete', style: TextStyle(color: Colors.red)),
                                        ),
                                      ],
                                    ),
                                  );
                                  if (confirm == true) {
                                    ref.read(timelineProvider.notifier).delete(event.id);
                                  }
                                },
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  event.title,
                                                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  '${_formatTime(event.startTime)} - ${_formatTime(event.endTime)}',
                                                  style: TextStyle(
                                                    fontSize: 13,
                                                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          GestureDetector(
                                            onTap: () => ref.read(timelineProvider.notifier).toggleStatus(event),
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                              decoration: BoxDecoration(
                                                color: _statusColor(event.status).withOpacity(0.15),
                                                borderRadius: BorderRadius.circular(8),
                                              ),
                                              child: Text(
                                                event.status,
                                                style: TextStyle(
                                                  color: _statusColor(event.status),
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      if (event.location != null) ...[
                                        const SizedBox(height: 8),
                                        Row(
                                          children: [
                                            Icon(Icons.location_on_outlined, size: 16, color: AtelierTheme.goldDark),
                                            const SizedBox(width: 4),
                                            Expanded(
                                              child: Text(
                                                event.location!,
                                                style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7)),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                      if (event.description != null && event.description!.isNotEmpty) ...[
                                        const SizedBox(height: 8),
                                        Text(
                                          event.description!,
                                          style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6)),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AtelierTheme.gold,
        foregroundColor: AtelierTheme.espresso,
        onPressed: () => _showForm(),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showForm({TimelineEvent? event}) {
    final isEdit = event != null;
    final titleCtrl = TextEditingController(text: event?.title ?? '');
    final descCtrl = TextEditingController(text: event?.description ?? '');
    final locationCtrl = TextEditingController(text: event?.location ?? '');
    DateTime? startTime = event?.startTime;
    DateTime? endTime = event?.endTime;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
            left: 24,
            right: 24,
            top: 24,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isEdit ? 'Edit Event' : 'Add Event',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(labelText: 'Title'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descCtrl,
                  decoration: const InputDecoration(labelText: 'Description'),
                  maxLines: 2,
                ),
                const SizedBox(height: 12),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(
                    startTime != null ? DateFormat('MMM d, yyyy h:mm a').format(startTime!) : 'Start Time',
                    style: TextStyle(
                      color: startTime != null ? Theme.of(context).colorScheme.onSurface : Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
                    ),
                  ),
                  trailing: const Icon(Icons.access_time, color: AtelierTheme.gold),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: ctx,
                      initialDate: startTime ?? DateTime.now(),
                      firstDate: DateTime(2024),
                      lastDate: DateTime(2030),
                    );
                    if (date != null && ctx.mounted) {
                      final time = await showTimePicker(
                        context: ctx,
                        initialTime: TimeOfDay.fromDateTime(startTime ?? DateTime.now()),
                      );
                      if (time != null) {
                        setSheetState(() {
                          startTime = DateTime(date.year, date.month, date.day, time.hour, time.minute);
                        });
                      }
                    }
                  },
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(
                    endTime != null ? DateFormat('MMM d, yyyy h:mm a').format(endTime!) : 'End Time',
                    style: TextStyle(
                      color: endTime != null ? Theme.of(context).colorScheme.onSurface : Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
                    ),
                  ),
                  trailing: const Icon(Icons.access_time, color: AtelierTheme.gold),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: ctx,
                      initialDate: endTime ?? DateTime.now(),
                      firstDate: DateTime(2024),
                      lastDate: DateTime(2030),
                    );
                    if (date != null && ctx.mounted) {
                      final time = await showTimePicker(
                        context: ctx,
                        initialTime: TimeOfDay.fromDateTime(endTime ?? DateTime.now()),
                      );
                      if (time != null) {
                        setSheetState(() {
                          endTime = DateTime(date.year, date.month, date.day, time.hour, time.minute);
                        });
                      }
                    }
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: locationCtrl,
                  decoration: const InputDecoration(labelText: 'Location'),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (titleCtrl.text.trim().isEmpty) return;
                      final newEvent = TimelineEvent(
                        id: event?.id ?? '',
                        tenantId: event?.tenantId ?? '',
                        title: titleCtrl.text.trim(),
                        description: descCtrl.text.trim().isEmpty ? null : descCtrl.text.trim(),
                        startTime: startTime,
                        endTime: endTime,
                        location: locationCtrl.text.trim().isEmpty ? null : locationCtrl.text.trim(),
                        assignedCrewId: event?.assignedCrewId,
                        status: event?.status ?? 'pending',
                        category: event?.category,
                      );
                      final notifier = ref.read(timelineProvider.notifier);
                      if (isEdit) {
                        await notifier.update(newEvent);
                      } else {
                        await notifier.create(newEvent);
                      }
                      if (ctx.mounted) Navigator.pop(ctx);
                    },
                    child: Text(isEdit ? 'Update' : 'Add'),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
