import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../config/theme.dart';
import '../../services/api_client.dart';
import '../../models/website_config.dart';

class ScheduleEvent {
  String title;
  String time;

  ScheduleEvent({this.title = '', this.time = ''});
}

final websiteConfigProvider =
    FutureProvider.autoDispose<WebsiteConfig?>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('/api/website/config');
    if (response.statusCode == 200 && response.data != null) {
      return WebsiteConfig.fromJson(response.data as Map<String, dynamic>);
    }
  } catch (_) {}
  return null;
});

class WebsiteEditorScreen extends ConsumerStatefulWidget {
  const WebsiteEditorScreen({super.key});

  @override
  ConsumerState<WebsiteEditorScreen> createState() =>
      _WebsiteEditorScreenState();
}

class _WebsiteEditorScreenState extends ConsumerState<WebsiteEditorScreen> {
  String _selectedTheme = 'classic';
  final _heroTitleController = TextEditingController();
  final _heroSubtitleController = TextEditingController();
  final _loveStoryController = TextEditingController();
  final List<ScheduleEvent> _events = [];
  String? _heroImagePath;
  bool _saving = false;

  final _themes = const [
    {'id': 'classic', 'name': 'Classic', 'primary': Color(0xFF8B7355), 'secondary': Color(0xFFF5F0EB)},
    {'id': 'modern', 'name': 'Modern', 'primary': Color(0xFF2C2C2C), 'secondary': Color(0xFFE8E8E8)},
    {'id': 'rustic', 'name': 'Rustic', 'primary': Color(0xFF8B6914), 'secondary': Color(0xFFFAF0E6)},
    {'id': 'beach', 'name': 'Beach', 'primary': Color(0xFF5B9BD5), 'secondary': Color(0xFFF0F8FF)},
    {'id': 'garden', 'name': 'Garden', 'primary': Color(0xFF6B8E23), 'secondary': Color(0xFFF0FFF0)},
    {'id': 'royal', 'name': 'Royal', 'primary': Color(0xFF6A0DAD), 'secondary': Color(0xFFF8F0FF)},
  ];

  @override
  void initState() {
    super.initState();
    _loadConfig();
  }

  Future<void> _loadConfig() async {
    final config = await ref.read(websiteConfigProvider.future);
    if (config != null && mounted) {
      setState(() {
        _selectedTheme = config.theme ?? 'classic';
        _heroTitleController.text = config.heroTitle ?? '';
        _heroSubtitleController.text = config.heroSubtitle ?? '';
        _loveStoryController.text = config.loveStory ?? '';
        _heroImagePath = config.heroImage;
      });
    }
  }

  @override
  void dispose() {
    _heroTitleController.dispose();
    _heroSubtitleController.dispose();
    _loveStoryController.dispose();
    super.dispose();
  }

