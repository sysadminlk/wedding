import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../widgets/app_scaffold.dart';

enum TaskPhase { twelvePlus, nineToTwelve, sixToNine, threeToSix, oneToThree, finalMonth, weddingDay }

class _Task {
  final String id;
  final String title;
  final String? description;
  final String category;
  final TaskPhase phase;
  final DateTime dueDate;
  final String? assignee;
  final bool completed;

  const _Task({
    required this.id,
    required this.title,
    this.description,
    required this.category,
    required this.phase,
    required this.dueDate,
    this.assignee,
    this.completed = false,
  });

  _Task copyWith({bool? completed}) {
    return _Task(
      id: id,
      title: title,
      description: description,
      category: category,
      phase: phase,
      dueDate: dueDate,
      assignee: assignee,
      completed: completed ?? this.completed,
    );
  }
}

final _tasksProvider = StateNotifierProvider<_TasksNotifier, List<_Task>>((ref) {
  return _TasksNotifier();
});

class _TasksNotifier extends StateNotifier<List<_Task>> {
  _TasksNotifier() : super(_mockTasks);

  void addTask(_Task task) {
    state = [...state, task];
  }

  void updateTask(String id, _Task updated) {
    state = state.map((t) => t.id == id ? updated : t).toList();
  }

  void toggleComplete(String id) {
    state = state.map((t) {
      if (t.id == id) return t.copyWith(completed: !t.completed);
      return t;
    }).toList();
  }

  void deleteTask(String id) {
    state = state.where((t) => t.id != id).toList();
  }
}

const _mockTasks = [
  _Task(id: '1', title: 'Book venue', category: 'Venue', phase: TaskPhase.twelvePlus, dueDate: _date(2026, 8, 15), completed: true),
  _Task(id: '2', title: 'Hire photographer', category: 'Vendors', phase: TaskPhase.twelvePlus, dueDate: _date(2026, 9, 1), completed: true),
  _Task(id: '3', title: 'Choose wedding party', category: 'Wedding Crew', phase: TaskPhase.nineToTwelve, dueDate: _date(2026, 10, 15)),
  _Task(id: '4', title: 'Book caterer', category: 'Vendors', phase: TaskPhase.nineToTwelve, dueDate: _date(2026, 11, 1)),
  _Task(id: '5', title: 'Order dress', category: 'Wedding Crew', phase: TaskPhase.sixToNine, dueDate: _date(2026, 12, 15)),
  _Task(id: '6', title: 'Book florist', category: 'Vendors', phase: TaskPhase.sixToNine, dueDate: _date(2027, 1, 1)),
  _Task(id: '7', title: 'Send save-the-dates', category: 'Guests', phase: TaskPhase.threeToSix, dueDate: _date(2027, 2, 15)),
  _Task(id: '8', title: 'Finalize guest list', category: 'Guests', phase: TaskPhase.threeToSix, dueDate: _date(2027, 3, 1)),
  _Task(id: '9', title: 'Menu tasting', category: 'Wedding Menu', phase: TaskPhase.oneToThree, dueDate: _date(2027, 4, 15)),
  _Task(id: '10', title: 'Order wedding bands', category: 'Wedding Crew', phase: TaskPhase.oneToThree, dueDate: _date(2027, 5, 1)),
  _Task(id: '11', title: 'Print programs', category: 'Vendors', phase: TaskPhase.finalMonth, dueDate: _date(2027, 6, 1)),
  _Task(id: '12', title: 'Final dress fitting', category: 'Wedding Crew', phase: TaskPhase.finalMonth, dueDate: _date(2027, 6, 10)),
  _Task(id: '13', title: 'Get married!', category: 'Wedding Crew', phase: TaskPhase.weddingDay, dueDate: _date(2027, 6, 20)),
];

DateTime _date(int year, int month, int day) => DateTime(year, month, day);

class ChecklistScreen extends ConsumerStatefulWidget {
  const ChecklistScreen({super.key});

  @override
  ConsumerState<ChecklistScreen> createState() => _ChecklistScreenState();
}

class _ChecklistScreenState extends ConsumerState<ChecklistScreen> {
  TaskPhase _selectedPhase = TaskPhase.twelvePlus;

