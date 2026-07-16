'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Mail,
  Shield,
  Trash2,
  X,
  Users,
  Crown,
  Send,
  RefreshCw,
  AlertCircle,
  Check,
  ChevronDown,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { UserTenant, TenantPermissions } from '@/types';

interface Collaborator extends UserTenant {
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  permissions: TenantPermissions;
  invitedBy: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  createdAt: string;
}

type Role = UserTenant['role'];
type PermissionLevel = 'none' | 'read' | 'write';

const ROLE_CONFIG: Record<Role, { label: string; color: string; bg: string }> = {
  partner: { label: 'Partner', color: '#d4af37', bg: '#d4af3720' },
  planner: { label: 'Planner', color: '#16a34a', bg: '#16a34a20' },
  family: { label: 'Family', color: '#2563eb', bg: '#2563eb20' },
  friend: { label: 'Friend', color: '#9333ea', bg: '#9333ea20' },
  vendor: { label: 'Vendor', color: '#6b7280', bg: '#6b728020' },
};

const SECTION_LABELS: Record<keyof TenantPermissions, string> = {
  dashboard: 'Dashboard',
  checklist: 'Checklist',
  budget: 'Budget',
  guests: 'Guests & RSVPs',
  seating: 'Seating Chart',
  vendors: 'Vendors',
  crew: 'Wedding Crew',
  timeline: 'Timeline',
  inspiration: 'Inspiration',
  menu: 'Wedding Menu',
  photos: 'Photos',
  memories: 'Guest Memories',
  gifts: 'Gift Registry',
  website: 'Public Website',
  rsvp: 'RSVP Page',
  emailTemplates: 'Email Templates',
};

const PERMISSION_COLORS: Record<PermissionLevel, string> = {
  write: '#16a34a',
  read: '#d4af37',
  none: '#6b7280',
};

const PERMISSION_BG: Record<PermissionLevel, string> = {
  write: '#16a34a18',
  read: '#d4af3718',
  none: '#00000008',
};

const DEFAULT_PERMISSIONS: Record<Role, TenantPermissions> = {
  partner: {
    dashboard: 'write', checklist: 'write', budget: 'write', guests: 'write',
    seating: 'write', vendors: 'write', crew: 'write', timeline: 'write',
    inspiration: 'write', menu: 'write', photos: 'write', memories: 'write',
    gifts: 'write', website: 'write', rsvp: 'write', emailTemplates: 'write',
  },
  planner: {
    dashboard: 'write', checklist: 'write', budget: 'write', guests: 'write',
    seating: 'write', vendors: 'write', crew: 'write', timeline: 'write',
    inspiration: 'write', menu: 'write', photos: 'write', memories: 'read',
    gifts: 'read', website: 'write', rsvp: 'write', emailTemplates: 'write',
  },
  family: {
    dashboard: 'read', checklist: 'none', budget: 'none', guests: 'read',
    seating: 'none', vendors: 'none', crew: 'none', timeline: 'read',
    inspiration: 'read', menu: 'read', photos: 'read', memories: 'read',
    gifts: 'read', website: 'read', rsvp: 'none', emailTemplates: 'none',
  },
  friend: {
    dashboard: 'none', checklist: 'none', budget: 'none', guests: 'read',
    seating: 'none', vendors: 'none', crew: 'none', timeline: 'read',
    inspiration: 'read', menu: 'read', photos: 'read', memories: 'write',
    gifts: 'read', website: 'read', rsvp: 'none', emailTemplates: 'none',
  },
  vendor: {
    dashboard: 'none', checklist: 'none', budget: 'none', guests: 'none',
    seating: 'none', vendors: 'read', crew: 'none', timeline: 'read',
    inspiration: 'none', menu: 'none', photos: 'none', memories: 'none',
    gifts: 'none', website: 'none', rsvp: 'none', emailTemplates: 'none',
  },
};

function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role as Role];
  if (!config) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-label font-semibold"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {role === 'partner' && <Crown size={12} />}
      {config.label}
    </span>
  );
}

