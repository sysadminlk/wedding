'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Shield, Users, Crown, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TenantPermissions } from '@/types';

interface InviteDetails {
  id: string;
  email: string;
  role: string;
  permissions: TenantPermissions;
  inviterName: string;
  tenantName: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
}

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
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

const PERMISSION_COLORS: Record<string, string> = {
  write: '#16a34a',
  read: '#d4af37',
  none: '#6b7280',
};

export default function InviteAcceptPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const res = await fetch(`/api/public/invite/${token}`, { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Invalid or expired invitation');
        }
        const data = await res.json();
        setInvite(data);
        if (data.status !== 'pending') {
          setError(
            data.status === 'accepted'
              ? 'This invitation has already been accepted.'
              : data.status === 'expired'
              ? 'This invitation has expired. Please ask for a new one.'
              : 'This invitation has been revoked.'
          );
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const user = await res.json();
          setUserId(user.id);
        }
      } catch {
      } finally {
        setAuthChecked(true);
      }
    };

    fetchInvite();
    checkAuth();
  }, [token]);

  const handleAccept = async () => {
    if (!userId) {
      router.push(`/register?invite=${token}`);
      return;
    }
    setAccepting(true);
    try {
      const res = await fetch(`/api/public/invite/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to accept invitation');
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setAccepting(false);
    }
  };

  const roleConfig = invite ? ROLE_LABELS[invite.role] : null;
  const grantedSections = invite
    ? (Object.keys(invite.permissions) as (keyof TenantPermissions)[]).filter(
        (s) => invite.permissions[s] !== 'none'
      )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-auth-bg)' }}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: '#d4af37' }} />
          <p className="text-sm font-body" style={{ color: 'var(--color-auth-text-secondary)' }}>
            Loading invitation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-auth-bg)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold gold-text">WeddingHub</h1>
          <p className="text-xs font-label uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--color-auth-text-secondary)' }}>
            Luxury Wedding Planning
          </p>
        </div>

        <Card className="p-8">
          {error ? (
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#ffdad620' }}
              >
                <AlertCircle size={28} style={{ color: '#ba1a1a' }} />
              </div>
              <h2 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--color-auth-text)' }}>
                Invitation Error
              </h2>
              <p className="font-body text-sm mb-6" style={{ color: 'var(--color-auth-text-secondary)' }}>
                {error}
              </p>
              <Button
                variant="secondary"
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          ) : invite && (
            <div className="space-y-6">
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: roleConfig?.bg ?? '#6b728020' }}
                >
                  <Users size={28} style={{ color: roleConfig?.color ?? '#6b7280' }} />
                </div>
                <h2 className="font-heading font-bold text-lg mb-1" style={{ color: 'var(--color-auth-text)' }}>
                  You&apos;re Invited!
                </h2>
                <p className="font-body text-sm" style={{ color: 'var(--color-auth-text-secondary)' }}>
                  <strong style={{ color: 'var(--color-auth-text)' }}>{invite.inviterName}</strong> has invited you to collaborate on
                </p>
                <p className="font-heading font-bold text-base mt-1" style={{ color: '#d4af37' }}>
                  {invite.tenantName}
                </p>
              </div>

              <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: 'var(--color-auth-input-bg)', border: '1px solid var(--color-auth-border)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-label text-xs uppercase tracking-wider" style={{ color: 'var(--color-auth-text-secondary)' }}>
                    Role
                  </span>
                  {roleConfig && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-label font-semibold"
                      style={{ backgroundColor: roleConfig.bg, color: roleConfig.color }}
                    >
                      {invite.role === 'partner' && <Crown size={12} />}
                      {roleConfig.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label text-xs uppercase tracking-wider" style={{ color: 'var(--color-auth-text-secondary)' }}>
                    Permissions
                  </span>
                  <span className="font-body text-sm font-medium" style={{ color: 'var(--color-auth-text)' }}>
                    {grantedSections.length} sections
                  </span>
                </div>
              </div>

              {grantedSections.length > 0 && (
                <div>
                  <p className="font-label text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-auth-text-secondary)' }}>
                    Section Access
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {grantedSections.slice(0, 8).map((s) => (
                      <div
                        key={s}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-body"
                        style={{ backgroundColor: 'var(--color-auth-input-bg)', border: '1px solid var(--color-auth-border)' }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: PERMISSION_COLORS[invite.permissions[s]] }}
                        />
                        <span style={{ color: 'var(--color-auth-text)' }}>{SECTION_LABELS[s]}</span>
                      </div>
                    ))}
                    {grantedSections.length > 8 && (
                      <div
                        className="flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-label"
                        style={{ backgroundColor: '#d4af3718', color: '#d4af37' }}
                      >
                        +{grantedSections.length - 8} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 space-y-3">
                <Button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full font-label uppercase tracking-wider text-xs"
                >
                  {accepting ? (
                    'Accepting...'
                  ) : userId ? (
                    <>
                      <CheckCircle2 size={16} className="mr-2" />
                      Accept Invitation
                    </>
                  ) : (
                    <>
                      <Shield size={16} className="mr-2" />
                      Sign Up & Accept
                    </>
                  )}
                </Button>
                {!userId && authChecked && (
                  <p className="text-center text-sm font-body" style={{ color: 'var(--color-auth-text-secondary)' }}>
                    Already have an account?{' '}
                    <a href={`/login?invite=${token}`} className="font-medium" style={{ color: 'var(--color-auth-accent)' }}>
                      Sign in
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
