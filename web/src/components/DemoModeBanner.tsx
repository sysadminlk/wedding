'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DemoModeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkDemo = async () => {
      try {
        const res = await fetch('/api/demo/status', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.demoMode) setVisible(true);
        }
      } catch {}
    };
    checkDemo();
  }, []);

  if (!visible) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-label font-semibold z-50"
      style={{ backgroundColor: '#f59e0b', color: '#1c1b1b' }}
    >
      <AlertTriangle size={16} />
      Demo Mode — Data resets daily. Some features are read-only.
    </div>
  );
}