  Future<void> _pickHeroImage() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() => _heroImagePath = image.path);
    }
  }

  void _addEvent() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        final titleController = TextEditingController();
        final timeController = TextEditingController();
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Add Event',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(hintText: 'Event title'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: timeController,
                  decoration: const InputDecoration(hintText: 'Time (e.g. 2:00 PM)'),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    if (titleController.text.isNotEmpty) {
                      setState(() {
                        _events.add(ScheduleEvent(
                          title: titleController.text,
                          time: timeController.text,
                        ));
                      });
                      Navigator.pop(context);
                    }
                  },
                  child: const Text('Add'),
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        );
      },
    );
  }

  void _removeEvent(int index) {
    setState(() => _events.removeAt(index));
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    final api = ref.read(apiClientProvider);
    try {
      final data = {
        'theme': _selectedTheme,
        'heroTitle': _heroTitleController.text,
        'heroSubtitle': _heroSubtitleController.text,
        'loveStory': _loveStoryController.text,
        'schedule': _events
            .map((e) => {'title': e.title, 'time': e.time})
            .toList(),
      };
      await api.put('/api/website/config', data: data);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Website saved')),
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
    final theme = Theme.of(context);
    final asyncConfig = ref.watch(websiteConfigProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Public Website'),
        actions: [
          IconButton(
            icon: const Icon(Icons.visibility),
            onPressed: _showPreview,
          ),
        ],
      ),
      body: asyncConfig.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Failed to load')),
        data: (_) => RefreshIndicator(
          onRefresh: _loadConfig,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildSectionTitle('Theme'),
              const SizedBox(height: 8),
              _buildThemeGrid(),
              const SizedBox(height: 24),
              _buildSectionTitle('Hero Section'),
              const SizedBox(height: 8),
              _buildHeroImagePicker(theme),
              const SizedBox(height: 12),
              TextField(
                controller: _heroTitleController,
                decoration: const InputDecoration(hintText: 'Hero title'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _heroSubtitleController,
                decoration: const InputDecoration(hintText: 'Hero subtitle'),
              ),
              const SizedBox(height: 24),
              _buildSectionTitle('Love Story'),
              const SizedBox(height: 8),
              TextField(
                controller: _loveStoryController,
                maxLines: 5,
                decoration: const InputDecoration(
                  hintText: 'Tell your love story...',
                ),
              ),
              const SizedBox(height: 24),
              _buildSectionTitle('Wedding Schedule'),
              const SizedBox(height: 8),
              ..._events.asMap().entries.map((entry) => _buildEventTile(entry.key, entry.value)),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: _addEvent,
                icon: const Icon(Icons.add),
                label: const Text('Add Event'),
              ),
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

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildThemeGrid() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        childAspectRatio: 1,
      ),
      itemCount: _themes.length,
      itemBuilder: (context, index) {
        final t = _themes[index];
        final selected = _selectedTheme == t['id'];
        return GestureDetector(
          onTap: () => setState(() => _selectedTheme = t['id'] as String),
          child: Container(
            decoration: BoxDecoration(
              color: t['secondary'] as Color,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: selected ? AtelierTheme.gold : Colors.transparent,
                width: 2.5,
              ),
              boxShadow: selected
                  ? [BoxShadow(color: AtelierTheme.gold.withOpacity(0.3), blurRadius: 8, spreadRadius: 1)]
                  : null,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: t['primary'] as Color,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  t['name'] as String,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: t['primary'] as Color,
                  ),
                ),
                if (selected)
                  Icon(Icons.check_circle, size: 14, color: AtelierTheme.gold),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildHeroImagePicker(ThemeData theme) {
    return GestureDetector(
      onTap: _pickHeroImage,
      child: Container(
        height: 160,
        width: double.infinity,
        decoration: BoxDecoration(
          color: AtelierTheme.ivoryDark,
          borderRadius: BorderRadius.circular(12),
          image: _heroImagePath != null && !(_heroImagePath!.startsWith('http'))
              ? DecorationImage(
                  image: FileImage(File(_heroImagePath!)),
                  fit: BoxFit.cover,
                )
              : null,
        ),
        child: _heroImagePath == null
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.add_photo_alternate_outlined,
                      size: 40, color: AtelierTheme.gold),
                  const SizedBox(height: 8),
                  Text(
                    'Tap to add hero image',
                    style: TextStyle(color: AtelierTheme.goldDark),
                  ),
                ],
              )
            : Align(
                alignment: Alignment.topRight,
                child: Container(
                  margin: const EdgeInsets.all(8),
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(Icons.edit, size: 16, color: Colors.white),
                ),
              ),
      ),
    );
  }

  Widget _buildEventTile(int index, ScheduleEvent event) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AtelierTheme.gold.withOpacity(0.2),
          child: Text(
            '${index + 1}',
            style: TextStyle(color: AtelierTheme.goldDark, fontWeight: FontWeight.bold),
          ),
        ),
        title: Text(event.title.isEmpty ? 'Untitled' : event.title),
        subtitle: Text(event.time.isEmpty ? 'No time set' : event.time),
        trailing: IconButton(
          icon: Icon(Icons.delete_outline, color: Colors.red[300]),
          onPressed: () => _removeEvent(index),
        ),
      ),
    );
  }

  void _showPreview() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => Container(
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Text('Preview', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 16),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(16),
                  children: [
                    Container(
                      height: 220,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: AtelierTheme.ivoryDark,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: _heroImagePath != null && !_heroImagePath!.startsWith('http')
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.file(File(_heroImagePath!), fit: BoxFit.cover),
                            )
                          : Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.favorite, size: 48, color: AtelierTheme.gold),
                                const SizedBox(height: 12),
                                Text(
                                  _heroTitleController.text.isEmpty
                                      ? 'Your Names'
                                      : _heroTitleController.text,
                                  style: const TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  _heroSubtitleController.text.isEmpty
                                      ? 'Wedding Day'
                                      : _heroSubtitleController.text,
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: AtelierTheme.goldDark,
                                  ),
                                ),
                              ],
                            ),
                    ),
                    const SizedBox(height: 24),
                    if (_loveStoryController.text.isNotEmpty) ...[
                      Text(
                        'Our Story',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(_loveStoryController.text),
                      const SizedBox(height: 24),
                    ],
                    if (_events.isNotEmpty) ...[
                      Text(
                        'Schedule',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      ..._events.map((e) => ListTile(
                            leading: Icon(Icons.event, color: AtelierTheme.gold),
                            title: Text(e.title),
                            subtitle: Text(e.time),
                          )),
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
}
