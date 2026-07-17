'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Check,
  Crown,
  Zap,
  Building2,
  AlertCircle,
  FileText,
  X,
  TrendingUp,
  Users,
  ImageIcon,
  Video,
  UtensilsCrossed,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BillingSubscription, BillingUsage, Invoice, PlanDefinition } from '@/types';

const PLANS: PlanDefinition[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Up to 50 guests',
      '100 photos',
      '20 guest memories',
      '15 menu items',
      '5 crew members',
      'Basic templates',
      'Public website',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 2500,
    popular: true,
    features: [
      'Up to 300 guests',
      '2,000 photos',
      '200 guest memories',
      '100 menu items',
      '30 crew members',
      'All templates & themes',
      'Email & SMS invites',
      'Priority support',
      'Custom branding',
    ],
  },
  {
    id: 'planner',
    name: 'Planner',
    price: 7500,
    features: [
      'Unlimited guests',
      'Unlimited photos',
      'Unlimited memories',
      'Unlimited menu items',
      'Unlimited crew members',
      'All Premium features',
      'Multi-wedding management',
      'White-label dashboard',
      'API access',
      'Dedicated account manager',
    ],
  },
];

const USAGE_LIMITS: Record<string, { free: number; premium: number; planner: number }> = {
  guests: { free: 50, premium: 300, planner: 999999 },
  photos: { free: 100, premium: 2000, planner: 999999 },
  memories: { free: 20, premium: 200, planner: 999999 },
  menuItems: { free: 15, premium: 100, planner: 999999 },
  crewMembers: { free: 5, premium: 30, planner: 999999 },
};

const USAGE_META: Record<string, { label: string; icon: React.ReactNode }> = {
  guests: { label: 'Guests', icon: <Users size={16} /> },
  photos: { label: 'Photos', icon: <ImageIcon size={16} /> },
  memories: { label: 'Guest Memories', icon: <Video size={16} /> },
  menuItems: { label: 'Menu Items', icon: <UtensilsCrossed size={16} /> },
  crewMembers: { label: 'Crew Members', icon: <UserCheck size={16} /> },
};

const PLAN_ICON: Record<string, React.ReactNode> = {
  free: <CreditCard size={20} />,
  premium: <Crown size={20} />,
  planner: <Building2 size={20} />,
};

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return { bg: '#d4af3720', color: '#d4af37' };
    case 'cancelled':
      return { bg: '#ba1a1a20', color: '#ba1a1a' };
    case 'past_due':
      return { bg: '#e6510020', color: '#e65100' };
    case 'trialing':
      return { bg: '#16a34a20', color: '#16a34a' };
    default:
      return { bg: '#6b728020', color: '#6b7280' };
  }
}

function getUsageBarColor(percent: number) {
  if (percent >= 90) return '#ba1a1a';
  if (percent >= 60) return '#d4af37';
  return '#16a34a';
}

function getInvoiceStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return { bg: '#16a34a20', color: '#16a34a', label: 'Completed' };
    case 'pending':
      return { bg: '#d4af3720', color: '#d4af37', label: 'Pending' };
    case 'failed':
      return { bg: '#ba1a1a20', color: '#ba1a1a', label: 'Failed' };
    default:
      return { bg: '#6b728020', color: '#6b7280', label: status };
  }
}

function UsageBar({ usage, type, plan }: { usage: BillingUsage; type: string; plan: string }) {
  const meta = USAGE_META[type];
  const limit = USAGE_LIMITS[type]?.[plan as keyof typeof USAGE_LIMITS[string]] ?? 999999;
  const current = usage[type as keyof BillingUsage]?.current ?? 0;
  const effectiveLimit = Math.min(limit, current > limit ? current : limit);
  const percent = effectiveLimit >= 999999 ? 0 : Math.min((current / effectiveLimit) * 100, 100);
  const barColor = getUsageBarColor(percent);
  const isUnlimited = effectiveLimit >= 999999;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color: '#d4af37' }}>{meta.icon}</span>
          <span className="font-label text-sm font-semibold" style={{ color: 'var(--color-dashboard-text)' }}>
            {meta.label}
          </span>
        </div>
        <span className="font-body text-sm" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
          {current.toLocaleString()}{isUnlimited ? '' : ` / ${effectiveLimit.toLocaleString()}`}
        </span>
      </div>
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-dashboard-border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: isUnlimited ? `${Math.min((current / 100) * 100, 100)}%` : `${percent}%`,
            backgroundColor: isUnlimited ? '#16a34a' : barColor,
            minWidth: current > 0 ? '8px' : '0px',
          }}
        />
      </div>
    </div>
  );
}

