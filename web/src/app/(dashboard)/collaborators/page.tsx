'use client';

import { useState } from 'react';
import { UserPlus, Mail, Shield, Trash2, X, Users, Crown } from 'lucide-react';
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

type Role = UserTenant['role'];

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

const PERMISSION_ICON_COLOR: Record<string, string> = {
  write: '#16a34a',
  read: '#d4af37',
  none: '#6b7280',
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

const MOCK_COLLABORATORS: Collaborator[] = [
  {
    id: 'col-1',
    userId: 'u-1',
    tenantId: 't-1',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    role: 'partner',
    permissions: DEFAULT_PERMISSIONS.partner,
    joinedAt: '2026-01-15',
  },
  {
    id: 'col-2',
    userId: 'u-2',
    tenantId: 't-1',
    name: 'James Mitchell',
    email: 'james.mitchell@email.com',
    role: 'partner',
    permissions: DEFAULT_PERMISSIONS.partner,
    joinedAt: '2026-01-15',
  },
  {
    id: 'col-3',
    userId: 'u-3',
    tenantId: 't-1',
    name: 'Elena Torres',
    email: 'elena@weddingplanners.co',
    role: 'planner',
    permissions: DEFAULT_PERMISSIONS.planner,
    joinedAt: '2026-02-01',
  },
  {
    id: 'col-4',
    userId: 'u-4',
    tenantId: 't-1',
    name: 'David Chen',
    email: 'david.chen@email.com',
    role: 'family',
    permissions: DEFAULT_PERMISSIONS.family,
    joinedAt: '2026-03-10',
  },
  {
    id: 'col-5',
    userId: 'u-5',
    tenantId: 't-1',
    name: 'Priya Sharma',
    email: 'priya.s@email.com',
    role: 'friend',
    permissions: DEFAULT_PERMISSIONS.friend,
    joinedAt: '2026-03-22',
  },
  {
    id: 'col-6',
    userId: 'u-6',
    tenantId: 't-1',
    name: 'Marco Benedetti',
    email: 'marco@bflorals.com',
    role: 'vendor',
    permissions: DEFAULT_PERMISSIONS.vendor,
    joinedAt: '2026-04-05',
  },
];

function RoleBadge({ role }: { role: Role }) {
  const config = ROLE_CONFIG[role];
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

function PermissionDot({ level }: { level: 'read' | 'write' | 'none' }) {
  if (level === 'none') {
    return <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#e5e7eb' }} />;
  }
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: PERMISSION_ICON_COLOR[level] }}
      title={level}
    />
  );
}

function InviteForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('friend');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setSent(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#16a34a20' }}>
            <Mail size={24} style={{ color: '#16a34a' }} />
          </div>
          <h3 className="font-heading text-lg font-bold" style={{ color: 'var(--color-dashboard-text)' }}>
            Invitation Sent
          </h3>
          <p className="font-body text-sm mt-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            An invitation has been sent to {email}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading" style={{ color: 'var(--color-dashboard-text)' }}>
            Invite Collaborator
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:bg-black/5">
            <X size={20} style={{ color: 'var(--color-dashboard-text-secondary)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-label mb-1.5" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@email.com"
              className="w-full px-3 py-2.5 rounded-lg border font-body text-sm"
              style={{
                borderColor: 'var(--color-dashboard-border)',
                backgroundColor: 'var(--color-dashboard-surface)',
                color: 'var(--color-dashboard-text)',
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-label mb-1.5" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ROLE_CONFIG) as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="px-3 py-2.5 rounded-lg border font-label text-sm capitalize transition-all"
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
          <Card className="p-3">
            <div className="flex items-start gap-2">
              <Shield size={16} className="mt-0.5 shrink-0" style={{ color: '#d4af37' }} />
              <div>
                <p className="font-label text-xs font-semibold" style={{ color: 'var(--color-dashboard-text)' }}>
                  Default permissions for {ROLE_CONFIG[role].label}
                </p>
                <p className="font-body text-xs mt-0.5" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  {role === 'partner' && 'Full access to all sections. Can manage billing and settings.'}
                  {role === 'planner' && 'Write access to most sections. Read-only on guest memories and gifts.'}
                  {role === 'family' && 'Read access to dashboard, guests, timeline, photos, and more.'}
                  {role === 'friend' && 'Can view timeline, photos, and upload guest memories.'}
                  {role === 'vendor' && 'Limited access to timeline and vendor section only.'}
                </p>
              </div>
            </div>
          </Card>
          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={onClose} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={sending} className="flex-1">
              <UserPlus size={16} className="mr-2" />
              {sending ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function PermissionMatrix({ collaborators }: { collaborators: Collaborator[] }) {
  const roles = Array.from(new Set(collaborators.map((c) => c.role)));
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
          Default section access by role
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-dashboard-border)' }}>
              <th className="px-6 py-3 text-left font-label text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                Section
              </th>
              {roles.map((r) => (
                <th key={r} className="px-4 py-3 text-center font-label text-xs font-semibold uppercase tracking-wider" style={{ color: ROLE_CONFIG[r].color }}>
                  {ROLE_CONFIG[r].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map((section, i) => (
              <tr
                key={section}
                style={{
                  borderBottom: i < sections.length - 1 ? '1px solid var(--color-dashboard-border)' : undefined,
                }}
              >
                <td className="px-6 py-2.5 font-body text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                  {SECTION_LABELS[section]}
                </td>
                {roles.map((r) => {
                  const collab = collaborators.find((c) => c.role === r);
                  const level = collab?.permissions[section] ?? 'none';
                  return (
                    <td key={r} className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <PermissionDot level={level} />
                        <span className="font-body text-xs capitalize" style={{ color: PERMISSION_ICON_COLOR[level] }}>
                          {level}
                        </span>
                      </div>
                    </td>
                  );
                })}
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
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#e5e7eb' }} />
          <span className="font-body text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>None</span>
        </div>
      </div>
    </Card>
  );
}

export default function CollaboratorsPage() {
  const [collaborators] = useState<Collaborator[]>(MOCK_COLLABORATORS);
  const [showInvite, setShowInvite] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  const handleRemove = (id: string) => {
    if (confirm('Remove this collaborator?')) {
      return;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collaborators"
        description="Invite and manage your wedding team"
        actions={
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus size={16} className="mr-2" />
            Invite Collaborator
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collaborators.map((collab) => (
          <Card key={collab.id} className="p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm"
                  style={{
                    backgroundColor: ROLE_CONFIG[collab.role].bg,
                    color: ROLE_CONFIG[collab.role].color,
                  }}
                >
                  {collab.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold truncate" style={{ color: 'var(--color-dashboard-text)' }}>
                    {collab.name}
                  </h3>
                  <RoleBadge role={collab.role} />
                </div>
              </div>
              <button
                onClick={() => handleRemove(collab.id)}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                style={{ color: '#e74c3c' }}
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                <Mail size={14} className="shrink-0" />
                <span className="truncate">{collab.email}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 flex flex-wrap gap-1.5" style={{ borderTop: '1px solid var(--color-dashboard-border)' }}>
              {(Object.keys(collab.permissions) as (keyof TenantPermissions)[])
                .filter((s) => collab.permissions[s] !== 'none')
                .slice(0, 4)
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
              {Object.values(collab.permissions).filter((p) => p !== 'none').length > 4 && (
                <span
                  className="px-2 py-0.5 rounded text-xs font-label"
                  style={{ backgroundColor: '#d4af3720', color: '#d4af37' }}
                >
                  +{Object.values(collab.permissions).filter((p) => p !== 'none').length - 4} more
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Button variant="secondary" onClick={() => setShowMatrix(!showMatrix)} className="w-full">
        <Shield size={16} className="mr-2" />
        {showMatrix ? 'Hide' : 'Show'} Permission Matrix
      </Button>

      {showMatrix && <PermissionMatrix collaborators={collaborators} />}

      {showInvite && <InviteForm onClose={() => setShowInvite(false)} />}
    </div>
  );
}
