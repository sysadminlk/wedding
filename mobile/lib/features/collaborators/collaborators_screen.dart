import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../services/api_client.dart';
import '../../models/invitation.dart';
import '../../models/user_tenant.dart';

final collaboratorsProvider =
    FutureProvider.autoDispose<List<UserTenant>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('/api/collaborators');
    if (response.statusCode == 200 && response.data != null) {
      return UserTenant.fromJsonList(response.data as List<dynamic>);
    }
  } catch (_) {}
  return [];
});

final pendingInvitationsProvider =
    FutureProvider.autoDispose<List<CollaboratorInvitation>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final response = await api.get('/api/collaborators/invitations');
    if (response.statusCode == 200 && response.data != null) {
      return CollaboratorInvitation.fromJsonList(response.data as List<dynamic>);
    }
  } catch (_) {}
  return [];
});

class CollaboratorsScreen extends ConsumerStatefulWidget {
  const CollaboratorsScreen({super.key});

  @override
  ConsumerState<CollaboratorsScreen> createState() =>
      _CollaboratorsScreenState();
}

class _CollaboratorsScreenState extends ConsumerState<CollaboratorsScreen> {
  static const _roles = [
    'Planner',
    'Coordinator',
    'Vendor',
    'Family',
    'Viewer',
  ];

  static const _rolePresets = {
    'Planner': 'Full access to all sections',
    'Coordinator': 'Manage guests, vendors, and timeline',
    'Vendor': 'View-only for assigned sections',
    'Family': 'View and contribute to select sections',
    'Viewer': 'Read-only access',
  };

  @override
  Widget build(BuildContext context) {
    final collaboratorsAsync = ref.watch(collaboratorsProvider);
    final invitationsAsync = ref.watch(pendingInvitationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Collaborators'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add),
            onPressed: () => _showInviteSheet(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(collaboratorsProvider);
          ref.invalidate(pendingInvitationsProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildSectionTitle('Active Collaborators'),
            const SizedBox(height: 8),
            collaboratorsAsync.when(
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (_, __) => const Text('Failed to load'),
              data: (collaborators) => collaborators.isEmpty
                  ? _buildEmptyState('No collaborators yet')
                  : Column(
                      children: collaborators
                          .map((c) => _buildCollaboratorCard(c))
                          .toList(),
                    ),
            ),
            const SizedBox(height: 24),
            _buildSectionTitle('Pending Invitations'),
            const SizedBox(height: 8),
            invitationsAsync.when(
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (_, __) => const Text('Failed to load'),
              data: (invitations) => invitations.isEmpty
                  ? _buildEmptyState('No pending invitations')
                  : Column(
                      children: invitations
                          .map((inv) => _buildInvitationCard(inv))
                          .toList(),
                    ),
            ),
            const SizedBox(height: 24),
            _buildTransferOwnershipButton(),
            const SizedBox(height: 24),
          ],
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

  Widget _buildEmptyState(String message) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AtelierTheme.ivoryDark,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Text(
          message,
          style: TextStyle(color: AtelierTheme.goldDark),
        ),
      ),
    );
  }

  Widget _buildCollaboratorCard(UserTenant collaborator) {
    final roleColor = _roleColor(collaborator.role);
    final permissionCount = collaborator.permissions?.length ?? 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          radius: 24,
          backgroundColor: roleColor.withOpacity(0.15),
          child: Text(
            collaborator.userId.substring(0, 2).toUpperCase(),
            style: TextStyle(
              color: roleColor,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          collaborator.userId,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: roleColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                collaborator.role,
                style: TextStyle(
                  fontSize: 11,
                  color: roleColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '$permissionCount permissions',
              style: TextStyle(fontSize: 12, color: Colors.grey[500]),
            ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (value) => _handleCollaboratorAction(value, collaborator),
          itemBuilder: (context) => [
            const PopupMenuItem(value: 'edit', child: Text('Edit Role')),
            const PopupMenuItem(value: 'remove', child: Text('Remove')),
          ],
        ),
      ),
    );
  }

