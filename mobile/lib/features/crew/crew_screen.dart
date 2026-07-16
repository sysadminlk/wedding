import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/theme.dart';
import '../../models/crew_member.dart';
import '../../services/api_client.dart';

final crewProvider = StateNotifierProvider<CrewNotifier, AsyncValue<List<CrewMember>>>((ref) {
  return CrewNotifier(ref.read(apiClientProvider));
});

class CrewNotifier extends StateNotifier<AsyncValue<List<CrewMember>>> {
  final ApiClient _api;

  CrewNotifier(this._api) : super(const AsyncValue.loading());

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.get('/api/crew');
      final list = CrewMember.fromJsonList(response.data as List<dynamic>);
      state = AsyncValue.data(list);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> create(CrewMember member) async {
    await _api.post('/api/crew', data: member.toJson());
    await load();
  }

  Future<void> update(CrewMember member) async {
    await _api.put('/api/crew/${member.id}', data: member.toJson());
    await load();
  }

  Future<void> delete(String id) async {
    await _api.delete('/api/crew/$id');
    await load();
  }
}

enum CrewFilter { all, bride, groom, external }

class CrewScreen extends ConsumerStatefulWidget {
  const CrewScreen({super.key});

  @override
  ConsumerState<CrewScreen> createState() => _CrewScreenState();
}

