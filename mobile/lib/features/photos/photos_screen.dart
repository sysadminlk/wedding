import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import '../../config/theme.dart';
import '../../models/photo.dart';
import '../../services/api_client.dart';

final photosProvider = StateNotifierProvider<PhotosNotifier, AsyncValue<List<Photo>>>((ref) {
  return PhotosNotifier(ref.read(apiClientProvider));
});

class PhotosNotifier extends StateNotifier<AsyncValue<List<Photo>>> {
  final ApiClient _api;

  PhotosNotifier(this._api) : super(const AsyncValue.loading());

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.get('/api/photos');
      final list = Photo.fromJsonList(response.data as List<dynamic>);
      state = AsyncValue.data(list);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> upload(Photo photo) async {
    await _api.post('/api/photos', data: photo.toJson());
    await load();
  }
}

class PhotosScreen extends ConsumerStatefulWidget {
  const PhotosScreen({super.key});

  @override
  ConsumerState<PhotosScreen> createState() => _PhotosScreenState();
}

class _PhotosScreenState extends ConsumerState<PhotosScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(photosProvider.notifier).load());
  }

  @override
  Widget build(BuildContext context) {
    final photosAsync = ref.watch(photosProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Photos', style: TextStyle(fontWeight: FontWeight.w600)),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_photo_alternate_outlined),
            color: AtelierTheme.gold,
            onPressed: () => _showUploadSheet(),
          ),
        ],
      ),
      body: photosAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AtelierTheme.gold)),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Failed to load photos', style: TextStyle(color: Theme.of(context).colorScheme.onSurface)),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => ref.read(photosProvider.notifier).load(),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (photos) {
          if (photos.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.photo_library_outlined, size: 64, color: AtelierTheme.goldDark),
                  const SizedBox(height: 16),
                  Text('No photos yet', style: TextStyle(color: Theme.of(context).colorScheme.onSurface, fontSize: 16)),
                  const SizedBox(height: 8),
                  Text(
                    'Start building your wedding gallery',
                    style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5), fontSize: 14),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _showUploadSheet(),
                    icon: const Icon(Icons.upload),
                    label: const Text('Upload Photo'),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            color: AtelierTheme.gold,
            onRefresh: () => ref.read(photosProvider.notifier).load(),
            child: GridView.builder(
              padding: const EdgeInsets.all(8),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                mainAxisSpacing: 6,
                crossAxisSpacing: 6,
              ),
              itemCount: photos.length,
              itemBuilder: (context, index) {
                final photo = photos[index];
                return GestureDetector(
                  onTap: () => _showFullScreen(photo),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.network(
                          photo.thumbnailUrl ?? photo.url,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: AtelierTheme.ivoryDark,
                            child: const Icon(Icons.broken_image_outlined, color: AtelierTheme.goldDark),
                          ),
                        ),
                        if (photo.caption != null && photo.caption!.isNotEmpty)
                          Positioned(
                            bottom: 0,
                            left: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.bottomCenter,
                                  end: Alignment.topCenter,
                                  colors: [Colors.black.withOpacity(0.7), Colors.transparent],
                                ),
                              ),
                              child: Text(
                                photo.caption!,
                                style: const TextStyle(color: Colors.white, fontSize: 10),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
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
    );
  }

  void _showFullScreen(Photo photo) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => _FullScreenPhotoView(photo: photo),
      ),
    );
  }

  void _showUploadSheet() {
    final captionCtrl = TextEditingController();
    XFile? pickedImage;

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
                const Text('Upload Photo', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
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
                    height: 200,
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
                              Icon(Icons.add_a_photo_outlined, size: 40, color: AtelierTheme.goldDark),
                              const SizedBox(height: 8),
                              Text('Tap to select photo', style: TextStyle(color: AtelierTheme.goldDark, fontSize: 14)),
                            ],
                          ),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: captionCtrl,
                  decoration: const InputDecoration(labelText: 'Caption'),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (pickedImage == null) return;
                      final photo = Photo(
                        id: '',
                        tenantId: '',
                        url: pickedImage!.path,
                        caption: captionCtrl.text.trim().isEmpty ? null : captionCtrl.text.trim(),
                      );
                      await ref.read(photosProvider.notifier).upload(photo);
                      if (ctx.mounted) Navigator.pop(ctx);
                    },
                    child: const Text('Upload'),
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

class _FullScreenPhotoView extends StatelessWidget {
  final Photo photo;

  const _FullScreenPhotoView({required this.photo});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(
          photo.caption ?? '',
          style: const TextStyle(fontSize: 16),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: Center(
              child: InteractiveViewer(
                minScale: 0.5,
                maxScale: 4.0,
                child: Image.network(
                  photo.url,
                  fit: BoxFit.contain,
                  errorBuilder: (_, __, ___) => const Icon(Icons.broken_image, color: Colors.white54, size: 64),
                ),
              ),
            ),
          ),
          if (photo.uploadedAt != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              color: Colors.black,
              child: Text(
                DateFormat('MMM d, yyyy h:mm a').format(photo.uploadedAt!),
                style: const TextStyle(color: Colors.white54, fontSize: 13),
                textAlign: TextAlign.center,
              ),
            ),
        ],
      ),
    );
  }
}
