import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../config/theme.dart';
import '../../models/guest_memory.dart';
import '../../services/api_client.dart';

final memoriesProvider = StateNotifierProvider<MemoriesNotifier, AsyncValue<List<GuestMemory>>>((ref) {
  return MemoriesNotifier(ref.read(apiClientProvider));
});

class MemoriesNotifier extends StateNotifier<AsyncValue<List<GuestMemory>>> {
  final ApiClient _api;

  MemoriesNotifier(this._api) : super(const AsyncValue.loading());

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.get('/api/memories');
      final list = GuestMemory.fromJsonList(response.data as List<dynamic>);
      state = AsyncValue.data(list);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

class MemoriesScreen extends ConsumerStatefulWidget {
  const MemoriesScreen({super.key});

  @override
  ConsumerState<MemoriesScreen> createState() => _MemoriesScreenState();
}

class _MemoriesScreenState extends ConsumerState<MemoriesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(memoriesProvider.notifier).load());
  }

  IconData _typeIcon(String type) {
    switch (type) {
      case 'video':
        return Icons.videocam;
      case 'voice':
        return Icons.mic;
      case 'photo':
        return Icons.photo_camera;
      case 'text':
        return Icons.message;
      default:
        return Icons.memory;
    }
  }

  Color _typeColor(String type) {
    switch (type) {
      case 'video':
        return const Color(0xFF7986CB);
      case 'voice':
        return const Color(0xFF81C784);
      case 'photo':
        return AtelierTheme.gold;
      case 'text':
        return const Color(0xFFE57373);
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final memoriesAsync = ref.watch(memoriesProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Guest Memories', style: TextStyle(fontWeight: FontWeight.w600)),
      ),
      body: memoriesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AtelierTheme.gold)),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Failed to load memories', style: TextStyle(color: Theme.of(context).colorScheme.onSurface)),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => ref.read(memoriesProvider.notifier).load(),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (memories) {
          if (memories.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.auto_awesome, size: 64, color: AtelierTheme.goldDark),
                  const SizedBox(height: 16),
                  Text('No memories yet', style: TextStyle(color: Theme.of(context).colorScheme.onSurface, fontSize: 16)),
                  const SizedBox(height: 8),
                  Text(
                    'Guests can share photos, videos, and messages',
                    style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5), fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            color: AtelierTheme.gold,
            onRefresh: () => ref.read(memoriesProvider.notifier).load(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: memories.length,
              itemBuilder: (context, index) {
                final memory = memories[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () => _showMemory(memory),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          memory.thumbnailUrl != null
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: Image.network(
                                    memory.thumbnailUrl!,
                                    width: 64,
                                    height: 64,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => _placeholderAvatar(memory.type),
                                  ),
                                )
                              : _placeholderAvatar(memory.type),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        memory.guestName,
                                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: _typeColor(memory.type).withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(_typeIcon(memory.type), size: 12, color: _typeColor(memory.type)),
                                          const SizedBox(width: 4),
                                          Text(
                                            memory.type,
                                            style: TextStyle(
                                              color: _typeColor(memory.type),
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                if (memory.content != null && memory.content!.isNotEmpty) ...[
                                  const SizedBox(height: 6),
                                  Text(
                                    memory.content!,
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                                if (memory.createdAt != null) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    DateFormat('MMM d, yyyy h:mm a').format(memory.createdAt!),
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: Theme.of(context).colorScheme.onSurface.withOpacity(0.4),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                          Icon(
                            Icons.chevron_right,
                            color: Theme.of(context).colorScheme.onSurface.withOpacity(0.3),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _placeholderAvatar(String type) {
    return Container(
      width: 64,
      height: 64,
      decoration: BoxDecoration(
        color: _typeColor(type).withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(_typeIcon(type), color: _typeColor(type), size: 28),
    );
  }

  void _showMemory(GuestMemory memory) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        minChildSize: 0.4,
        expand: false,
        builder: (ctx, scrollCtrl) => SingleChildScrollView(
          controller: scrollCtrl,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AtelierTheme.goldDark.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _typeColor(memory.type).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(_typeIcon(memory.type), size: 14, color: _typeColor(memory.type)),
                          const SizedBox(width: 4),
                          Text(
                            memory.type.toUpperCase(),
                            style: TextStyle(
                              color: _typeColor(memory.type),
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(memory.guestName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w600)),
                if (memory.createdAt != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    DateFormat('MMMM d, yyyy h:mm a').format(memory.createdAt!),
                    style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5)),
                  ),
                ],
                const SizedBox(height: 20),
                if (memory.type == 'text' && memory.content != null)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AtelierTheme.ivoryDark,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      memory.content!,
                      style: const TextStyle(fontSize: 16, height: 1.5),
                    ),
                  )
                else if (memory.type == 'photo' && memory.fileUrl != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      memory.fileUrl!,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        height: 200,
                        color: AtelierTheme.ivoryDark,
                        child: const Icon(Icons.image_not_supported, color: AtelierTheme.goldDark, size: 48),
                      ),
                    ),
                  )
                else if (memory.type == 'video' || memory.type == 'voice')
                  Container(
                    width: double.infinity,
                    height: 120,
                    decoration: BoxDecoration(
                      color: _typeColor(memory.type).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: _typeColor(memory.type).withOpacity(0.3)),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(_typeIcon(memory.type), size: 40, color: _typeColor(memory.type)),
                        const SizedBox(height: 8),
                        Text(
                          memory.type == 'video' ? 'Video Message' : 'Voice Message',
                          style: TextStyle(color: _typeColor(memory.type), fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  )
                else if (memory.content != null && memory.content!.isNotEmpty)
                  Text(memory.content!, style: const TextStyle(fontSize: 15, height: 1.5)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
