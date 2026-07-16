'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Check, Lock, Unlock } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const GATEWAYS = ['PayHere', 'Paystack', 'Flutterwave', 'Razorpay', 'Mollie', 'MercadoPago'] as const;
type Gateway = typeof GATEWAYS[number];

interface GatewayConfig {
  merchantId: string;
  secretKey: string;
  testMode: boolean;
}

interface PaymentConfig {
  enabledGateways: Record<Gateway, boolean>;
  gatewayConfigs: Record<Gateway, GatewayConfig>;
  sandboxMode: boolean;
}

const defaultGatewayConfig: GatewayConfig = { merchantId: '', secretKey: '', testMode: true };

const defaultConfig: PaymentConfig = {
  enabledGateways: Object.fromEntries(GATEWAYS.map((g) => [g, false])) as Record<Gateway, boolean>,
  gatewayConfigs: Object.fromEntries(GATEWAYS.map((g) => [g, { ...defaultGatewayConfig }])) as Record<Gateway, GatewayConfig>,
  sandboxMode: true,
};

export default function PaymentsPage() {
  const [config, setConfig] = useState<PaymentConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeGateway, setActiveGateway] = useState<Gateway>('PayHere');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/payments', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const cfg = data.data ?? data;
          setConfig((prev) => ({ ...prev, ...cfg }));
        }
      } catch {}
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const toggleGateway = (gateway: Gateway) => {
    setConfig((prev) => ({
      ...prev,
      enabledGateways: { ...prev.enabledGateways, [gateway]: !prev.enabledGateways[gateway] },
    }));
  };

  const updateGatewayConfig = (gateway: Gateway, field: keyof GatewayConfig, value: string | boolean) => {
    setConfig((prev) => ({
      ...prev,
      gatewayConfigs: {
        ...prev.gatewayConfigs,
        [gateway]: { ...prev.gatewayConfigs[gateway], [field]: value },
      },
    }));
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
            Loading payment config...
          </p>
        </div>
      </div>
    );
  }

  const inputStyle = {
    borderColor: 'var(--color-dashboard-border)',
    backgroundColor: 'var(--color-dashboard-surface)',
    color: 'var(--color-dashboard-text)',
  };

  const gc = config.gatewayConfigs[activeGateway];

  return (
    <div className="space-y-8">
      <PageHeader title="Payment Gateways" description="Configure payment provider integrations" />

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={18} style={{ color: '#d4af37' }} />
            <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
              Gateways
            </h2>
          </div>
          <button
            onClick={() => setConfig((prev) => ({ ...prev, sandboxMode: !prev.sandboxMode }))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border font-label text-sm font-semibold transition-all duration-200"
            style={{
              borderColor: config.sandboxMode ? '#e6510060' : '#16a34a60',
              backgroundColor: config.sandboxMode ? '#e6510010' : '#16a34a10',
              color: config.sandboxMode ? '#e65100' : '#16a34a',
            }}
          >
            {config.sandboxMode ? <Lock size={14} /> : <Unlock size={14} />}
            {config.sandboxMode ? 'Sandbox' : 'Production'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {GATEWAYS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGateway(g)}
              className="relative px-4 py-2 rounded-xl border font-label text-sm font-semibold transition-all duration-200"
              style={{
                borderColor: activeGateway === g ? '#d4af37' : 'var(--color-dashboard-border)',
                backgroundColor: activeGateway === g ? '#d4af3720' : 'var(--color-dashboard-surface)',
                color: activeGateway === g ? '#d4af37' : 'var(--color-dashboard-text)',
              }}
            >
              {g}
              {config.enabledGateways[g] && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ backgroundColor: '#16a34a' }} />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--color-dashboard-bg)' }}>
          <span className="font-label text-sm font-semibold" style={{ color: 'var(--color-dashboard-text)' }}>
            {activeGateway} Enabled
          </span>
          <button
            onClick={() => toggleGateway(activeGateway)}
            className="relative w-12 h-6 rounded-full transition-colors duration-200"
            style={{ backgroundColor: config.enabledGateways[activeGateway] ? '#16a34a' : 'var(--color-dashboard-border)' }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
              style={{ transform: config.enabledGateways[activeGateway] ? 'translateX(24px)' : 'translateX(0)' }}
            />
          </button>
        </div>

        {config.enabledGateways[activeGateway] && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                Merchant ID
              </label>
              <input
                type="text"
                value={gc.merchantId}
                onChange={(e) => updateGatewayConfig(activeGateway, 'merchantId', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                Secret Key
              </label>
              <input
                type="password"
                value={gc.secretKey}
                onChange={(e) => updateGatewayConfig(activeGateway, 'secretKey', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
                style={inputStyle}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-label text-sm" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                Test Mode
              </span>
              <button
                onClick={() => updateGatewayConfig(activeGateway, 'testMode', !gc.testMode)}
                className="relative w-12 h-6 rounded-full transition-colors duration-200"
                style={{ backgroundColor: gc.testMode ? '#d4af37' : 'var(--color-dashboard-border)' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                  style={{ transform: gc.testMode ? 'translateX(24px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} loading={saving}>
            {saved ? <><Check size={16} className="mr-2" /> Saved</> : 'Save Configuration'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
