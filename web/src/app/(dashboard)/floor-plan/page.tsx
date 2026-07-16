'use client';

import { useState, useEffect } from 'react';
import { Box, Maximize, Grid3X3, Save, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Table {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  seats: number;
}

interface FloorPlan {
  id: string;
  name: string;
  width: number;
  height: number;
  tables: Table[];
}

const DEMO_TABLES: Table[] = [
  { id: '1', name: 'Table 1', x: 40, y: 60, width: 80, height: 80, seats: 8 },
  { id: '2', name: 'Table 2', x: 180, y: 60, width: 80, height: 80, seats: 8 },
  { id: '3', name: 'Table 3', x: 320, y: 60, width: 80, height: 80, seats: 8 },
  { id: '4', name: 'Table 4', x: 460, y: 60, width: 80, height: 80, seats: 8 },
  { id: '5', name: 'Head Table', x: 180, y: 240, width: 200, height: 50, seats: 10 },
  { id: '6', name: 'Table 6', x: 40, y: 240, width: 80, height: 80, seats: 8 },
  { id: '7', name: 'Table 7', x: 460, y: 240, width: 80, height: 80, seats: 8 },
];

export default function FloorPlanPage() {
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFloorPlan();
  }, []);

  async function fetchFloorPlan() {
    try {
      const res = await fetch('/api/floor-plan');
      if (res.ok) {
        const data = await res.json();
        setFloorPlan(data);
        setTables(data.tables ?? []);
      } else {
        setFloorPlan(null);
        setTables(DEMO_TABLES);
      }
    } catch {
      setFloorPlan(null);
      setTables(DEMO_TABLES);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch('/api/floor-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: floorPlan?.name ?? 'Wedding Floor Plan',
          width: 600,
          height: 400,
          tables,
        }),
      });
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setTables(DEMO_TABLES);
  }

  const totalSeats = tables.reduce((acc, t) => acc + t.seats, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="3D Floor Plan"
        description="Design and visualize your wedding venue layout"
      />

      <div
        className="rounded-lg border p-4"
        style={{
          backgroundColor: 'var(--color-dashboard-surface)',
          borderColor: 'var(--color-dashboard-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)' }}
          >
            <Box size={18} style={{ color: '#d4af37' }} />
          </div>
          <div>
            <p
              className="font-label text-sm font-semibold"
              style={{ color: 'var(--color-dashboard-text)' }}
            >
              Coming Soon
            </p>
            <p
              className="font-body text-xs"
              style={{ color: 'var(--color-dashboard-text-secondary)' }}
            >
              Full 3D editing with React Three Fiber is under construction.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div
              className="flex items-center justify-between border-b px-5 py-3"
              style={{ borderColor: 'var(--color-dashboard-border)' }}
            >
              <h3
                className="font-heading text-sm font-semibold"
                style={{ color: 'var(--color-dashboard-text)' }}
              >
                2D Preview
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw size={14} className="mr-1.5" />
                  Reset
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSave} disabled={saving}>
                  <Save size={14} className="mr-1.5" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            {loading ? (
              <div
                className="flex h-80 items-center justify-center"
                style={{ color: 'var(--color-dashboard-text-secondary)' }}
              >
                <p className="font-body text-sm">Loading floor plan...</p>
              </div>
            ) : (
              <div className="relative overflow-auto" style={{ backgroundColor: '#1a1a1a' }}>
                <svg
                  viewBox="0 0 600 400"
                  className="h-full w-full"
                  style={{ minHeight: '320px' }}
                >
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="rgba(212, 175, 55, 0.06)"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>

                  <rect width="600" height="400" fill="url(#grid)" />

                  <rect
                    x="1"
                    y="1"
                    width="598"
                    height="398"
                    rx="4"
                    fill="none"
                    stroke="rgba(212, 175, 55, 0.2)"
                    strokeWidth="1"
                  />

                  {tables.map((table) => {
                    const isHead = table.name.toLowerCase().includes('head');
                    return (
                      <g key={table.id}>
                        <rect
                          x={table.x}
                          y={table.y}
                          width={table.width}
                          height={table.height}
                          rx={isHead ? 4 : table.width / 2}
                          fill={isHead ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.1)'}
                          stroke="#d4af37"
                          strokeWidth="1.5"
                        />
                        <text
                          x={table.x + table.width / 2}
                          y={table.y + table.height / 2 - 4}
                          textAnchor="middle"
                          fill="#d4af37"
                          fontSize="10"
                          fontFamily="var(--font-label)"
                        >
                          {table.name}
                        </text>
                        <text
                          x={table.x + table.width / 2}
                          y={table.y + table.height / 2 + 10}
                          textAnchor="middle"
                          fill="rgba(212, 175, 55, 0.5)"
                          fontSize="8"
                          fontFamily="var(--font-body)"
                        >
                          {table.seats} seats
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3
              className="font-heading text-sm font-semibold mb-4"
              style={{ color: 'var(--color-dashboard-text)' }}
            >
              Floor Plan Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className="font-body text-xs"
                  style={{ color: 'var(--color-dashboard-text-secondary)' }}
                >
                  Tables
                </span>
                <span
                  className="font-label text-sm font-medium"
                  style={{ color: 'var(--color-dashboard-text)' }}
                >
                  {tables.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="font-body text-xs"
                  style={{ color: 'var(--color-dashboard-text-secondary)' }}
                >
                  Total Seats
                </span>
                <span
                  className="font-label text-sm font-medium"
                  style={{ color: 'var(--color-dashboard-text)' }}
                >
                  {totalSeats}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="font-body text-xs"
                  style={{ color: 'var(--color-dashboard-text-secondary)' }}
                >
                  Status
                </span>
                <span
                  className="font-label text-xs font-medium rounded-full px-2 py-0.5"
                  style={{
                    color: '#d4af37',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  }}
                >
                  {floorPlan ? 'Saved' : 'Demo Mode'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3
              className="font-heading text-sm font-semibold mb-4"
              style={{ color: 'var(--color-dashboard-text)' }}
            >
              What&apos;s Coming
            </h3>
            <div className="space-y-3">
              <ComingSoonFeature
                icon={<Maximize size={14} />}
                title="Room Editor"
                description="Resize and shape your venue with drag-and-drop walls and doors"
              />
              <ComingSoonFeature
                icon={<Grid3X3 size={14} />}
                title="Table Placement"
                description="Drag tables into position with snap-to-grid and collision detection"
              />
              <ComingSoonFeature
                icon={<Box size={14} />}
                title="3D Guest View"
                description="Walk through your venue in full 3D with React Three Fiber"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ComingSoonFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
      >
        <span style={{ color: '#d4af37' }}>{icon}</span>
      </div>
      <div>
        <p
          className="font-label text-xs font-semibold"
          style={{ color: 'var(--color-dashboard-text)' }}
        >
          {title}
        </p>
        <p
          className="font-body text-xs mt-0.5 leading-relaxed"
          style={{ color: 'var(--color-dashboard-text-secondary)' }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
