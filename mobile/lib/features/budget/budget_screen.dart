import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../widgets/app_scaffold.dart';

class _BudgetItem {
  final String id;
  final String name;
  final double estimated;
  final double actual;

  const _BudgetItem({
    required this.id,
    required this.name,
    required this.estimated,
    this.actual = 0,
  });

  double get remaining => estimated - actual;
  double get percentage => estimated > 0 ? actual / estimated : 0.0;
}

class _BudgetCategory {
  final String id;
  final String name;
  final List<_BudgetItem> items;
  final bool expanded;

  const _BudgetCategory({
    required this.id,
    required this.name,
    this.items = const [],
    this.expanded = false,
  });

  double get estimated => items.fold(0, (sum, i) => sum + i.estimated);
  double get actual => items.fold(0, (sum, i) => sum + i.actual);
  double get remaining => estimated - actual;
  double get percentage => estimated > 0 ? actual / estimated : 0.0;

  _BudgetCategory copyWith({List<_BudgetItem>? items, bool? expanded}) {
    return _BudgetCategory(
      id: id,
      name: name,
      items: items ?? this.items,
      expanded: expanded ?? this.expanded,
    );
  }
}

final _budgetProvider = StateNotifierProvider<_BudgetNotifier, List<_BudgetCategory>>((ref) {
  return _BudgetNotifier();
});

class _BudgetNotifier extends StateNotifier<List<_BudgetCategory>> {
  _BudgetNotifier() : super(_mockCategories);

  void addItem(String categoryId, _BudgetItem item) {
    state = state.map((cat) {
      if (cat.id == categoryId) {
        return cat.copyWith(items: [...cat.items, item]);
      }
      return cat;
    }).toList();
  }

  void updateItem(String categoryId, String itemId, _BudgetItem updated) {
    state = state.map((cat) {
      if (cat.id == categoryId) {
        return cat.copyWith(
          items: cat.items.map((i) => i.id == itemId ? updated : i).toList(),
        );
      }
      return cat;
    }).toList();
  }

  void deleteItem(String categoryId, String itemId) {
    state = state.map((cat) {
      if (cat.id == categoryId) {
        return cat.copyWith(
          items: cat.items.where((i) => i.id != itemId).toList(),
        );
      }
      return cat;
    }).toList();
  }

  void toggleExpand(String categoryId) {
    state = state.map((cat) {
      if (cat.id == categoryId) {
        return cat.copyWith(expanded: !cat.expanded);
      }
      return cat;
    }).toList();
  }
}

const _mockCategories = [
  _BudgetCategory(id: '1', name: 'Venue', items: [
    _BudgetItem(id: '1-1', name: 'Venue Deposit', estimated: 5000, actual: 5000),
    _BudgetItem(id: '1-2', name: 'Venue Balance', estimated: 10000, actual: 3000),
  ]),
  _BudgetCategory(id: '2', name: 'Catering', items: [
    _BudgetItem(id: '2-1', name: 'Food', estimated: 8000, actual: 2000),
    _BudgetItem(id: '2-2', name: 'Beverages', estimated: 2000, actual: 500),
  ]),
  _BudgetCategory(id: '3', name: 'Photography', items: [
    _BudgetItem(id: '3-1', name: 'Photographer', estimated: 4000, actual: 4000),
    _BudgetItem(id: '3-2', name: 'Videographer', estimated: 3000, actual: 0),
  ]),
  _BudgetCategory(id: '4', name: 'Attire', items: [
    _BudgetItem(id: '4-1', name: 'Wedding Dress', estimated: 3500, actual: 3500),
    _BudgetItem(id: '4-2', name: 'Groom Suit', estimated: 1500, actual: 0),
  ]),
  _BudgetCategory(id: '5', name: 'Music', items: [
    _BudgetItem(id: '5-1', name: 'Band', estimated: 3000, actual: 1500),
  ]),
  _BudgetCategory(id: '6', name: 'Flowers', items: [
    _BudgetItem(id: '6-1', name: 'Bridal Bouquet', estimated: 500, actual: 500),
    _BudgetItem(id: '6-2', name: 'Centerpieces', estimated: 1500, actual: 0),
  ]),
];

class BudgetScreen extends ConsumerStatefulWidget {
  const BudgetScreen({super.key});

  @override
  ConsumerState<BudgetScreen> createState() => _BudgetScreenState();
}

class _BudgetScreenState extends ConsumerState<BudgetScreen> {
  String _filter = 'All';