function PermissionDot({ level }: { level: PermissionLevel }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: PERMISSION_COLORS[level] }}
    />
  );
}

function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('friend');
  const [permissions, setPermissions] = useState<TenantPermissions>(DEFAULT_PERMISSIONS.friend);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showPermissions, setShowPermissions] = useState(false);

  const cyclePermission = (section: keyof TenantPermissions) => {
    setPermissions((prev) => {
      const current = prev[section];
      const next: PermissionLevel = current === 'none' ? 'read' : current === 'read' ? 'write' : 'none';
      return { ...prev, [section]: next };
    });
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setPermissions(DEFAULT_PERMISSIONS[newRole]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/collaborators/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, role, permissions }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send invitation');
      }
      onInvited();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>
            Invite Collaborator
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-black/5">
            <X size={20} style={{ color: 'var(--color-dashboard-text-secondary)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-sm font-body" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-label uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@email.com"
              className="w-full px-4 py-3 rounded-xl border font-body text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              style={{
                borderColor: 'var(--color-dashboard-border)',
                backgroundColor: 'var(--color-dashboard-surface)',
                color: 'var(--color-dashboard-text)',
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-label uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ROLE_CONFIG) as Role[]).filter((r) => r !== 'partner').map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleChange(r)}
                  className="px-3 py-2.5 rounded-xl border font-label text-sm capitalize transition-all"
                  style={{
                    borderColor: role === r ? ROLE_CONFIG[r].color : 'var(--color-dashboard-border)',
                    backgroundColor: role === r ? ROLE_CONFIG[r].bg : 'var(--color-dashboard-surface)',
                    color: role === r ? ROLE_CONFIG[r].color : 'var(--color-dashboard-text)',
                  }}
                >
                  {role === r && <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: ROLE_CONFIG[r].color }} />}
                  {ROLE_CONFIG[r].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setShowPermissions(!showPermissions)}
              className="flex items-center gap-2 text-sm font-label font-semibold transition-colors"
              style={{ color: '#d4af37' }}
            >
              <Shield size={14} />
              Customize Permissions
              <ChevronDown size={14} className={`transition-transform ${showPermissions ? 'rotate-180' : ''}`} />
            </button>
            {showPermissions && (
              <div className="mt-3 space-y-1">
                {(Object.keys(SECTION_LABELS) as (keyof TenantPermissions)[]).map((section) => (
                  <div
                    key={section}
                    className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors hover:bg-black/3"
                    style={{ cursor: 'pointer' }}
                    onClick={() => cyclePermission(section)}
                  >
                    <span className="font-body text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                      {SECTION_LABELS[section]}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {(['none', 'read', 'write'] as PermissionLevel[]).map((level) => (
                        <span
                          key={level}
                          className="px-2 py-0.5 rounded text-xs font-label font-medium transition-all"
                          style={{
                            backgroundColor: permissions[section] === level ? PERMISSION_BG[level] : 'transparent',
                            color: permissions[section] === level ? PERMISSION_COLORS[level] : 'var(--color-dashboard-text-secondary)',
                            border: permissions[section] === level ? `1px solid ${PERMISSION_COLORS[level]}30` : '1px solid transparent',
                          }}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={onClose} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={sending} className="flex-1">
              <Send size={16} className="mr-2" />
              {sending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function TransferOwnershipModal({
  collaborator,
  onClose,
  onTransferred,
}: {
  collaborator: Collaborator;
  onClose: () => void;
  onTransferred: () => void;
}) {
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState('');

  const handleTransfer = async () => {
    setTransferring(true);
    setError('');
    try {
      const res = await fetch(`/api/collaborators/${collaborator.id}/transfer-ownership`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to transfer ownership');
      }
      onTransferred();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>
            Transfer Ownership
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-black/5">
            <X size={20} style={{ color: 'var(--color-dashboard-text-secondary)' }} />
          </button>
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg text-sm font-body mb-4" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#ffdad615', border: '1px solid #ffdad640' }}>
          <p className="text-sm font-body" style={{ color: 'var(--color-dashboard-text)' }}>
            You are about to transfer ownership to <strong>{collaborator.name}</strong>. You will become a partner with full access. This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" onClick={onClose} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button type="button" onClick={handleTransfer} disabled={transferring} variant="danger" className="flex-1">
            <ArrowRightLeft size={16} className="mr-2" />
            {transferring ? 'Transferring...' : 'Confirm Transfer'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function PermissionMatrix({ permissions, readOnly }: { permissions: TenantPermissions; readOnly?: boolean }) {
  const sections = Object.keys(SECTION_LABELS) as (keyof TenantPermissions)[];

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--color-dashboard-border)' }}>
        <div className="flex items-center gap-2">
          <Shield size={18} style={{ color: '#d4af37' }} />
          <h3 className="font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>
            Permission Matrix
          </h3>
        </div>
        <p className="font-body text-sm mt-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
          {readOnly ? 'Current permission levels' : 'Section access by role'}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-dashboard-border)' }}>
              <th className="px-6 py-3 text-left font-label text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                Section
              </th>
              <th className="px-4 py-3 text-center font-label text-xs font-semibold uppercase tracking-wider" style={{ color: '#d4af37' }}>
                Level
              </th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section, i) => (
              <tr
                key={section}
                style={{ borderBottom: i < sections.length - 1 ? '1px solid var(--color-dashboard-border)' : undefined }}
              >
                <td className="px-6 py-2.5 font-body text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                  {SECTION_LABELS[section]}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <PermissionDot level={permissions[section]} />
                    <span className="font-body text-xs capitalize" style={{ color: PERMISSION_COLORS[permissions[section]] }}>
                      {permissions[section]}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 flex items-center gap-4" style={{ borderTop: '1px solid var(--color-dashboard-border)' }}>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#16a34a' }} />
          <span className="font-body text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Write</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#d4af37' }} />
          <span className="font-body text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Read</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#6b7280' }} />
          <span className="font-body text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>None</span>
        </div>
      </div>
    </Card>
  );
}

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState<Collaborator | null>(null);
  const [transferTarget, setTransferTarget] = useState<Collaborator | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [collabRes, inviteRes] = await Promise.all([
        fetch('/api/collaborators', { credentials: 'include' }),
        fetch('/api/collaborators/invitations', { credentials: 'include' }),
      ]);
      if (!collabRes.ok) throw new Error('Failed to load collaborators');
      const collabData = await collabRes.json();
      setCollaborators(Array.isArray(collabData) ? collabData : collabData.data ?? []);
      if (inviteRes.ok) {
        const inviteData = await inviteRes.json();
        setInvitations(Array.isArray(inviteData) ? inviteData : inviteData.data ?? []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemove = async (collab: Collaborator) => {
    if (!confirm(`Remove ${collab.name} from your team?`)) return;
    try {
      const res = await fetch(`/api/collaborators/${collab.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to remove collaborator');
      setCollaborators((prev) => prev.filter((c) => c.id !== collab.id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to remove collaborator');
    }
  };

  const handleResendInvite = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/collaborators/invitations/${invitationId}/resend`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to resend invitation');
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === invitationId ? { ...inv, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() } : inv))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to resend invitation');
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    if (!confirm('Revoke this invitation?')) return;
    try {
      const res = await fetch(`/api/collaborators/invitations/${invitationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to revoke invitation');
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to revoke invitation');
    }
  };

  const countPermissions = (permissions: TenantPermissions) =>
    Object.values(permissions).filter((p) => p !== 'none').length;

  const pendingInvites = invitations.filter((inv) => inv.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
          <p className="text-sm font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Loading collaborators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collaborators"
        description="Manage your wedding team and permissions"
        actions={
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus size={16} className="mr-2" />
            Invite Collaborator
          </Button>
        }
      />

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl text-sm font-body" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
          <AlertCircle size={16} />
          {error}
          <button onClick={fetchData} className="ml-auto font-semibold underline">Retry</button>
        </div>
      )}

      {collaborators.length === 0 && !error && (
        <Card className="p-12 text-center">
          <Users size={40} className="mx-auto mb-4" style={{ color: '#d4af37' }} />
          <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
            No collaborators yet
          </h3>
          <p className="font-body text-sm mt-1 mb-4" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            Invite planners, family, and friends to help with your wedding
          </p>
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus size={16} className="mr-2" />
            Invite Your First Collaborator
          </Button>
        </Card>
      )}

      {collaborators.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collaborators.map((collab) => {
            const permCount = countPermissions(collab.permissions);
            return (
              <Card key={collab.id} className="p-5 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm"
                      style={{
                        backgroundColor: ROLE_CONFIG[collab.role]?.bg ?? '#6b728020',
                        color: ROLE_CONFIG[collab.role]?.color ?? '#6b7280',
                      }}
                    >
                      {collab.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold truncate" style={{ color: 'var(--color-dashboard-text)' }}>
                        {collab.name}
                      </h3>
                      <RoleBadge role={collab.role} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {collab.role === 'partner' && (
                      <button
                        onClick={() => setTransferTarget(collab)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-black/5"
                        style={{ color: '#d4af37' }}
                        title="Transfer ownership"
                      >
                        <ArrowRightLeft size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(collab)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                      style={{ color: '#e74c3c' }}
                      title="Remove collaborator"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    <Mail size={14} className="shrink-0" />
                    <span className="truncate">{collab.email}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-dashboard-border)' }}>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(collab.permissions) as (keyof TenantPermissions)[])
                      .filter((s) => collab.permissions[s] !== 'none')
                      .slice(0, 3)
                      .map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded text-xs font-label"
                          style={{
                            backgroundColor: 'var(--color-dashboard-border)',
                            color: 'var(--color-dashboard-text-secondary)',
                          }}
                        >
                          {SECTION_LABELS[s]}
                        </span>
                      ))}
                    {permCount > 3 && (
                      <span
                        className="px-2 py-0.5 rounded text-xs font-label"
                        style={{ backgroundColor: '#d4af3720', color: '#d4af37' }}
                      >
                        +{permCount - 3} more
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedCollab(selectedCollab?.id === collab.id ? null : collab)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-black/5"
                    style={{ color: '#d4af37' }}
                    title="View permissions"
                  >
                    <Shield size={14} />
                  </button>
                </div>

                {selectedCollab?.id === collab.id && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-dashboard-border)' }}>
                    <PermissionMatrix permissions={collab.permissions} readOnly />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {pendingInvites.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-lg flex items-center gap-2" style={{ color: 'var(--color-dashboard-text)' }}>
            <Clock size={18} style={{ color: '#d4af37' }} />
            Pending Invitations ({pendingInvites.length})
          </h2>
          <div className="space-y-2">
            {pendingInvites.map((inv) => {
              const isExpired = new Date(inv.expiresAt) < new Date();
              return (
                <Card key={inv.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#d4af3718' }}
                      >
                        <Mail size={16} style={{ color: '#d4af37' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-sm font-medium truncate" style={{ color: 'var(--color-dashboard-text)' }}>
                          {inv.email}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <RoleBadge role={inv.role} />
                          {isExpired ? (
                            <span className="text-xs font-label" style={{ color: '#ba1a1a' }}>Expired</span>
                          ) : (
                            <span className="text-xs font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                              Expires {new Date(inv.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!isExpired && (
                        <button
                          onClick={() => handleResendInvite(inv.id)}
                          className="p-2 rounded-lg transition-colors hover:bg-black/5"
                          style={{ color: '#d4af37' }}
                          title="Resend invitation"
                        >
                          <RefreshCw size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleRevokeInvite(inv.id)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: '#e74c3c' }}
                        title="Revoke invitation"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onInvited={fetchData} />}
      {transferTarget && (
        <TransferOwnershipModal
          collaborator={transferTarget}
          onClose={() => setTransferTarget(null)}
          onTransferred={fetchData}
        />
      )}
    </div>
  );
}
