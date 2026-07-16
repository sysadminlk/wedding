import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../widgets/app_scaffold.dart';

enum VendorStatus { contacted, confirmed, pending }

enum VendorCategory { catering, photography, venue, florist, music, attire, other }

class _Vendor {
  final String id;
  final String name;
  final String? contactPerson;
  final String? email;
  final String? phone;
  final VendorCategory category;
  final double rating;
  final double cost;
  final VendorStatus status;

  const _Vendor({
    required this.id,
    required this.name,
    this.contactPerson,
    this.email,
    this.phone,
    required this.category,
    this.rating = 0,
    this.cost = 0,
    this.status = VendorStatus.pending,
  });
}

final _vendorsProvider = StateNotifierProvider<_VendorsNotifier, List<_Vendor>>((ref) {
  return _VendorsNotifier();
});

class _VendorsNotifier extends StateNotifier<List<_Vendor>> {
  _VendorsNotifier() : super(_mockVendors);

  void addVendor(_Vendor vendor) {
    state = [...state, vendor];
  }

  void updateVendor(String id, _Vendor updated) {
    state = state.map((v) => v.id == id ? updated : v).toList();
  }

  void deleteVendor(String id) {
    state = state.where((v) => v.id != id).toList();
  }
}

const _mockVendors = [
  _Vendor(id: '1', name: 'Golden Hour Photography', contactPerson: 'Anna Kim', email: 'anna@goldenhour.com', category: VendorCategory.photography, rating: 4.8, cost: 4000, status: VendorStatus.confirmed),
  _Vendor(id: '2', name: 'Delicious Catering Co.', contactPerson: 'Mark Davis', email: 'mark@delicious.com', category: VendorCategory.catering, rating: 4.5, cost: 8000, status: VendorStatus.contacted),
  _Vendor(id: '3', name: 'The Ritz-Carlton', contactPerson: 'Events Team', email: 'events@ritzcarlton.com', category: VendorCategory.venue, rating: 5.0, cost: 15000, status: VendorStatus.confirmed),
  _Vendor(id: '4', name: 'Bloom Florists', contactPerson: 'Lisa White', email: 'lisa@bloom.com', category: VendorCategory.florist, rating: 4.2, cost: 2000, status: VendorStatus.pending),
  _Vendor(id: '5', name: 'String Quartet Plus', contactPerson: 'James Brown', email: 'james@quartet.com', category: VendorCategory.music, rating: 4.6, cost: 2500, status: VendorStatus.contacted),
  _Vendor(id: '6', name: 'Elegant Attire Boutique', contactPerson: 'Sarah Lee', email: 'sarah@elegant.com', category: VendorCategory.attire, rating: 4.3, cost: 3500, status: VendorStatus.confirmed),
];

class VendorsScreen extends ConsumerStatefulWidget {
  const VendorsScreen({super.key});

  @override
  ConsumerState<VendorsScreen> createState() => _VendorsScreenState();
}

class _VendorsScreenState extends ConsumerState<VendorsScreen> {
  VendorCategory? _selectedCategory;

