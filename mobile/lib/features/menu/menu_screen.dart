import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/theme.dart';
import '../../models/menu_item.dart';
import '../../services/api_client.dart';

final menuProvider = StateNotifierProvider<MenuNotifier, AsyncValue<List<MenuItemModel>>>((ref) {
  return MenuNotifier(ref.read(apiClientProvider));
});

class MenuNotifier extends StateNotifier<AsyncValue<List<MenuItemModel>>> {
  final ApiClient _api;

  MenuNotifier(this._api) : super(const AsyncValue.loading());

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.get('/api/menu');
      final list = MenuItemModel.fromJsonList(response.data as List<dynamic>);
      state = AsyncValue.data(list);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> create(MenuItemModel item) async {
    await _api.post('/api/menu', data: item.toJson());
    await load();
  }

  Future<void> update(MenuItemModel item) async {
    await _api.put('/api/menu/${item.id}', data: item.toJson());
    await load();
  }

  Future<void> delete(String id) async {
    await _api.delete('/api/menu/$id');
    await load();
  }

  Future<void> reorder(int oldIndex, int newIndex) async {
    state.whenData((items) {
      final updated = List<MenuItemModel>.from(items);
      final item = updated.removeAt(oldIndex);
      updated.insert(newIndex, item);
      state = AsyncValue.data(updated);
    });
  }
}

enum MenuCourse { all, starters, mains, desserts, drinks }

class MenuScreen extends ConsumerStatefulWidget {
  const MenuScreen({super.key});

  @override
  ConsumerState<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends ConsumerState<MenuScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final Map<MenuCourse, String> _courseLabels = {
    MenuCourse.all: 'All',
    MenuCourse.starters: 'Starters',
    MenuCourse.mains: 'Mains',
    MenuCourse.desserts: 'Desserts',
    MenuCourse.drinks: 'Drinks',
  };

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: MenuCourse.values.length, vsync: this);
    Future.microtask(() => ref.read(menuProvider.notifier).load());
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<MenuItemModel> _filtered(List<MenuItemModel> items) {
    final course = MenuCourse.values[_tabController.index];
    if (course == MenuCourse.all) return items;
    final target = _courseLabels[course]!.toLowerCase();
    return items.where((i) => i.course.toLowerCase() == target).toList();
  }

  Color _courseColor(String course) {
    switch (course.toLowerCase()) {
      case 'starters':
        return const Color(0xFF81C784);
      case 'mains':
        return AtelierTheme.gold;
      case 'desserts':
        return const Color(0xFFE57373);
      case 'drinks':
        return const Color(0xFF64B5F6);
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final menuAsync = ref.watch(menuProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Wedding Menu', style: TextStyle(fontWeight: FontWeight.w600)),
        bottom: TabBar(
          controller: _tabController,
          onTap: (_) => setState(() {}),
          labelColor: AtelierTheme.espresso,
          unselectedLabelColor: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
          indicatorColor: AtelierTheme.gold,
          indicatorWeight: 3,
          tabs: MenuCourse.values.map((c) => Tab(text: _courseLabels[c])).toList(),
        ),
      ),
      body: menuAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AtelierTheme.gold)),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Failed to load menu', style: TextStyle(color: Theme.of(context).colorScheme.onSurface)),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => ref.read(menuProvider.notifier).load(),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (items) {
          final filtered = _filtered(items);
          if (filtered.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.restaurant_menu, size: 64, color: AtelierTheme.goldDark),
                  const SizedBox(height: 16),
                  Text('No menu items yet', style: TextStyle(color: Theme.of(context).colorScheme.onSurface, fontSize: 16)),
                ],
              ),
            );
          }
          return RefreshIndicator(
            color: AtelierTheme.gold,
            onRefresh: () => ref.read(menuProvider.notifier).load(),
            child: ReorderableListView.builder(
              padding: const EdgeInsets.all(16),
              onReorder: (oldIndex, newIndex) {
                ref.read(menuProvider.notifier).reorder(oldIndex, newIndex);
              },
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                final item = filtered[index];
                return Dismissible(
                  key: ValueKey(item.id),
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
                        title: const Text('Delete Item'),
                        content: Text('Remove "${item.name}" from menu?'),
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
                  onDismissed: (_) => ref.read(menuProvider.notifier).delete(item.id),
                  child: Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () => _showForm(item: item),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(item.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: _courseColor(item.course).withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    item.course,
                                    style: TextStyle(
                                      color: _courseColor(item.course),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            if (item.description != null && item.description!.isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Text(
                                item.description!,
                                style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6)),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                            if (item.dietaryTags != null && item.dietaryTags!.isNotEmpty) ...[
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 6,
                                runSpacing: 6,
                                children: item.dietaryTags!.map((tag) {
                                  return Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AtelierTheme.gold.withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: AtelierTheme.goldDark.withOpacity(0.3)),
                                    ),
                                    child: Text(tag, style: const TextStyle(fontSize: 11, color: AtelierTheme.goldDark)),
                                  );
                                }).toList(),
                              ),
                            ],
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
      floatingActionButton: FloatingActionButton(
        backgroundColor: AtelierTheme.gold,
        foregroundColor: AtelierTheme.espresso,
        onPressed: () => _showForm(),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showForm({MenuItemModel? item}) {
    final isEdit = item != null;
    final nameCtrl = TextEditingController(text: item?.name ?? '');
    final descCtrl = TextEditingController(text: item?.description ?? '');
    final tagsCtrl = TextEditingController(text: item?.dietaryTags?.join(', ') ?? '');
    String course = item?.course ?? 'Starters';

    final courses = ['Starters', 'Mains', 'Desserts', 'Drinks'];

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
                  isEdit ? 'Edit Menu Item' : 'Add Menu Item',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 20),
                DropdownButtonFormField<String>(
                  value: course,
                  items: courses.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                  onChanged: (v) => setSheetState(() => course = v!),
                  decoration: const InputDecoration(labelText: 'Course'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(labelText: 'Name'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descCtrl,
                  decoration: const InputDecoration(labelText: 'Description'),
                  maxLines: 2,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: tagsCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Dietary Tags',
                    hintText: 'Comma separated',
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (nameCtrl.text.trim().isEmpty) return;
                      final tags = tagsCtrl.text.split(',').map((t) => t.trim()).where((t) => t.isNotEmpty).toList();
                      final newItem = MenuItemModel(
                        id: item?.id ?? '',
                        tenantId: item?.tenantId ?? '',
                        course: course,
                        name: nameCtrl.text.trim(),
                        description: descCtrl.text.trim().isEmpty ? null : descCtrl.text.trim(),
                        dietaryTags: tags.isEmpty ? null : tags,
                        sortOrder: item?.sortOrder ?? 0,
                      );
                      final notifier = ref.read(menuProvider.notifier);
                      if (isEdit) {
                        await notifier.update(newItem);
                      } else {
                        await notifier.create(newItem);
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