function CancelModal({ onClose, onConfirm, loading }: { onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>
            Cancel Subscription
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-black/5">
            <X size={20} style={{ color: 'var(--color-dashboard-text-secondary)' }} />
          </button>
        </div>
        <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#ffdad615', border: '1px solid #ffdad640' }}>
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" style={{ color: '#ba1a1a' }} />
            <div>
              <p className="font-body text-sm font-medium" style={{ color: 'var(--color-dashboard-text)' }}>
                Are you sure you want to cancel?
              </p>
              <p className="font-body text-sm mt-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                You will lose access to all Premium features at the end of your current billing period. Your data will be preserved but usage limits will revert to Free tier.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Keep Plan
          </Button>
          <Button onClick={onConfirm} variant="danger" loading={loading} className="flex-1">
            Cancel Subscription
          </Button>
        </div>
      </Card>
    </div>
  );
}

function PlanCard({
  plan,
  currentPlan,
  onSelect,
  isUpgrade,
}: {
  plan: PlanDefinition;
  currentPlan: string;
  onSelect: () => void;
  isUpgrade: boolean;
}) {
  const isCurrent = plan.id === currentPlan;

  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-200 ${
        plan.popular && !isCurrent ? 'ring-2' : ''
      }`}
      style={{
        backgroundColor: 'var(--color-dashboard-surface)',
        borderColor: isCurrent ? '#d4af37' : plan.popular ? '#d4af3760' : 'var(--color-dashboard-border)',
        ...(plan.popular && !isCurrent ? { ringColor: '#d4af37' } : {}),
      }}
    >
      {plan.popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-label font-bold uppercase tracking-wider"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #e9c349 50%, #d4af37 100%)',
            color: '#1c1b1b',
          }}
        >
          Most Popular
        </div>
      )}

      <div className="mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
          style={{
            backgroundColor: isCurrent ? '#d4af3720' : 'var(--color-dashboard-border)',
            color: isCurrent ? '#d4af37' : 'var(--color-dashboard-text-secondary)',
          }}
        >
          {PLAN_ICON[plan.id]}
        </div>
        <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
          {plan.name}
        </h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>
            {plan.price === 0 ? 'Free' : `LKR ${plan.price.toLocaleString()}`}
          </span>
          {plan.price > 0 && (
            <span className="font-body text-sm" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              /month
            </span>
          )}
        </div>
      </div>

      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check size={16} className="shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
            <span className="font-body text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div
          className="w-full py-2.5 rounded-xl text-center font-label font-semibold text-sm"
          style={{ backgroundColor: '#d4af3720', color: '#d4af37' }}
        >
          Current Plan
        </div>
      ) : (
        <Button
          variant={plan.popular ? 'primary' : 'secondary'}
          className="w-full"
          onClick={onSelect}
        >
          {isUpgrade ? (
            <>
              <Zap size={16} className="mr-2" />
              Upgrade
            </>
          ) : (
            'Downgrade'
          )}
        </Button>
      )}
    </div>
  );
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null);
  const [usage, setUsage] = useState<BillingUsage | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [subRes, usageRes, invoiceRes] = await Promise.all([
        fetch('/api/billing/subscription', { credentials: 'include' }),
        fetch('/api/billing/usage', { credentials: 'include' }),
        fetch('/api/billing/invoices', { credentials: 'include' }),
      ]);
      if (!subRes.ok) throw new Error('Failed to load subscription');
      const subData = await subRes.json();
      setSubscription(subData.data ?? subData);
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData.data ?? usageData);
      }
      if (invoiceRes.ok) {
        const invoiceData = await invoiceRes.json();
        const list = invoiceData.data ?? invoiceData;
        setInvoices(Array.isArray(list) ? list : list.content ?? []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubscribe = async (planId: string) => {
    setSubscribing(true);
    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: planId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to start subscription');
      }
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        fetchData();
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to start subscription');
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch('/api/billing/cancel', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to cancel subscription');
      }
      setShowCancel(false);
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    setSubscribing(true);
    try {
      const res = await fetch('/api/billing/plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: planId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to change plan');
      }
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        fetchData();
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to change plan');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            Loading billing information...
          </p>
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.plan ?? 'free';
  const statusStyle = subscription ? getStatusColor(subscription.status) : { bg: '#6b728020', color: '#6b7280' };
  const usageData = usage ?? {
    guests: { current: 0, limit: 0 },
    photos: { current: 0, limit: 0 },
    memories: { current: 0, limit: 0 },
    menuItems: { current: 0, limit: 0 },
    crewMembers: { current: 0, limit: 0 },
  };

  const planOrder: Record<string, number> = { free: 0, premium: 1, planner: 2 };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing & Subscription"
        description="Manage your plan, usage, and payment history"
      />

      {error && (
        <div
          className="flex items-center gap-2 p-4 rounded-xl text-sm font-body"
          style={{ backgroundColor: '#ffdad6', color: '#93000a' }}
        >
          <AlertCircle size={16} />
          {error}
          <button onClick={fetchData} className="ml-auto font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {subscription && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#d4af3720', color: '#d4af37' }}
              >
                <CreditCard size={20} />
              </div>
              <div>
                <p className="font-label text-xs uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Current Plan
                </p>
                <p className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
                  {PLANS.find((p) => p.id === currentPlan)?.name ?? 'Free'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
              >
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="font-label text-xs uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Status
                </p>
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-xs font-label font-semibold capitalize"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                >
                  {subscription.status}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-dashboard-border)', color: 'var(--color-dashboard-text-secondary)' }}
              >
                <FileText size={20} />
              </div>
              <div>
                <p className="font-label text-xs uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Monthly Cost
                </p>
                <p className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
                  {subscription.price === 0 ? 'Free' : `LKR ${subscription.price.toLocaleString()}`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-dashboard-border)', color: 'var(--color-dashboard-text-secondary)' }}
              >
                <ExternalLink size={20} />
              </div>
              <div>
                <p className="font-label text-xs uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Next Billing
                </p>
                <p className="font-heading font-bold text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                  {subscription.nextBillingDate
                    ? new Date(subscription.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={18} style={{ color: '#d4af37' }} />
          <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
            Usage
          </h2>
        </div>
        <div className="space-y-5">
          {Object.keys(USAGE_META).map((type) => (
            <UsageBar key={type} usage={usageData} type={type} plan={currentPlan} />
          ))}
        </div>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Crown size={18} style={{ color: '#d4af37' }} />
          <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
            Plans
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              onSelect={() => {
                if (planOrder[plan.id] > planOrder[currentPlan]) {
                  handleSubscribe(plan.id);
                } else {
                  handleChangePlan(plan.id);
                }
              }}
              isUpgrade={planOrder[plan.id] > planOrder[currentPlan]}
            />
          ))}
        </div>
      </div>

      {currentPlan !== 'free' && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowCancel(true)}
            className="font-label text-sm font-medium transition-colors hover:underline"
            style={{ color: '#ba1a1a' }}
          >
            Cancel Subscription
          </button>
        </div>
      )}

      {invoices.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--color-dashboard-border)' }}>
            <div className="flex items-center gap-2">
              <FileText size={18} style={{ color: '#d4af37' }} />
              <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
                Invoice History
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-dashboard-border)' }}>
                  <th className="px-6 py-3 text-left font-label text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    Date
                  </th>
                  <th className="px-6 py-3 text-left font-label text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left font-label text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left font-label text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-label text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    Gateway
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, i) => {
                  const badge = getInvoiceStatusBadge(invoice.status);
                  return (
                    <tr
                      key={invoice.id}
                      style={{ borderBottom: i < invoices.length - 1 ? '1px solid var(--color-dashboard-border)' : undefined }}
                    >
                      <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                        {new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-3 font-body text-sm capitalize" style={{ color: 'var(--color-dashboard-text)' }}>
                        {invoice.plan}
                      </td>
                      <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                        {invoice.currency} {invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-label font-semibold"
                          style={{ backgroundColor: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-body text-sm capitalize" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                        {invoice.gateway}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showCancel && <CancelModal onClose={() => setShowCancel(false)} onConfirm={handleCancel} loading={cancelling} />}
    </div>
  );
}
