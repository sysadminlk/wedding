import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../config/theme.dart';
import '../../models/inspiration_item.dart';
import '../../services/api_client.dart';

final inspirationProvider = StateNotifierProvider<InspirationNotifier, AsyncValue<List<InspirationItem>>>((ref) {
  return InspirationNotifier(ref.read(apiClientProvider));
});

class InspirationNotifier extends StateNotifier<AsyncValue<List<InspirationItem>>> {
  final ApiClient _api;

  InspirationNotifier(this._api) : super(const AsyncValue.loading());

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.get('/api/inspiration');
      final list = InspirationItem.fromJsonList(response.data as List<dynamic>);
      state = AsyncValue.data(list);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> create(InspirationItem item) async {
    await _api.post('/api/inspiration', data: item.toJson());
    await load();
  }

  Future<void> delete(String id) async {
    await _api.delete('/api/inspiration/$id');
    await load();
  }
}

enum InspirationFilter { all, flowers, decor, fashion, food, venues, other }

class InspirationScreen extends ConsumerStatefulWidget {
  const InspirationScreen({super.key});

  @override
  ConsumerState<InspirationScreen> createState() => _InspirationScreenState();
}

class _InspirationScreenState extends ConsumerState<InspirationScreen> {
  InspirationFilter _filter = InspirationFilter.all;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(inspirationProvider.notifier).load());
  }

  List<InspirationItem> _filtered(List<InspirationItem> items) {
    if (_filter == InspirationFilter.all) return items;
    final categoryMap = {
      InspirationFilter.flowers: 'Flowers',
      InspirationFilter.decor: 'Decor',
      InspirationFilter.fashion: 'Fashion',
      InspirationFilter.food: 'Food',
      InspirationFilter.venues: 'Venues',
      InspirationFilter.other: 'Other',
    };
    final target = categoryMap[_filter]!;
    return items.where((i) => i.category?.toLowerCase() == target.toLowerCase()).toList();
  }

  @override
  Widget build(BuildContext context) {
    final inspirationAsync = ref.watch(inspirationProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Inspiration', style: TextStyle(fontWeight: FontWeight.w600)),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 52,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: InspirationFilter.values.map((f) {
                final selected = _filter == f;
                final label = f.name[0].toUpperCase() + f.name.substring(1);
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
            child: inspirationAsync.when(
              loading: () => const Center(child: CircularProgressIndicator(color: AtelierTheme.gold)),
              error: (e, _) => Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Failed to load inspiration', style: TextStyle(color: Theme.of(context).colorScheme.onSurface)),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () => ref.read(inspirationProvider.notifier).load(),
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
                        Icon(Icons.palette_outlined, size: 64, color: AtelierTheme.goldDark),
                        const SizedBox(height: 16),
                        Text('No inspiration yet', style: TextStyle(color: Theme.of(context).colorScheme.onSurface, fontSize: 16)),
                      ],
                    ),
                  );
                }
                return RefreshIndicator(
                  color: AtelierTheme.gold,
                  onRefresh: () => ref.read(inspirationProvider.notifier).load(),
                  child: GridView.builder(
                    padding: const EdgeInsets.all(12),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 0.7,
                    ),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final item = filtered[index];
                      return GestureDetector(
                        onTap: () => _showDetail(item),
                        onLongPress: () async {
                          final confirm = await showDialog<bool>(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              backgroundColor: Theme.of(context).colorScheme.surface,
                              title: const Text('Delete Item'),
                              content: Text('Remove "${item.title ?? 'Untitled'}" from board?'),
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
                            ref.read(inspirationProvider.notifier).delete(item.id);
                          }
                        },
                        child: Card(
                          clipBehavior: Clip.antiAlias,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Stack(
                                  fit: StackFit.expand,
                                  children: [
                                    Image.network(
                                      item.imageUrl,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => Container(
                                        color: AtelierTheme.ivoryDark,
                                        child: const Icon(Icons.image_not_supported_outlined, color: AtelierTheme.goldDark),
                                      ),
                                    ),
                                    if (item.category != null)
                                      Positioned(
                                        top: 8,
                                        left: 8,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: AtelierTheme.gold,
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            item.category!,
                                            style: const TextStyle(
                                              color: AtelierTheme.espresso,
                                              fontSize: 10,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              if (item.title != null || (item.tags != null && item.tags!.isNotEmpty))
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(10),
                                  color: Theme.of(context).colorScheme.surface,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      if (item.title != null)
                                        Text(
                                          item.title!,
                                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      if (item.tags != null && item.tags!.isNotEmpty) ...[
                                        const SizedBox(height: 4),
                                        Wrap(
                                          spacing: 4,
                                          runSpacing: 4,
                                          children: item.tags!.take(3).map((tag) {
                                            return Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: AtelierTheme.gold.withOpacity(0.15),
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: Text(
                                                tag,
                                                style: const TextStyle(fontSize: 10, color: AtelierTheme.goldDark),
                                              ),
                                            );
                                          }).toList(),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                            ],
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
        onPressed: () => _showAddForm(),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showDetail(InspirationItem item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        expand: false,
        builder: (ctx, scrollCtrl) => SingleChildScrollView(
          controller: scrollCtrl,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AtelierTheme.goldDark.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Image.network(
                item.imageUrl,
                width: double.infinity,
                height: 300,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 300,
                  color: AtelierTheme.ivoryDark,
                  child: const Icon(Icons.image_not_supported_outlined, size: 48, color: AtelierTheme.goldDark),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (item.category != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AtelierTheme.gold.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          item.category!,
                          style: const TextStyle(color: AtelierTheme.goldDark, fontWeight: FontWeight.w600, fontSize: 12),
                        ),
                      ),
                    if (item.title != null) ...[
                      const SizedBox(height: 12),
                      Text(item.title!, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w600)),
                    ],
                    if (item.description != null && item.description!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        item.description!,
                        style: TextStyle(fontSize: 15, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7)),
                      ),
                    ],
                    if (item.tags != null && item.tags!.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: item.tags!.map((tag) {
                          return Chip(
                            label: Text(tag, style: const TextStyle(fontSize: 12)),
                            backgroundColor: AtelierTheme.gold.withOpacity(0.1),
                            side: const BorderSide(color: AtelierTheme.goldDark),
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          );
                        }).toList(),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAddForm() {
    final titleCtrl = TextEditingController();
    final tagsCtrl = TextEditingController();
    String? category;
    XFile? pickedImage;

    final categories = ['Flowers', 'Decor', 'Fashion', 'Food', 'Venues', 'Other'];

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
                const Text('Add Inspiration', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
                const SizedBox(height: 20),
                GestureDetector(
                  onTap: () async {
                    final picker = ImagePicker();
                    final source = await showModalBottomSheet<ImageSource>(
                      context: ctx,
                      builder: (ctx) => SafeArea(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            ListTile(
                              leading: const Icon(Icons.camera_alt),
                              title: const Text('Camera'),
                              onTap: () => Navigator.pop(ctx, ImageSource.camera),
                            ),
                            ListTile(
                              leading: const Icon(Icons.photo_library),
                              title: const Text('Gallery'),
                              onTap: () => Navigator.pop(ctx, ImageSource.gallery),
                            ),
                          ],
                        ),
                      ),
                    );
                    if (source != null) {
                      final file = await picker.pickImage(source: source);
                      if (file != null) {
                        setSheetState(() => pickedImage = file);
                      }
                    }
                  },
                  child: Container(
                    width: double.infinity,
                    height: 160,
                    decoration: BoxDecoration(
                      color: Theme.of(ctx).colorScheme.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AtelierTheme.goldDark, width: 1.5),
                    ),
                    child: pickedImage != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.file(File(pickedImage!.path), fit: BoxFit.cover),
                          )
                        : Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.add_a_photo_outlined, size: 36, color: AtelierTheme.goldDark),
                              const SizedBox(height: 8),
                              Text('Tap to add image', style: TextStyle(color: AtelierTheme.goldDark, fontSize: 14)),
                            ],
                          ),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(labelText: 'Title'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: category,
                  hint: const Text('Category'),
                  items: categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                  onChanged: (v) => setSheetState(() => category = v),
                  decoration: const InputDecoration(labelText: 'Category'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: tagsCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Tags',
                    hintText: 'Comma separated',
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (pickedImage == null) return;
                      final tags = tagsCtrl.text.split(',').map((t) => t.trim()).where((t) => t.isNotEmpty).toList();
                      final item = InspirationItem(
                        id: '',
                        tenantId: '',
                        imageUrl: pickedImage!.path,
                        title: titleCtrl.text.trim().isEmpty ? null : titleCtrl.text.trim(),
                        category: category,
                        tags: tags.isEmpty ? null : tags,
                      );
                      await ref.read(inspirationProvider.notifier).create(item);
                      if (ctx.mounted) Navigator.pop(ctx);
                    },
                    child: const Text('Add'),
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