class _CrewScreenState extends ConsumerState<CrewScreen> {
  CrewFilter _filter = CrewFilter.all;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(crewProvider.notifier).load());
  }

  List<CrewMember> _filtered(List<CrewMember> members) {
    switch (_filter) {
      case CrewFilter.all:
        return members;
      case CrewFilter.bride:
        return members.where((m) => m.role.toLowerCase().contains('bride')).toList();
      case CrewFilter.groom:
        return members.where((m) => m.role.toLowerCase().contains('groom')).toList();
      case CrewFilter.external:
        return members.where((m) => m.isExternal).toList();
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

  @override
  Widget build(BuildContext context) {
    final crewAsync = ref.watch(crewProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Wedding Crew', style: TextStyle(fontWeight: FontWeight.w600)),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 52,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: CrewFilter.values.map((f) {
                final selected = _filter == f;
                final label = f == CrewFilter.all
                    ? 'All'
                    : f == CrewFilter.bride
                        ? "Bride's Side"
                        : f == CrewFilter.groom
                            ? "Groom's Side"
                            : 'External';
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
            child: crewAsync.when(
              loading: () => const Center(child: CircularProgressIndicator(color: AtelierTheme.gold)),
              error: (e, _) => Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Failed to load crew', style: TextStyle(color: Theme.of(context).colorScheme.onSurface)),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () => ref.read(crewProvider.notifier).load(),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
              data: (members) {
                final filtered = _filtered(members);
                if (filtered.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.people_outline, size: 64, color: AtelierTheme.goldDark),
                        const SizedBox(height: 16),
                        Text('No crew members yet', style: TextStyle(color: Theme.of(context).colorScheme.onSurface, fontSize: 16)),
                      ],
                    ),
                  );
                }
                return RefreshIndicator(
                  color: AtelierTheme.gold,
                  onRefresh: () => ref.read(crewProvider.notifier).load(),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final member = filtered[index];
                      return Dismissible(
                        key: ValueKey(member.id),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 24),
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.error,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Icon(Icons.delete, color: Colors.white),
                        ),
                        confirmDismiss: (_) async {
                          return await showDialog<bool>(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              backgroundColor: Theme.of(context).colorScheme.surface,
                              title: const Text('Delete Member'),
                              content: Text('Remove ${member.name} from crew?'),
                              actions: [
                                TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                                TextButton(
                                  onPressed: () => Navigator.pop(ctx, true),
                                  child: const Text('Delete', style: TextStyle(color: Colors.red)),
                                ),
                              ],
                            ),
                          );
                        },
                        onDismissed: (_) => ref.read(crewProvider.notifier).delete(member.id),
                        child: Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () => _showForm(member: member),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 24,
                                    backgroundColor: AtelierTheme.goldLight,
                                    child: Text(
                                      member.name.isNotEmpty ? member.name[0].toUpperCase() : '?',
                                      style: const TextStyle(color: AtelierTheme.espresso, fontWeight: FontWeight.bold, fontSize: 18),
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Text(
                                                member.name,
                                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                                              ),
                                            ),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                              decoration: BoxDecoration(
                                                color: _statusColor(member.dutyStatus).withOpacity(0.15),
                                                borderRadius: BorderRadius.circular(8),
                                              ),
                                              child: Text(
                                                member.dutyStatus,
                                                style: TextStyle(
                                                  color: _statusColor(member.dutyStatus),
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 4),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: AtelierTheme.gold.withOpacity(0.15),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            member.role,
                                            style: const TextStyle(color: AtelierTheme.goldDark, fontSize: 12, fontWeight: FontWeight.w500),
                                          ),
                                        ),
                                        if (member.phone != null || member.email != null) ...[
                                          const SizedBox(height: 6),
                                          if (member.phone != null)
                                            Text(member.phone!, style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6))),
                                          if (member.email != null)
                                            Text(member.email!, style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6))),
                                        ],
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
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

  void _showForm({CrewMember? member}) {
    final isEdit = member != null;
    final nameCtrl = TextEditingController(text: member?.name ?? '');
    final phoneCtrl = TextEditingController(text: member?.phone ?? '');
    final emailCtrl = TextEditingController(text: member?.email ?? '');
    final notesCtrl = TextEditingController(text: member?.notes ?? '');
    String role = member?.role ?? 'Maid of Honor';
    bool isExternal = member?.isExternal ?? false;
    String dutyStatus = member?.dutyStatus ?? 'pending';

    final roles = [
      'Maid of Honor', 'Best Man', 'Bridesmaid', 'Groomsman',
      'Flower Girl', 'Ring Bearer', 'Usher', 'Officiant',
      'Photographer', 'Planner', 'DJ', 'Other',
    ];

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
                  isEdit ? 'Edit Crew Member' : 'Add Crew Member',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(labelText: 'Name'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: role,
                  items: roles.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                  onChanged: (v) => setSheetState(() => role = v!),
                  decoration: const InputDecoration(labelText: 'Role'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneCtrl,
                  decoration: const InputDecoration(labelText: 'Phone'),
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: emailCtrl,
                  decoration: const InputDecoration(labelText: 'Email'),
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  title: const Text('External Vendor'),
                  value: isExternal,
                  onChanged: (v) => setSheetState(() => isExternal = v),
                  activeColor: AtelierTheme.gold,
                  contentPadding: EdgeInsets.zero,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: dutyStatus,
                  items: const [
                    DropdownMenuItem(value: 'pending', child: Text('Pending')),
                    DropdownMenuItem(value: 'in-progress', child: Text('In Progress')),
                    DropdownMenuItem(value: 'completed', child: Text('Completed')),
                  ],
                  onChanged: (v) => setSheetState(() => dutyStatus = v!),
                  decoration: const InputDecoration(labelText: 'Status'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: notesCtrl,
                  decoration: const InputDecoration(labelText: 'Notes'),
                  maxLines: 2,
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (nameCtrl.text.trim().isEmpty) return;
                      final newMember = CrewMember(
                        id: member?.id ?? '',
                        tenantId: member?.tenantId ?? '',
                        name: nameCtrl.text.trim(),
                        role: role,
                        phone: phoneCtrl.text.trim().isEmpty ? null : phoneCtrl.text.trim(),
                        email: emailCtrl.text.trim().isEmpty ? null : emailCtrl.text.trim(),
                        isExternal: isExternal,
                        notes: notesCtrl.text.trim().isEmpty ? null : notesCtrl.text.trim(),
                        dutyStatus: dutyStatus,
                      );
                      final notifier = ref.read(crewProvider.notifier);
                      if (isEdit) {
                        await notifier.update(newMember);
                      } else {
                        await notifier.create(newMember);
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