  @override
  Widget build(BuildContext context) {
    final categories = ref.watch(_budgetProvider);
    final totalEstimated = categories.fold(0.0, (sum, c) => sum + c.estimated);
    final totalActual = categories.fold(0.0, (sum, c) => sum + c.actual);
    final totalRemaining = totalEstimated - totalActual;

    var filteredCategories = categories;
    if (_filter == 'Under budget') {
      filteredCategories = categories.where((c) => c.actual <= c.estimated).toList();
    } else if (_filter == 'Over budget') {
      filteredCategories = categories.where((c) => c.actual > c.estimated).toList();
    }

    return AppScaffold(
      title: 'Budget',
      sectionKey: 'budget',
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.delayed(const Duration(seconds: 1));
        },
        child: Column(
          children: [
            _buildSummaryCard(context, totalEstimated, totalActual, totalRemaining),
            _buildFilterChips(context),
            Expanded(
              child: filteredCategories.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.account_balance_wallet_outlined, size: 64, color: AtelierTheme.goldDark.withOpacity(0.5)),
                        const SizedBox(height: 16),
                        Text('No categories found', style: TextStyle(color: AtelierTheme.espresso.withOpacity(0.6))),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: filteredCategories.length,
                    itemBuilder: (context, index) => _buildCategoryCard(context, filteredCategories[index]),
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard(BuildContext context, double estimated, double actual, double remaining) {
    final percentage = estimated > 0 ? actual / estimated : 0.0;
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      children: [
                        Text('Budget', style: TextStyle(fontSize: 11, color: AtelierTheme.espresso.withOpacity(0.6))),
                        const SizedBox(height: 4),
                        Text('\$${_format(estimated)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      children: [
                        Text('Spent', style: TextStyle(fontSize: 11, color: AtelierTheme.espresso.withOpacity(0.6))),
                        const SizedBox(height: 4),
                        Text('\$${_format(actual)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AtelierTheme.gold)),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      children: [
                        Text('Left', style: TextStyle(fontSize: 11, color: AtelierTheme.espresso.withOpacity(0.6))),
                        const SizedBox(height: 4),
                        Text('\$${_format(remaining)}', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: remaining >= 0 ? const Color(0xFF4CAF50) : Colors.red)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: percentage.clamp(0.0, 1.0),
                  minHeight: 10,
                  backgroundColor: AtelierTheme.ivoryDark,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    percentage > 1.0 ? Colors.red : AtelierTheme.gold,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${(percentage * 100).toStringAsFixed(0)}% of budget used',
                style: TextStyle(fontSize: 12, color: AtelierTheme.espresso.withOpacity(0.6)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChips(BuildContext context) {
    final filters = ['All', 'Under budget', 'Over budget'];
    return SizedBox(
      height: 48,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: filters.length,
        itemBuilder: (context, index) {
          final selected = _filter == filters[index];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(filters[index]),
              selected: selected,
              onSelected: (_) => setState(() => _filter = filters[index]),
              selectedColor: AtelierTheme.gold.withOpacity(0.2),
              checkmarkColor: AtelierTheme.gold,
              labelStyle: TextStyle(
                color: selected ? AtelierTheme.gold : AtelierTheme.espresso,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
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

  Widget _buildCategoryCard(BuildContext context, _BudgetCategory category) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Column(
        children: [
          InkWell(
            onTap: () => ref.read(_budgetProvider.notifier).toggleExpand(category.id),
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          category.name,
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                        ),
                      ),
                      Text(
                        '\$${_format(category.actual)} / \$${_format(category.estimated)}',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: category.actual > category.estimated ? Colors.red : AtelierTheme.espresso,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(
                        category.expanded ? Icons.expand_less : Icons.expand_more,
                        color: AtelierTheme.goldDark,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: category.percentage.clamp(0.0, 1.0),
                      minHeight: 6,
                      backgroundColor: AtelierTheme.ivoryDark,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        category.percentage > 1.0 ? Colors.red : AtelierTheme.gold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (category.expanded)
            ...category.items.map((item) => _buildItemRow(context, category.id, item)),
        ],
      ),
    );
  }

  Widget _buildItemRow(BuildContext context, String categoryId, _BudgetItem item) {
    return Dismissible(
      key: ValueKey(item.id),
      background: Container(color: const Color(0xFF4CAF50), alignment: Alignment.centerLeft, padding: const EdgeInsets.only(left: 20), child: const Icon(Icons.edit, color: Colors.white)),
      secondaryBackground: Container(color: Colors.red, alignment: Alignment.centerRight, padding: const EdgeInsets.only(right: 20), child: const Icon(Icons.delete, color: Colors.white)),
      onDismissed: (direction) {
        if (direction == DismissDirection.endToStart) {
          ref.read(_budgetProvider.notifier).deleteItem(categoryId, item.id);
        } else {
          _showAddItemSheet(context, categoryId, item: item);
        }
      },
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: AtelierTheme.ivoryDark)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(item.name, style: const TextStyle(fontSize: 14)),
            ),
            Text(
              '\$${_format(item.actual)} / \$${_format(item.estimated)}',
              style: TextStyle(
                fontSize: 13,
                color: item.actual > item.estimated ? Colors.red : AtelierTheme.espresso.withOpacity(0.7),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _format(double value) {
    return value.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (m) => '${m[1]},',
    );
  }

  void _showAddItemSheet(BuildContext context, String categoryId, {_BudgetItem? item}) {
    final nameController = TextEditingController(text: item?.name ?? '');
    final estimatedController = TextEditingController(text: item?.estimated.toString() ?? '');
    final actualController = TextEditingController(text: item?.actual.toString() ?? '');

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
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item == null ? 'Add Budget Item' : 'Edit Budget Item',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontFamily: 'Playfair Display',
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Item Name'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: estimatedController,
                  decoration: const InputDecoration(labelText: 'Estimated Cost', prefixText: '\$'),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: actualController,
                  decoration: const InputDecoration(labelText: 'Actual Cost', prefixText: '\$'),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      final newItem = _BudgetItem(
                        id: item?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
                        name: nameController.text,
                        estimated: double.tryParse(estimatedController.text) ?? 0,
                        actual: double.tryParse(actualController.text) ?? 0,
                      );
                      if (item == null) {
                        ref.read(_budgetProvider.notifier).addItem(categoryId, newItem);
                      } else {
                        ref.read(_budgetProvider.notifier).updateItem(categoryId, item.id, newItem);
                      }
                      Navigator.pop(context);
                    },
                    child: Text(item == null ? 'Add Item' : 'Save Changes'),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        );
      },
    );
  }
}
