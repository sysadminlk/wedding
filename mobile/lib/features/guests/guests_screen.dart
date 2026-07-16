import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../widgets/app_scaffold.dart';

enum RsvpStatus { attending, declined, pending, noResponse }

class _Guest {
  final String id;
  final String name;
  final String email;
  final RsvpStatus status;
  final bool hasPlusOne;
  final String? tableAssignment;

  const _Guest({
    required this.id,
    required this.name,
    required this.email,
    this.status = RsvpStatus.noResponse,
    this.hasPlusOne = false,
    this.tableAssignment,
  });
}

final _guestsProvider = StateNotifierProvider<_GuestsNotifier, List<_Guest>>((ref) {
  return _GuestsNotifier();
});

class _GuestsNotifier extends StateNotifier<List<_Guest>> {
  _GuestsNotifier() : super(_mockGuests);

  void addGuest(_Guest guest) {
    state = [...state, guest];
  }

  void updateGuest(String id, _Guest updated) {
    state = state.map((g) => g.id == id ? updated : g).toList();
  }

  void deleteGuest(String id) {
    state = state.where((g) => g.id != id).toList();
  }
}

const _mockGuests = [
  _Guest(id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', status: RsvpStatus.attending, hasPlusOne: true, tableAssignment: 'Table 4'),
  _Guest(id: '2', name: 'Michael Chen', email: 'michael@example.com', status: RsvpStatus.attending, tableAssignment: 'Table 2'),
  _Guest(id: '3', name: 'Emily Davis', email: 'emily@example.com', status: RsvpStatus.declined),
  _Guest(id: '4', name: 'James Wilson', email: 'james@example.com', status: RsvpStatus.pending, hasPlusOne: true, tableAssignment: 'Table 6'),
  _Guest(id: '5', name: 'Olivia Brown', email: 'olivia@example.com', status: RsvpStatus.noResponse),
  _Guest(id: '6', name: 'William Taylor', email: 'william@example.com', status: RsvpStatus.attending, tableAssignment: 'Table 1'),
  _Guest(id: '7', name: 'Sophia Martinez', email: 'sophia@example.com', status: RsvpStatus.attending, hasPlusOne: true, tableAssignment: 'Table 3'),
  _Guest(id: '8', name: 'Daniel Anderson', email: 'daniel@example.com', status: RsvpStatus.pending),
];

class GuestsScreen extends ConsumerStatefulWidget {
  const GuestsScreen({super.key});

  @override
  ConsumerState<GuestsScreen> createState() => _GuestsScreenState();
}

class _GuestsScreenState extends ConsumerState<GuestsScreen> {
  RsvpStatus? _selectedFilter;
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final guests = ref.watch(_guestsProvider);
    final filtered = _filterGuests(guests);

    return AppScaffold(
      title: 'Guests',
      sectionKey: 'guests',
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.delayed(const Duration(seconds: 1));
        },
        child: Column(
          children: [
            _buildSummaryHeader(context, guests),
            _buildSearchBar(context),
            _buildFilterChips(context),
            Expanded(
              child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.people_outline, size: 64, color: AtelierTheme.goldDark.withOpacity(0.5)),
                        const SizedBox(height: 16),
                        Text('No guests found', style: TextStyle(color: AtelierTheme.espresso.withOpacity(0.6))),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) => _buildGuestCard(context, filtered[index]),
                  ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddGuestSheet(context),
        backgroundColor: AtelierTheme.gold,
        foregroundColor: AtelierTheme.espresso,
        icon: const Icon(Icons.add),
        label: const Text('Add Guest'),
      ),
    );
  }

  Widget _buildSummaryHeader(BuildContext context, List<_Guest> guests) {
    final attending = guests.where((g) => g.status == RsvpStatus.attending).length;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Text(
        '${guests.length} Guests · $attending Attending',
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: TextField(
        controller: _searchController,
        decoration: const InputDecoration(
          hintText: 'Search guests...',
          prefixIcon: Icon(Icons.search),
          isDense: true,
          contentPadding: EdgeInsets.symmetric(vertical: 12),
        ),
        onChanged: (_) => setState(() {}),
      ),
    );
  }

  Widget _buildFilterChips(BuildContext context) {
    final filters = <RsvpStatus?>[null, RsvpStatus.attending, RsvpStatus.declined, RsvpStatus.pending, RsvpStatus.noResponse];
    final labels = ['All', 'Attending', 'Declined', 'Pending', 'No Response'];

    return SizedBox(
      height: 48,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: filters.length,
        itemBuilder: (context, index) {
          final selected = _selectedFilter == filters[index];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(labels[index]),
              selected: selected,
              onSelected: (_) => setState(() => _selectedFilter = filters[index]),
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

  Widget _buildGuestCard(BuildContext context, _Guest guest) {
    return Dismissible(
      key: ValueKey(guest.id),
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
          ref.read(_guestsProvider.notifier).deleteGuest(guest.id);
        } else {
          _showAddGuestSheet(context, guest: guest);
        }
      },
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: ListTile(
          leading: CircleAvatar(
            backgroundColor: AtelierTheme.gold.withOpacity(0.2),
            child: Text(
              guest.name.substring(0, 1).toUpperCase(),
              style: const TextStyle(
                color: AtelierTheme.gold,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          title: Text(guest.name, style: const TextStyle(fontWeight: FontWeight.w600)),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(guest.email, style: const TextStyle(fontSize: 12)),
              if (guest.tableAssignment != null)
                Text('${guest.tableAssignment}${guest.hasPlusOne ? ' · +1' : ''}',
                  style: const TextStyle(fontSize: 11, color: AtelierTheme.gold),
                ),
            ],
          ),
          trailing: _buildStatusBadge(guest.status),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(RsvpStatus status) {
    final data = switch (status) {
      RsvpStatus.attending => ('Attending', const Color(0xFF4CAF50)),
      RsvpStatus.declined => ('Declined', Colors.red),
      RsvpStatus.pending => ('Pending', const Color(0xFFFF9800)),
      RsvpStatus.noResponse => ('No Response', Colors.grey),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: data.$2.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: data.$2.withOpacity(0.3)),
      ),
      child: Text(
        data.$1,
        style: TextStyle(
          color: data.$2,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  void _showAddGuestSheet(BuildContext context, {_Guest? guest}) {
    final nameController = TextEditingController(text: guest?.name ?? '');
    final emailController = TextEditingController(text: guest?.email ?? '');
    final phoneController = TextEditingController();
    final hasPlusOne = ValueNotifier(guest?.hasPlusOne ?? false);
    String? side = 'Bride';
    RsvpStatus status = guest?.status ?? RsvpStatus.pending;
    final dietaryController = TextEditingController();

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
                      guest == null ? 'Add Guest' : 'Edit Guest',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontFamily: 'Playfair Display',
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 20),
                    TextField(
                      controller: nameController,
                      decoration: const InputDecoration(labelText: 'Full Name'),
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
                    DropdownButtonFormField<String>(
                      value: side,
                      decoration: const InputDecoration(labelText: 'Side'),
                      items: ['Bride', 'Groom', 'Both', 'Family']
                        .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                        .toList(),
                      onChanged: (v) => setSheetState(() => side = v),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<RsvpStatus>(
                            value: status,
                            decoration: const InputDecoration(labelText: 'Status'),
                            items: RsvpStatus.values.map((s) {
                              final label = switch (s) {
                                RsvpStatus.attending => 'Attending',
                                RsvpStatus.declined => 'Declined',
                                RsvpStatus.pending => 'Pending',
                                RsvpStatus.noResponse => 'No Response',
                              };
                              return DropdownMenuItem(value: s, child: Text(label));
                            }).toList(),
                            onChanged: (v) => setSheetState(() => status = v ?? RsvpStatus.pending),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          children: [
                            const Text('+1', style: TextStyle(fontSize: 12)),
                            Switch(
                              value: hasPlusOne.value,
                              activeColor: AtelierTheme.gold,
                              onChanged: (v) => setSheetState(() => hasPlusOne.value = v),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: dietaryController,
                      decoration: const InputDecoration(labelText: 'Dietary Restrictions'),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          final newGuest = _Guest(
                            id: guest?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
                            name: nameController.text,
                            email: emailController.text,
                            status: status,
                            hasPlusOne: hasPlusOne.value,
                          );
                          if (guest == null) {
                            ref.read(_guestsProvider.notifier).addGuest(newGuest);
                          } else {
                            ref.read(_guestsProvider.notifier).updateGuest(guest.id, newGuest);
                          }
                          Navigator.pop(context);
                        },
                        child: Text(guest == null ? 'Add Guest' : 'Save Changes'),
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

  List<_Guest> _filterGuests(List<_Guest> guests) {
    var filtered = guests;
    if (_selectedFilter != null) {
      filtered = filtered.where((g) => g.status == _selectedFilter).toList();
    }
    final query = _searchController.text.toLowerCase();
    if (query.isNotEmpty) {
      filtered = filtered.where((g) =>
        g.name.toLowerCase().contains(query) ||
        g.email.toLowerCase().contains(query)
      ).toList();
    }
    return filtered;
  }
}