  @override
  Widget build(BuildContext context) {
    final tasks = ref.watch(_tasksProvider);
    final filtered = tasks.where((t) => t.phase == _selectedPhase).toList();
    final total = tasks.length;
    final completed = tasks.where((t) => t.completed).length;

    return AppScaffold(
      title: 'Checklist',
      sectionKey: 'checklist',
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.delayed(const Duration(seconds: 1));
        },
        child: Column(
          children: [
            _buildProgressBar(context, completed, total),
            _buildPhaseTabs(context),
            Expanded(
              child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.check_circle_outline, size: 64, color: AtelierTheme.goldDark.withOpacity(0.5)),
                        const SizedBox(height: 16),
                        Text('No tasks in this phase', style: TextStyle(color: AtelierTheme.espresso.withOpacity(0.6))),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) => _buildTaskCard(context, filtered[index]),
                  ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddTaskSheet(context),
        backgroundColor: AtelierTheme.gold,
        foregroundColor: AtelierTheme.espresso,
        icon: const Icon(Icons.add),
        label: const Text('Add Task'),
      ),
    );
  }

  Widget _buildProgressBar(BuildContext context, int completed, int total) {
    final progress = total > 0 ? completed / total : 0.0;
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Progress',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    '$completed of $total tasks',
                    style: TextStyle(
                      color: AtelierTheme.gold,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 8,
                  backgroundColor: AtelierTheme.ivoryDark,
                  valueColor: const AlwaysStoppedAnimation<Color>(AtelierTheme.gold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPhaseTabs(BuildContext context) {
    final phases = TaskPhase.values;
    final labels = ['12+ Months', '9-12', '6-9', '3-6', '1-3', 'Final Month', 'Wedding Day'];

    return SizedBox(
      height: 42,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: phases.length,
        itemBuilder: (context, index) {
          final selected = _selectedPhase == phases[index];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(labels[index]),
              selected: selected,
              onSelected: (_) => setState(() => _selectedPhase = phases[index]),
              selectedColor: AtelierTheme.gold,
              labelStyle: TextStyle(
                color: selected ? AtelierTheme.espresso : AtelierTheme.espresso,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                fontSize: 12,
              ),
              side: BorderSide(
                color: selected ? AtelierTheme.gold : AtelierTheme.goldDark.withOpacity(0.3),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTaskCard(BuildContext context, _Task task) {
    return Dismissible(
      key: ValueKey(task.id),
      background: Container(
        color: const Color(0xFF4CAF50),
        alignment: Alignment.centerLeft,
        padding: const EdgeInsets.only(left: 20),
        child: const Icon(Icons.check, color: Colors.white),
      ),
      secondaryBackground: Container(
        color: Colors.red,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (direction) {
        if (direction == DismissDirection.endToStart) {
          ref.read(_tasksProvider.notifier).deleteTask(task.id);
        } else {
          ref.read(_tasksProvider.notifier).toggleComplete(task.id);
        }
      },
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: ListTile(
          leading: Checkbox(
            value: task.completed,
            activeColor: AtelierTheme.gold,
            checkColor: AtelierTheme.espresso,
            onChanged: (_) => ref.read(_tasksProvider.notifier).toggleComplete(task.id),
          ),
          title: Text(
            task.title,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              decoration: task.completed ? TextDecoration.lineThrough : null,
              color: task.completed ? AtelierTheme.espresso.withOpacity(0.5) : AtelierTheme.espresso,
            ),
          ),
          subtitle: Row(
            children: [
              Text(
                '${task.dueDate.month}/${task.dueDate.day}/${task.dueDate.year}',
                style: const TextStyle(fontSize: 12),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AtelierTheme.gold.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  task.category,
                  style: const TextStyle(
                    fontSize: 10,
                    color: AtelierTheme.gold,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              if (task.assignee != null) ...[
                const SizedBox(width: 8),
                Text(
                  '· ${task.assignee}',
                  style: const TextStyle(fontSize: 11, color: AtelierTheme.goldDark),
                ),
              ],
            ],
          ),
          isThreeLine: false,
        ),
      ),
    );
  }

  void _showAddTaskSheet(BuildContext context, {_Task? task}) {
    final titleController = TextEditingController(text: task?.title ?? '');
    final descController = TextEditingController(text: task?.description ?? '');
    final assigneeController = TextEditingController(text: task?.assignee ?? '');
    String category = task?.category ?? 'Vendors';
    TaskPhase phase = task?.phase ?? _selectedPhase;
    DateTime dueDate = task?.dueDate ?? DateTime.now().add(const Duration(days: 30));

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 20, right: 20, top: 20,
          ),
          child: StatefulBuilder(
            builder: (context, setSheetState) {
              return SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      task == null ? 'Add Task' : 'Edit Task',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontFamily: 'Playfair Display',
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 20),
                    TextField(
                      controller: titleController,
                      decoration: const InputDecoration(labelText: 'Task Title'),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: descController,
                      decoration: const InputDecoration(labelText: 'Description'),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: category,
                      decoration: const InputDecoration(labelText: 'Category'),
                      items: ['Vendors', 'Venue', 'Guests', 'Wedding Crew', 'Wedding Menu', 'Attire', 'Music', 'Other']
                        .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                        .toList(),
                      onChanged: (v) => setSheetState(() => category = v ?? category),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<TaskPhase>(
                      value: phase,
                      decoration: const InputDecoration(labelText: 'Phase'),
                      items: TaskPhase.values.asMap().entries.map((e) {
                        final labels = ['12+ Months', '9-12 Months', '6-9 Months', '3-6 Months', '1-3 Months', 'Final Month', 'Wedding Day'];
                        return DropdownMenuItem(value: e.value, child: Text(labels[e.key]));
                      }).toList(),
                      onChanged: (v) => setSheetState(() => phase = v ?? phase),
                    ),
                    const SizedBox(height: 12),
                    InkWell(
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: dueDate,
                          firstDate: DateTime.now(),
                          lastDate: DateTime(2028),
                        );
                        if (picked != null) setSheetState(() => dueDate = picked);
                      },
                      child: InputDecorator(
                        decoration: const InputDecoration(labelText: 'Due Date'),
                        child: Text('${dueDate.month}/${dueDate.day}/${dueDate.year}'),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: assigneeController,
                      decoration: const InputDecoration(labelText: 'Assignee (optional)'),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          final newTask = _Task(
                            id: task?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
                            title: titleController.text,
                            description: descController.text.isNotEmpty ? descController.text : null,
                            category: category,
                            phase: phase,
                            dueDate: dueDate,
                            assignee: assigneeController.text.isNotEmpty ? assigneeController.text : null,
                            completed: task?.completed ?? false,
                          );
                          if (task == null) {
                            ref.read(_tasksProvider.notifier).addTask(newTask);
                          } else {
                            ref.read(_tasksProvider.notifier).updateTask(task.id, newTask);
                          }
                          Navigator.pop(context);
                        },
                        child: Text(task == null ? 'Add Task' : 'Save Changes'),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              );
            },
          ),
        );
      },
    );
  }
}
