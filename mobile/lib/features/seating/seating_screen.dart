import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../services/api_client.dart';
import '../../models/seating_table.dart';
import '../../models/guest.dart';

final tablesProvider =
    FutureProvider.autoDispose<List<SeatingTable>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('/api/seating/tables');
    if (response.statusCode == 200 && response.data != null) {
      return SeatingTable.fromJsonList(response.data as List<dynamic>);
    }
  } catch (_) {}
  return [];
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

class SeatingScreen extends ConsumerStatefulWidget {
  const SeatingScreen({super.key});

  @override
  ConsumerState<SeatingScreen> createState() => _SeatingScreenState();
}

class _SeatingScreenState extends ConsumerState<SeatingScreen> {
  double _scale = 1.0;
  Offset _offset = Offset.zero;
  SeatingTable? _selectedTable;
  bool _saving = false;

  @override
  Widget build(BuildContext context) {
    final tablesAsync = ref.watch(tablesProvider);
    final guestsAsync = ref.watch(guestListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Seating Chart'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showAddTableSheet(),
          ),
        ],
      ),
      body: tablesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Failed to load')),
        data: (tables) => guestsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => const Center(child: Text('Failed to load')),
          data: (guests) => Column(
            children: [
              Expanded(
                child: GestureDetector(
                  onScaleStart: (details) {},
                  onScaleUpdate: (details) {
                    setState(() {
                      _scale = (_scale * details.scale).clamp(0.5, 3.0);
                      _offset += details.focalPointDelta;
                    });
                  },
                  child: Container(
                    color: AtelierTheme.ivoryDark,
                    child: CustomPaint(
                      size: Size.infinite,
                      painter: _SeatingCanvasPainter(
                        tables: tables,
                        guests: guests,
                        scale: _scale,
                        offset: _offset,
                        selectedTable: _selectedTable,
                      ),
                    ),
                  ),
                ),
              ),
              if (_selectedTable != null) _buildSelectedTableInfo(_selectedTable!, guests),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  border: Border(
                    top: BorderSide(color: AtelierTheme.gold.withOpacity(0.2)),
                  ),
                ),
                child: Row(
                  children: [
                    Text(
                      '${tables.length} tables',
                      style: TextStyle(color: AtelierTheme.goldDark, fontSize: 13),
                    ),
                    const Spacer(),
                    SizedBox(
                      height: 40,
                      child: ElevatedButton(
                        onPressed: _saving ? null : _saveLayout,
                        child: _saving
                            ? const SizedBox(
                                height: 16,
                                width: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Text('Save'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSelectedTableInfo(SeatingTable table, List<Guest> guests) {
    final assignedGuests = guests.where((g) => g.tableId == table.id).toList();
    final remaining = table.capacity - assignedGuests.length;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          top: BorderSide(color: AtelierTheme.gold.withOpacity(0.2)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                table.name,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AtelierTheme.gold.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${assignedGuests.length}/${table.capacity}',
                  style: TextStyle(
                    fontSize: 12,
                    color: AtelierTheme.goldDark,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const Spacer(),
              IconButton(
                icon: Icon(Icons.person_add, color: AtelierTheme.gold),
                onPressed: () => _showAssignGuestsSheet(table, guests),
              ),
              IconButton(
                icon: Icon(Icons.delete_outline, color: Colors.red[300]),
                onPressed: () => _confirmDeleteTable(table),
              ),
            ],
          ),
          if (remaining <= 0)
            Text(
              'Table is full',
              style: TextStyle(color: Colors.orange, fontSize: 12),
            )
          else
            Text(
              '$remaining seats remaining',
              style: TextStyle(color: AtelierTheme.goldDark, fontSize: 12),
            ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: assignedGuests
                .map((g) => Chip(
                      label: Text(g.name, style: const TextStyle(fontSize: 12)),
                      backgroundColor: AtelierTheme.gold.withOpacity(0.1),
                      deleteIcon: const Icon(Icons.close, size: 14),
                      onDeleted: () => _unassignGuest(g),
                    ))
                .toList(),
          ),
        ],
      ),
    );
  }

  void _showAddTableSheet() {
    final nameController = TextEditingController();
    final capacityController = TextEditingController(text: '8');
    String shape = 'round';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Add Table',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: nameController,
                  decoration:
                      const InputDecoration(hintText: 'Table name'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: capacityController,
                  decoration:
                      const InputDecoration(hintText: 'Capacity'),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 16),
                Text(
                  'Shape',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _buildShapeOption('round', Icons.circle_outlined, shape, (v) {
                      setSheetState(() => shape = v);
                    }),
                    const SizedBox(width: 12),
                    _buildShapeOption('rectangle', Icons.crop_square, shape, (v) {
                      setSheetState(() => shape = v);
                    }),
                    const SizedBox(width: 12),
                    _buildShapeOption('square', Icons.stop, shape, (v) {
                      setSheetState(() => shape = v);
                    }),
                  ],
                ),
                const SizedBox(height: 20),
                SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () => _addTable(
                      nameController.text,
                      int.tryParse(capacityController.text) ?? 8,
                      shape,
                    ),
                    child: const Text('Add Table'),
                  ),
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildShapeOption(
      String value, IconData icon, String current, ValueChanged<String> onTap) {
    final selected = current == value;
    return GestureDetector(
      onTap: () => onTap(value),
      child: Container(
        width: 64,
        height: 64,
        decoration: BoxDecoration(
          color: selected
              ? AtelierTheme.gold.withOpacity(0.1)
              : AtelierTheme.ivoryDark,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? AtelierTheme.gold : Colors.transparent,
            width: 2,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: selected ? AtelierTheme.gold : Colors.grey),
            const SizedBox(height: 4),
            Text(
              value[0].toUpperCase() + value.substring(1),
              style: TextStyle(
                fontSize: 10,
                color: selected ? AtelierTheme.gold : Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAssignGuestsSheet(SeatingTable table, List<Guest> allGuests) {
    final assigned = allGuests.where((g) => g.tableId == table.id).toList();
    final assignedIds = assigned.map((g) => g.id).toSet();
    final available =
        allGuests.where((g) => !assignedIds.contains(g.id)).toList();
    final selectedIds = <String>{};

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
          height: MediaQuery.of(context).size.height * 0.7,
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
                        'Assign to ${table.name}',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ),
                    TextButton(
                      onPressed: selectedIds.isEmpty
                          ? null
                          : () {
                              _assignGuests(table, selectedIds.toList());
                              Navigator.pop(context);
                            },
                      child: Text(
                        'Add (${selectedIds.length})',
                        style: TextStyle(
                          color: selectedIds.isEmpty
                              ? Colors.grey
                              : AtelierTheme.gold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(),
              Expanded(
                child: available.isEmpty
                    ? Center(
                        child: Text(
                          'All guests are seated',
                          style: TextStyle(color: AtelierTheme.goldDark),
                        ),
                      )
                    : ListView.builder(
                        itemCount: available.length,
                        itemBuilder: (context, index) {
                          final guest = available[index];
                          return CheckboxListTile(
                            value: selectedIds.contains(guest.id),
                            onChanged: (v) {
                              setSheetState(() {
                                if (v == true) {
                                  selectedIds.add(guest.id);
                                } else {
                                  selectedIds.remove(guest.id);
                                }
                              });
                            },
                            title: Text(guest.name),
                            subtitle: Text(guest.rsvpStatus),
                            activeColor: AtelierTheme.gold,
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _addTable(String name, int capacity, String shape) async {
    if (name.isEmpty) return;
    final api = ref.read(apiClientProvider);
    try {
      await api.post('/api/seating/tables', data: {
        'name': name,
        'capacity': capacity,
        'shape': shape,
        'x': Random().nextDouble() * 200,
        'y': Random().nextDouble() * 200,
      });
      ref.invalidate(tablesProvider);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Table added')),
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

  Future<void> _assignGuests(
      SeatingTable table, List<String> guestIds) async {
    final api = ref.read(apiClientProvider);
    try {
      for (final guestId in guestIds) {
        await api.put('/api/guests/$guestId', data: {
          'tableId': table.id,
        });
      }
      ref.invalidate(guestListProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${guestIds.length} guest(s) assigned')),
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

  Future<void> _unassignGuest(Guest guest) async {
    final api = ref.read(apiClientProvider);
    try {
      await api.put('/api/guests/${guest.id}', data: {
        'tableId': null,
      });
      ref.invalidate(guestListProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  void _confirmDeleteTable(SeatingTable table) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Table'),
        content: Text(
            'Remove "${table.name}"? Assigned guests will be unseated.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _deleteTable(table);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteTable(SeatingTable table) async {
    final api = ref.read(apiClientProvider);
    try {
      await api.delete('/api/seating/tables/${table.id}');
      ref.invalidate(tablesProvider);
      setState(() => _selectedTable = null);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Table deleted')),
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

  Future<void> _saveLayout() async {
    setState(() => _saving = true);
    final api = ref.read(apiClientProvider);
    final tables = ref.read(tablesProvider).valueOrNull ?? [];
    try {
      for (final table in tables) {
        await api.put('/api/seating/tables/${table.id}', data: {
          'x': table.x,
          'y': table.y,
        });
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Layout saved')),
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
}

class _SeatingCanvasPainter extends CustomPainter {
  final List<SeatingTable> tables;
  final List<Guest> guests;
  final double scale;
  final Offset offset;
  final SeatingTable? selectedTable;

  _SeatingCanvasPainter({
    required this.tables,
    required this.guests,
    required this.scale,
    required this.offset,
    this.selectedTable,
  });

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.translate(offset.dx, offset.dy);
    canvas.scale(scale);

    final gridPaint = Paint()
      ..color = AtelierTheme.gold.withOpacity(0.08)
      ..strokeWidth = 0.5;

    for (double x = 0; x < size.width * 3; x += 40) {
      canvas.drawLine(Offset(x, -size.height), Offset(x, size.height * 3), gridPaint);
    }
    for (double y = 0; y < size.height * 3; y += 40) {
      canvas.drawLine(Offset(-size.width, y), Offset(size.width * 3, y), gridPaint);
    }

    for (final table in tables) {
      final assignedCount = guests.where((g) => g.tableId == table.id).length;
      final isFull = assignedCount >= table.capacity;
      final isSelected = selectedTable?.id == table.id;

      final fillPaint = Paint()
        ..color = isSelected
            ? AtelierTheme.gold.withOpacity(0.4)
            : isFull
                ? AtelierTheme.goldDark.withOpacity(0.3)
                : AtelierTheme.gold.withOpacity(0.15);

      final borderPaint = Paint()
        ..color = isSelected ? AtelierTheme.gold : AtelierTheme.goldDark.withOpacity(0.4)
        ..style = PaintingStyle.stroke
        ..strokeWidth = isSelected ? 3 : 1.5;

      final center = Offset(table.x, table.y);

      if (table.shape == 'round') {
        canvas.drawCircle(center, 40, fillPaint);
        canvas.drawCircle(center, 40, borderPaint);
      } else {
        final rect = Rect.fromCenter(center: center, width: 70, height: 50);
        canvas.drawRRect(
          RRect.fromRectAndRadius(rect, const Radius.circular(8)),
          fillPaint,
        );
        canvas.drawRRect(
          RRect.fromRectAndRadius(rect, const Radius.circular(8)),
          borderPaint,
        );
      }

      final namePainter = TextPainter(
        text: TextSpan(
          text: table.name,
          style: TextStyle(
            color: AtelierTheme.espresso,
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      namePainter.paint(
        canvas,
        Offset(center.dx - namePainter.width / 2, center.dy - 12),
      );

      final countPainter = TextPainter(
        text: TextSpan(
          text: '$assignedCount/${table.capacity}',
          style: TextStyle(
            color: AtelierTheme.goldDark,
            fontSize: 10,
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      countPainter.paint(
        canvas,
        Offset(center.dx - countPainter.width / 2, center.dy + 4),
      );
    }

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _SeatingCanvasPainter oldDelegate) {
    return oldDelegate.scale != scale ||
        oldDelegate.offset != offset ||
        oldDelegate.selectedTable != selectedTable ||
        oldDelegate.tables.length != tables.length;
  }
}
