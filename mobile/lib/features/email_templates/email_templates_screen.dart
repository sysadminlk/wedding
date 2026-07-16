import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../services/api_client.dart';
import '../../models/email_template.dart';

final templatesProvider =
    FutureProvider.autoDispose<List<EmailTemplate>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('/api/email-templates');
    if (response.statusCode == 200 && response.data != null) {
      return EmailTemplate.fromJsonList(response.data as List<dynamic>);
    }
  } catch (_) {}
  return [];
});

class EmailTemplatesScreen extends ConsumerStatefulWidget {
  const EmailTemplatesScreen({super.key});

  @override
  ConsumerState<EmailTemplatesScreen> createState() =>
      _EmailTemplatesScreenState();
}

class _EmailTemplatesScreenState extends ConsumerState<EmailTemplatesScreen> {
  static const _categories = [
    'Save the Date',
    'Invitation',
    'Reminder',
    'Thank You',
    'Custom',
  ];

  @override
  Widget build(BuildContext context) {
    final templatesAsync = ref.watch(templatesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Email Templates')),
      body: templatesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Failed to load')),
        data: (templates) => RefreshIndicator(
          onRefresh: () async => ref.invalidate(templatesProvider),
          child: templates.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.email_outlined,
                          size: 64, color: AtelierTheme.gold),
                      const SizedBox(height: 16),
                      Text(
                        'No templates yet',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Create your first email template',
                        style: TextStyle(color: AtelierTheme.goldDark),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: templates.length,
                  itemBuilder: (context, index) => _buildTemplateCard(templates[index]),
                ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openEditor(null),
        backgroundColor: AtelierTheme.gold,
        foregroundColor: AtelierTheme.espresso,
        icon: const Icon(Icons.add),
        label: const Text('New Template'),
      ),
    );
  }

  Widget _buildTemplateCard(EmailTemplate template) {
    final categoryColor = _categoryColor(template.category);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _openEditor(template),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      template.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  if (template.category != null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: categoryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        template.category!,
                        style: TextStyle(
                          fontSize: 11,
                          color: categoryColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                template.subject,
                style: TextStyle(color: AtelierTheme.goldDark),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.access_time, size: 14, color: Colors.grey[400]),
                  const SizedBox(width: 4),
                  Text(
                    template.lastUsedAt != null
                        ? _formatDate(template.lastUsedAt!)
                        : 'Never used',
                    style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                  ),
                  const Spacer(),
                  Icon(Icons.send, size: 14, color: Colors.grey[400]),
                  const SizedBox(width: 4),
                  Text(
                    '${template.useCount} sent',
                    style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _categoryColor(String? category) {
    switch (category) {
      case 'Save the Date':
        return Colors.teal;
      case 'Invitation':
        return AtelierTheme.gold;
      case 'Reminder':
        return Colors.orange;
      case 'Thank You':
        return Colors.pink;
      default:
        return Colors.grey;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _openEditor(EmailTemplate? template) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _TemplateEditor(
        template: template,
        categories: _categories,
        onSaved: () {
          ref.invalidate(templatesProvider);
          Navigator.pop(context);
        },
      ),
    );
  }
}

class _TemplateEditor extends ConsumerStatefulWidget {
  final EmailTemplate? template;
  final List<String> categories;
  final VoidCallback onSaved;

  const _TemplateEditor({
    required this.template,
    required this.categories,
    required this.onSaved,
  });

  @override
  ConsumerState<_TemplateEditor> createState() => _TemplateEditorState();
}

class _TemplateEditorState extends ConsumerState<_TemplateEditor> {
  late final TextEditingController _nameController;
  late final TextEditingController _subjectController;
  late final TextEditingController _contentController;
  String? _selectedCategory;
  bool _saving = false;

  final _availableVariables = const [
    '{guest_name}',
    '{wedding_date}',
    '{venue}',
    '{couple_names}',
    '{rsvp_link}',
    '{event_time}',
  ];

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.template?.name ?? '');
    _subjectController =
        TextEditingController(text: widget.template?.subject ?? '');
    _contentController =
        TextEditingController(text: widget.template?.htmlContent ?? '');
    _selectedCategory = widget.template?.category;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _subjectController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    final api = ref.read(apiClientProvider);
    try {
      final data = {
        'name': _nameController.text,
        'subject': _subjectController.text,
        'htmlContent': _contentController.text,
        'category': _selectedCategory,
      };
      if (widget.template != null) {
        await api.put('/api/email-templates/${widget.template!.id}', data: data);
      } else {
        await api.post('/api/email-templates', data: data);
      }
      widget.onSaved();
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

  Future<void> _sendTest() async {
    final emailController = TextEditingController();
    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Send Test Email'),
        content: TextField(
          controller: emailController,
          decoration: const InputDecoration(hintText: 'Email address'),
          keyboardType: TextInputType.emailAddress,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, emailController.text),
            child: const Text('Send'),
          ),
        ],
      ),
    );
    if (result != null && result.isNotEmpty) {
      final api = ref.read(apiClientProvider);
      try {
        await api.post('/api/email-templates/test', data: {
          'email': result,
          'subject': _subjectController.text,
          'htmlContent': _contentController.text,
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Test email sent')),
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

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius:
              const BorderRadius.vertical(top: Radius.circular(20)),
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
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      widget.template != null
                          ? 'Edit Template'
                          : 'New Template',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ),
                  TextButton(
                    onPressed: _sendTest,
                    child: const Text('Send Test'),
                  ),
                ],
              ),
            ),
            const Divider(),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  TextField(
                    controller: _nameController,
                    decoration:
                        const InputDecoration(hintText: 'Template name'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _selectedCategory,
                    hint: const Text('Category'),
                    items: widget.categories
                        .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                        .toList(),
                    onChanged: (v) => setState(() => _selectedCategory = v),
                    decoration: const InputDecoration(),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _subjectController,
                    decoration:
                        const InputDecoration(hintText: 'Email subject'),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Variables',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _availableVariables.map((v) {
                      return ActionChip(
                        label: Text(v, style: const TextStyle(fontSize: 12)),
                        backgroundColor: AtelierTheme.gold.withOpacity(0.1),
                        side: BorderSide(color: AtelierTheme.gold.withOpacity(0.3)),
                        onPressed: () {
                          _contentController.text += ' $v';
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Content',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _contentController,
                    maxLines: 10,
                    decoration: const InputDecoration(
                      hintText: 'HTML content...',
                    ),
                    style: const TextStyle(
                        fontFamily: 'monospace', fontSize: 13),
                  ),
                ],
              ),
            ),
            const Divider(),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
              child: SizedBox(
                height: 52,
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _saving ? null : _save,
                  child: _saving
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Save Template'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