  Widget _buildInvitationCard(CollaboratorInvitation invitation) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        invitation.email,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AtelierTheme.gold.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              invitation.role,
                              style: TextStyle(
                                fontSize: 11,
                                color: AtelierTheme.goldDark,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          if (invitation.expiresAt != null)
                            Text(
                              'Expires ${_formatDate(invitation.expiresAt!)}',
                              style: TextStyle(
                                  fontSize: 12, color: Colors.grey[500]),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _resendInvitation(invitation),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AtelierTheme.gold,
                      side: BorderSide(color: AtelierTheme.gold),
                    ),
                    child: const Text('Resend'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _revokeInvitation(invitation),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                    ),
                    child: const Text('Revoke'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransferOwnershipButton() {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: _confirmTransferOwnership,
        icon: const Icon(Icons.swap_horiz),
        label: const Text('Transfer Ownership'),
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.orange,
          side: const BorderSide(color: Colors.orange),
          padding: const EdgeInsets.symmetric(vertical: 14),
        ),
      ),
    );
  }

  Color _roleColor(String role) {
    switch (role) {
      case 'Planner':
        return AtelierTheme.gold;
      case 'Coordinator':
        return Colors.teal;
      case 'Vendor':
        return Colors.blue;
      case 'Family':
        return Colors.pink;
      default:
        return Colors.grey;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _showInviteSheet() {
    final emailController = TextEditingController();
    String selectedRole = 'Viewer';

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
                  'Invite Collaborator',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: emailController,
                  decoration:
                      const InputDecoration(hintText: 'Email address'),
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: selectedRole,
                  items: _roles
                      .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                      .toList(),
                  onChanged: (v) {
                    if (v != null) setSheetState(() => selectedRole = v);
                  },
                  decoration: const InputDecoration(labelText: 'Role'),
                ),
                const SizedBox(height: 8),
                Text(
                  _rolePresets[selectedRole] ?? '',
                  style: TextStyle(fontSize: 12, color: AtelierTheme.goldDark),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () => _sendInvitation(
                        emailController.text, selectedRole),
                    child: const Text('Send Invitation'),
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

  Future<void> _sendInvitation(String email, String role) async {
    if (email.isEmpty) return;
    final api = ref.read(apiClientProvider);
    try {
      await api.post('/api/collaborators/invitations', data: {
        'email': email,
        'role': role,
      });
      ref.invalidate(pendingInvitationsProvider);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invitation sent')),
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

  void _handleCollaboratorAction(String action, UserTenant collaborator) {
    if (action == 'remove') {
      _confirmRemove(collaborator);
    } else if (action == 'edit') {
      _showEditRoleSheet(collaborator);
    }
  }

  void _showEditRoleSheet(UserTenant collaborator) {
    String selectedRole = collaborator.role;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
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
                'Edit Role',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 20),
              DropdownButtonFormField<String>(
                value: selectedRole,
                items: _roles
                    .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                    .toList(),
                onChanged: (v) {
                  if (v != null) setSheetState(() => selectedRole = v);
                },
                decoration: const InputDecoration(labelText: 'Role'),
              ),
              const SizedBox(height: 8),
              Text(
                _rolePresets[selectedRole] ?? '',
                style:
                    TextStyle(fontSize: 12, color: AtelierTheme.goldDark),
              ),
              const SizedBox(height: 20),
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: () =>
                      _updateRole(collaborator, selectedRole),
                  child: const Text('Update Role'),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _updateRole(UserTenant collaborator, String role) async {
    final api = ref.read(apiClientProvider);
    try {
      await api.put('/api/collaborators/${collaborator.id}', data: {
        'role': role,
      });
      ref.invalidate(collaboratorsProvider);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Role updated')),
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

  void _confirmRemove(UserTenant collaborator) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Collaborator'),
        content: const Text(
            'Are you sure you want to remove this collaborator?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _removeCollaborator(collaborator);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Remove'),
          ),
        ],
      ),
    );
  }

  Future<void> _removeCollaborator(UserTenant collaborator) async {
    final api = ref.read(apiClientProvider);
    try {
      await api.delete('/api/collaborators/${collaborator.id}');
      ref.invalidate(collaboratorsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Collaborator removed')),
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

  Future<void> _resendInvitation(CollaboratorInvitation invitation) async {
    final api = ref.read(apiClientProvider);
    try {
      await api.post('/api/collaborators/invitations/${invitation.id}/resend');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invitation resent')),
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

  Future<void> _revokeInvitation(CollaboratorInvitation invitation) async {
    final api = ref.read(apiClientProvider);
    try {
      await api.delete('/api/collaborators/invitations/${invitation.id}');
      ref.invalidate(pendingInvitationsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invitation revoked')),
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

  void _confirmTransferOwnership() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Transfer Ownership'),
        content: const Text(
          'This will transfer full ownership of this wedding to another collaborator. This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showTransferOwnershipSheet();
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }

  void _showTransferOwnershipSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        final emailController = TextEditingController();
        return Padding(
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
                  'Transfer Ownership',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Enter the email of the collaborator who will become the new owner.',
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: emailController,
                  decoration:
                      const InputDecoration(hintText: 'Collaborator email'),
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 20),
                SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () =>
                        _transferOwnership(emailController.text),
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange),
                    child: const Text('Transfer'),
                  ),
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _transferOwnership(String email) async {
    if (email.isEmpty) return;
    final api = ref.read(apiClientProvider);
    try {
      await api.post('/api/collaborators/transfer-ownership', data: {
        'email': email,
      });
      ref.invalidate(collaboratorsProvider);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ownership transferred')),
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