  @override
  Widget build(BuildContext context) {
    final vendors = ref.watch(_vendorsProvider);
    final filtered = _selectedCategory == null
      ? vendors
      : vendors.where((v) => v.category == _selectedCategory).toList();

    return AppScaffold(
      title: 'Vendors',
      sectionKey: 'vendors',
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.delayed(const Duration(seconds: 1));
        },
        child: Column(
          children: [
            _buildCategoryTabs(context),
            Expanded(
              child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.store_outlined, size: 64, color: AtelierTheme.goldDark.withOpacity(0.5)),
                        const SizedBox(height: 16),
                        Text('No vendors found', style: TextStyle(color: AtelierTheme.espresso.withOpacity(0.6))),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) => _buildVendorCard(context, filtered[index]),
                  ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddVendorSheet(context),
        backgroundColor: AtelierTheme.gold,
        foregroundColor: AtelierTheme.espresso,
        icon: const Icon(Icons.add),
        label: const Text('Add Vendor'),
      ),
    );
  }

  Widget _buildCategoryTabs(BuildContext context) {
    final categories = <VendorCategory?>[null, VendorCategory.catering, VendorCategory.photography, VendorCategory.venue, VendorCategory.florist, VendorCategory.music, VendorCategory.attire, VendorCategory.other];
    final labels = ['All', 'Catering', 'Photography', 'Venue', 'Florist', 'Music', 'Attire', 'Other'];

    return SizedBox(
      height: 48,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final selected = _selectedCategory == categories[index];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(labels[index], style: const TextStyle(fontSize: 12)),
              selected: selected,
              onSelected: (_) => setState(() => _selectedCategory = categories[index]),
              selectedColor: AtelierTheme.gold,
              labelStyle: TextStyle(
                color: selected ? AtelierTheme.espresso : AtelierTheme.espresso,
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

  Widget _buildVendorCard(BuildContext context, _Vendor vendor) {
    return Dismissible(
      key: ValueKey(vendor.id),
      background: Container(
        color: const Color(0xFF4CAF50),
        alignment: Alignment.centerLeft,
        padding: const EdgeInsets.only(left: 20),
        child: const Icon(Icons.edit, color: Colors.white),
      ),
      secondaryBackground: Container(
        color: Colors.red,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (direction) {
        if (direction == DismissDirection.endToStart) {
          ref.read(_vendorsProvider.notifier).deleteVendor(vendor.id);
        } else {
          _showAddVendorSheet(context, vendor: vendor);
        }
      },
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                backgroundColor: AtelierTheme.gold.withOpacity(0.2),
                radius: 24,
                child: Text(
                  vendor.name.substring(0, 1).toUpperCase(),
                  style: const TextStyle(
                    color: AtelierTheme.gold,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      vendor.name,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                    ),
                    const SizedBox(height: 4),
                    _buildCategoryBadge(vendor.category),
                    const SizedBox(height: 4),
                    if (vendor.rating > 0)
                      Row(
                        children: [
                          ...List.generate(5, (i) {
                            return Icon(
                              i < vendor.rating.round() ? Icons.star : Icons.star_border,
                              size: 16,
                              color: AtelierTheme.gold,
                            );
                          }),
                          const SizedBox(width: 4),
                          Text(
                            vendor.rating.toStringAsFixed(1),
                            style: const TextStyle(fontSize: 12, color: AtelierTheme.goldDark),
                          ),
                        ],
                      ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(
                          '\$${vendor.cost.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            color: AtelierTheme.espresso,
                          ),
                        ),
                        const SizedBox(width: 12),
                        _buildStatusBadge(vendor.status),
                      ],
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

  Widget _buildCategoryBadge(VendorCategory category) {
    final label = switch (category) {
      VendorCategory.catering => 'Catering',
      VendorCategory.photography => 'Photography',
      VendorCategory.venue => 'Venue',
      VendorCategory.florist => 'Florist',
      VendorCategory.music => 'Music',
      VendorCategory.attire => 'Attire',
      VendorCategory.other => 'Other',
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: AtelierTheme.gold.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 10,
          color: AtelierTheme.gold,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildStatusBadge(VendorStatus status) {
    final data = switch (status) {
      VendorStatus.confirmed => ('Confirmed', const Color(0xFF4CAF50)),
      VendorStatus.contacted => ('Contacted', const Color(0xFF2196F3)),
      VendorStatus.pending => ('Pending', const Color(0xFFFF9800)),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: data.$2.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: data.$2.withOpacity(0.3)),
      ),
      child: Text(
        data.$1,
        style: TextStyle(
          fontSize: 10,
          color: data.$2,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  void _showAddVendorSheet(BuildContext context, {_Vendor? vendor}) {
    final nameController = TextEditingController(text: vendor?.name ?? '');
    final contactController = TextEditingController(text: vendor?.contactPerson ?? '');
    final emailController = TextEditingController(text: vendor?.email ?? '');
    final phoneController = TextEditingController(text: vendor?.phone ?? '');
    final costController = TextEditingController(text: vendor?.cost.toString() ?? '');
    double rating = vendor?.rating ?? 0;
    VendorCategory category = vendor?.category ?? VendorCategory.other;
    VendorStatus status = vendor?.status ?? VendorStatus.pending;

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
                      vendor == null ? 'Add Vendor' : 'Edit Vendor',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontFamily: 'Playfair Display',
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 20),
                    TextField(
                      controller: nameController,
                      decoration: const InputDecoration(labelText: 'Business Name'),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: contactController,
                      decoration: const InputDecoration(labelText: 'Contact Person'),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: emailController,
                      decoration: const InputDecoration(labelText: 'Email'),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: phoneController,
                      decoration: const InputDecoration(labelText: 'Phone'),
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<VendorCategory>(
                      value: category,
                      decoration: const InputDecoration(labelText: 'Category'),
                      items: VendorCategory.values.map((c) {
                        final label = switch (c) {
                          VendorCategory.catering => 'Catering',
                          VendorCategory.photography => 'Photography',
                          VendorCategory.venue => 'Venue',
                          VendorCategory.florist => 'Florist',
                          VendorCategory.music => 'Music',
                          VendorCategory.attire => 'Attire',
                          VendorCategory.other => 'Other',
                        };
                        return DropdownMenuItem(value: c, child: Text(label));
                      }).toList(),
                      onChanged: (v) => setSheetState(() => category = v ?? category),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: costController,
                      decoration: const InputDecoration(labelText: 'Cost', prefixText: '\$'),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Text('Rating: ', style: TextStyle(fontSize: 14)),
                        ...List.generate(5, (i) {
                          return IconButton(
                            onPressed: () => setSheetState(() => rating = (i + 1).toDouble()),
                            icon: Icon(
                              i < rating.round() ? Icons.star : Icons.star_border,
                              color: AtelierTheme.gold,
                              size: 28,
                            ),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                          );
                        }),
                      ],
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<VendorStatus>(
                      value: status,
                      decoration: const InputDecoration(labelText: 'Status'),
                      items: VendorStatus.values.map((s) {
                        final label = switch (s) {
                          VendorStatus.contacted => 'Contacted',
                          VendorStatus.confirmed => 'Confirmed',
                          VendorStatus.pending => 'Pending',
                        };
                        return DropdownMenuItem(value: s, child: Text(label));
                      }).toList(),
                      onChanged: (v) => setSheetState(() => status = v ?? status),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          final newVendor = _Vendor(
                            id: vendor?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
                            name: nameController.text,
                            contactPerson: contactController.text.isNotEmpty ? contactController.text : null,
                            email: emailController.text.isNotEmpty ? emailController.text : null,
                            phone: phoneController.text.isNotEmpty ? phoneController.text : null,
                            category: category,
                            rating: rating,
                            cost: double.tryParse(costController.text) ?? 0,
                            status: status,
                          );
                          if (vendor == null) {
                            ref.read(_vendorsProvider.notifier).addVendor(newVendor);
                          } else {
                            ref.read(_vendorsProvider.notifier).updateVendor(vendor.id, newVendor);
                          }
                          Navigator.pop(context);
                        },
                        child: Text(vendor == null ? 'Add Vendor' : 'Save Changes'),
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
