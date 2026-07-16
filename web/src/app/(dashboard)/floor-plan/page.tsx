'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Table2,
  Music,
  Wine,
  Save,
  Trash2,
  Undo2,
  Plus,
  Circle,
  Square,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface FloorPlanElement {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'circle' | 'rectangle';
  capacity: number;
  type: 'table' | 'danceFloor' | 'bar';
}

interface FloorPlanData {
  tables: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    shape: 'circle' | 'rectangle';
    capacity: number;
  }>;
  danceFloor?: { x: number; y: number; width: number; height: number };
  bar?: { x: number; y: number; width: number; height: number };
}

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 20;
const GOLD = '#d4af37';
const GOLD_LIGHT = 'rgba(212, 175, 55, 0.15)';
const GOLD_MED = 'rgba(212, 175, 55, 0.3)';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function snapToGrid(val: number) {
  return Math.round(val / GRID_SIZE) * GRID_SIZE;
}

export default function FloorPlanPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<FloorPlanElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nextTableNum, setNextTableNum] = useState(1);

  const selected = elements.find(e => e.id === selectedId) || null;

  const loadFloorPlan = useCallback(async () => {
    try {
      const res = await fetch('/api/floor-plan');
      if (res.ok) {
        const data: FloorPlanData = await res.json();
        const loaded: FloorPlanElement[] = [];
        let maxNum = 0;
        (data.tables || []).forEach(t => {
          loaded.push({ ...t, type: 'table' as const });
          const num = parseInt(t.name.replace(/\D/g, ''), 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        });
        if (data.danceFloor) {
          loaded.push({
            id: generateId(),
            name: 'Dance Floor',
            ...data.danceFloor,
            shape: 'rectangle',
            capacity: 0,
            type: 'danceFloor',
          });
        }
        if (data.bar) {
          loaded.push({
            id: generateId(),
            name: 'Bar',
            ...data.bar,
            shape: 'rectangle',
            capacity: 0,
            type: 'bar',
          });
        }
        setElements(loaded);
        setNextTableNum(maxNum + 1);
      }
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFloorPlan();
  }, [loadFloorPlan]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    ctx.scale(dpr, dpr);

    const scaleX = displayW / CANVAS_WIDTH;
    const scaleY = displayH / CANVAS_HEIGHT;

    ctx.clearRect(0, 0, displayW, displayH);

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, displayW, displayH);

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.06)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x * scaleX, 0);
      ctx.lineTo(x * scaleX, displayH);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y * scaleY);
      ctx.lineTo(displayW, y * scaleY);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, displayW - 1, displayH - 1);

    elements.forEach(el => {
      const sx = el.x * scaleX;
      const sy = el.y * scaleY;
      const sw = el.width * scaleX;
      const sh = el.height * scaleY;
      const isSelected = el.id === selectedId;

      if (el.type === 'danceFloor') {
        ctx.fillStyle = isSelected ? 'rgba(180, 80, 220, 0.3)' : 'rgba(180, 80, 220, 0.15)';
        ctx.strokeStyle = isSelected ? '#b450dc' : 'rgba(180, 80, 220, 0.5)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(sx, sy, sw, sh, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#b450dc';
        ctx.font = `${11 * Math.min(scaleX, scaleY)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.name, sx + sw / 2, sy + sh / 2);
        return;
      }

      if (el.type === 'bar') {
        ctx.fillStyle = isSelected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)';
        ctx.strokeStyle = isSelected ? '#3b82f6' : 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(sx, sy, sw, sh, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#3b82f6';
        ctx.font = `${11 * Math.min(scaleX, scaleY)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.name, sx + sw / 2, sy + sh / 2);
        return;
      }

      if (el.shape === 'circle') {
        const cx = sx + sw / 2;
        const cy = sy + sh / 2;
        const r = Math.min(sw, sh) / 2;
        ctx.fillStyle = isSelected ? GOLD_MED : GOLD_LIGHT;
        ctx.strokeStyle = isSelected ? '#e9c349' : GOLD;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = GOLD;
        ctx.font = `bold ${10 * Math.min(scaleX, scaleY)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.name, cx, cy - 5 * scaleY);
        ctx.font = `${8 * Math.min(scaleX, scaleY)}px sans-serif`;
        ctx.fillStyle = 'rgba(212, 175, 55, 0.6)';
        ctx.fillText(`${el.capacity} seats`, cx, cy + 7 * scaleY);
      } else {
        ctx.fillStyle = isSelected ? GOLD_MED : GOLD_LIGHT;
        ctx.strokeStyle = isSelected ? '#e9c349' : GOLD;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.roundRect(sx, sy, sw, sh, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = GOLD;
        ctx.font = `bold ${10 * Math.min(scaleX, scaleY)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.name, sx + sw / 2, sy + sh / 2 - 5 * scaleY);
        ctx.font = `${8 * Math.min(scaleX, scaleY)}px sans-serif`;
        ctx.fillStyle = 'rgba(212, 175, 55, 0.6)';
        ctx.fillText(`${el.capacity} seats`, sx + sw / 2, sy + sh / 2 + 7 * scaleY);
      }

      if (isSelected) {
        ctx.strokeStyle = '#e9c349';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        const pad = 4;
        ctx.strokeRect(sx - pad, sy - pad, sw + pad * 2, sh + pad * 2);
        ctx.setLineDash([]);
      }
    });
  }, [elements, selectedId]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    const handleResize = () => drawCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const hitTest = (x: number, y: number): FloorPlanElement | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) {
        return el;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const hit = hitTest(x, y);
    if (hit) {
      setSelectedId(hit.id);
      setDragging(true);
      setDragOffset({ x: x - hit.x, y: y - hit.y });
    } else {
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !selectedId) return;
    const { x, y } = getCanvasCoords(e);
    const newX = snapToGrid(x - dragOffset.x);
    const newY = snapToGrid(y - dragOffset.y);
    setElements(prev =>
      prev.map(el =>
        el.id === selectedId
          ? { ...el, x: Math.max(0, Math.min(CANVAS_WIDTH - el.width, newX)), y: Math.max(0, Math.min(CANVAS_HEIGHT - el.height, newY)) }
          : el
      )
    );
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const addTable = (shape: 'circle' | 'rectangle') => {
    const w = shape === 'circle' ? 80 : 140;
    const h = shape === 'circle' ? 80 : 50;
    const el: FloorPlanElement = {
      id: generateId(),
      name: `Table ${nextTableNum}`,
      x: snapToGrid(CANVAS_WIDTH / 2 - w / 2),
      y: snapToGrid(CANVAS_HEIGHT / 2 - h / 2),
      width: w,
      height: h,
      shape,
      capacity: shape === 'circle' ? 8 : 10,
      type: 'table',
    };
    setElements(prev => [...prev, el]);
    setNextTableNum(n => n + 1);
    setSelectedId(el.id);
  };

  const addDanceFloor = () => {
    const el: FloorPlanElement = {
      id: generateId(),
      name: 'Dance Floor',
      x: snapToGrid(CANVAS_WIDTH / 2 - 100),
      y: snapToGrid(CANVAS_HEIGHT / 2 + 60),
      width: 200,
      height: 120,
      shape: 'rectangle',
      capacity: 0,
      type: 'danceFloor',
    };
    setElements(prev => [...prev, el]);
    setSelectedId(el.id);
  };

  const addBar = () => {
    const el: FloorPlanElement = {
      id: generateId(),
      name: 'Bar',
      x: snapToGrid(CANVAS_WIDTH - 160),
      y: snapToGrid(20),
      width: 120,
      height: 50,
      shape: 'rectangle',
      capacity: 0,
      type: 'bar',
    };
    setElements(prev => [...prev, el]);
    setSelectedId(el.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setElements(prev => prev.filter(e => e.id !== selectedId));
    setSelectedId(null);
  };

  const updateSelected = (field: string, value: string | number) => {
    if (!selectedId) return;
    setElements(prev =>
      prev.map(el =>
        el.id === selectedId ? { ...el, [field]: value } : el
      )
    );
  };

  const saveFloorPlan = async () => {
    setSaving(true);
    try {
      const tables = elements
        .filter(e => e.type === 'table')
        .map(({ id, name, x, y, width, height, shape, capacity }) => ({
          id, name, x, y, width, height, shape, capacity,
        }));
      const danceFloorEl = elements.find(e => e.type === 'danceFloor');
      const barEl = elements.find(e => e.type === 'bar');
      const data: FloorPlanData = {
        tables,
        ...(danceFloorEl && {
          danceFloor: {
            x: danceFloorEl.x,
            y: danceFloorEl.y,
            width: danceFloorEl.width,
            height: danceFloorEl.height,
          },
        }),
        ...(barEl && {
          bar: {
            x: barEl.x,
            y: barEl.y,
            width: barEl.width,
            height: barEl.height,
          },
        }),
      };
      await fetch('/api/floor-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const totalSeats = elements
    .filter(e => e.type === 'table')
    .reduce((acc, t) => acc + t.capacity, 0);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-dashboard-surface)' }}>
      <PageHeader
        title="Floor Plan"
        description="Design and visualize your wedding venue layout"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={saveFloorPlan}
            disabled={saving}
            loading={saving}
            style={{ backgroundColor: '#d4af37' }}
          >
            <Save size={14} className="mr-1.5" />
            Save
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-4">
          <Card className="overflow-hidden">
            <div
              className="flex items-center gap-2 border-b px-5 py-3 flex-wrap"
              style={{ borderColor: 'var(--color-dashboard-border)' }}
            >
              <span
                className="font-label text-xs font-semibold mr-2"
                style={{ color: 'var(--color-dashboard-text-secondary)' }}
              >
                Add:
              </span>
              <Button variant="ghost" size="sm" onClick={() => addTable('circle')}>
                <Circle size={14} className="mr-1.5" style={{ color: '#d4af37' }} />
                Round Table
              </Button>
              <Button variant="ghost" size="sm" onClick={() => addTable('rectangle')}>
                <Square size={14} className="mr-1.5" style={{ color: '#d4af37' }} />
                Rect Table
              </Button>
              <Button variant="ghost" size="sm" onClick={addDanceFloor}>
                <Music size={14} className="mr-1.5" style={{ color: '#b450dc' }} />
                Dance Floor
              </Button>
              <Button variant="ghost" size="sm" onClick={addBar}>
                <Wine size={14} className="mr-1.5" style={{ color: '#3b82f6' }} />
                Bar
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={deleteSelected} disabled={!selected}>
                <Trash2 size={14} className="mr-1.5" style={{ color: '#dc2626' }} />
                Delete
              </Button>
            </div>

            {loading ? (
              <div
                className="flex h-96 items-center justify-center"
                style={{ color: 'var(--color-dashboard-text-secondary)' }}
              >
                <p className="font-body text-sm">Loading floor plan...</p>
              </div>
            ) : (
              <div style={{ backgroundColor: '#1a1a1a' }}>
                <canvas
                  ref={canvasRef}
                  className="w-full cursor-crosshair"
                  style={{ height: '500px' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
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
              Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-body text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Tables
                </span>
                <span className="font-label text-sm font-medium" style={{ color: 'var(--color-dashboard-text)' }}>
                  {elements.filter(e => e.type === 'table').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Total Seats
                </span>
                <span className="font-label text-sm font-medium" style={{ color: 'var(--color-dashboard-text)' }}>
                  {totalSeats}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Dance Floor
                </span>
                <span className="font-label text-sm font-medium" style={{ color: 'var(--color-dashboard-text)' }}>
                  {elements.some(e => e.type === 'danceFloor') ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Bar
                </span>
                <span className="font-label text-sm font-medium" style={{ color: 'var(--color-dashboard-text)' }}>
                  {elements.some(e => e.type === 'bar') ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </Card>

          {selected && (
            <Card className="p-5">
              <h3
                className="font-heading text-sm font-semibold mb-4"
                style={{ color: 'var(--color-dashboard-text)' }}
              >
                Properties
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-medium font-label"
                    style={{ color: 'var(--color-dashboard-text-secondary)' }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={selected.name}
                    onChange={e => updateSelected('name', e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm font-body outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                    style={{
                      borderColor: 'var(--color-dashboard-border)',
                      backgroundColor: 'var(--color-dashboard-surface)',
                      color: 'var(--color-dashboard-text)',
                    }}
                  />
                </div>

                {selected.type === 'table' && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="text-xs font-medium font-label"
                        style={{ color: 'var(--color-dashboard-text-secondary)' }}
                      >
                        Capacity
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={selected.capacity}
                        onChange={e => updateSelected('capacity', Math.max(1, parseInt(e.target.value) || 1))}
                        className="rounded-lg border px-3 py-2 text-sm font-body outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                        style={{
                          borderColor: 'var(--color-dashboard-border)',
                          backgroundColor: 'var(--color-dashboard-surface)',
                          color: 'var(--color-dashboard-text)',
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="text-xs font-medium font-label"
                        style={{ color: 'var(--color-dashboard-text-secondary)' }}
                      >
                        Shape
                      </label>
                      <select
                        value={selected.shape}
                        onChange={e => {
                          const shape = e.target.value as 'circle' | 'rectangle';
                          if (shape === 'circle') {
                            updateSelected('shape', 'circle');
                            updateSelected('width', 80);
                            updateSelected('height', 80);
                          } else {
                            updateSelected('shape', 'rectangle');
                            updateSelected('width', 140);
                            updateSelected('height', 50);
                          }
                        }}
                        className="rounded-lg border px-3 py-2 text-sm font-body outline-none focus:ring-2"
                        style={{
                          borderColor: 'var(--color-dashboard-border)',
                          backgroundColor: 'var(--color-dashboard-surface)',
                          color: 'var(--color-dashboard-text)',
                        }}
                      >
                        <option value="circle">Round</option>
                        <option value="rectangle">Rectangle</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                      X
                    </label>
                    <input
                      type="number"
                      value={selected.x}
                      onChange={e => updateSelected('x', snapToGrid(parseInt(e.target.value) || 0))}
                      className="rounded-lg border px-3 py-2 text-sm font-body outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                      style={{
                        borderColor: 'var(--color-dashboard-border)',
                        backgroundColor: 'var(--color-dashboard-surface)',
                        color: 'var(--color-dashboard-text)',
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                      Y
                    </label>
                    <input
                      type="number"
                      value={selected.y}
                      onChange={e => updateSelected('y', snapToGrid(parseInt(e.target.value) || 0))}
                      className="rounded-lg border px-3 py-2 text-sm font-body outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                      style={{
                        borderColor: 'var(--color-dashboard-border)',
                        backgroundColor: 'var(--color-dashboard-surface)',
                        color: 'var(--color-dashboard-text)',
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                      Width
                    </label>
                    <input
                      type="number"
                      min={20}
                      value={selected.width}
                      onChange={e => updateSelected('width', Math.max(20, parseInt(e.target.value) || 20))}
                      className="rounded-lg border px-3 py-2 text-sm font-body outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                      style={{
                        borderColor: 'var(--color-dashboard-border)',
                        backgroundColor: 'var(--color-dashboard-surface)',
                        color: 'var(--color-dashboard-text)',
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                      Height
                    </label>
                    <input
                      type="number"
                      min={20}
                      value={selected.height}
                      onChange={e => updateSelected('height', Math.max(20, parseInt(e.target.value) || 20))}
                      className="rounded-lg border px-3 py-2 text-sm font-body outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                      style={{
                        borderColor: 'var(--color-dashboard-border)',
                        backgroundColor: 'var(--color-dashboard-surface)',
                        color: 'var(--color-dashboard-text)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {!selected && (
            <Card className="p-5">
              <h3
                className="font-heading text-sm font-semibold mb-4"
                style={{ color: 'var(--color-dashboard-text)' }}
              >
                Tips
              </h3>
              <div className="space-y-2">
                {[
                  'Click an element to select it',
                  'Drag to reposition elements',
                  'Use the toolbar to add tables, dance floor, or bar',
                  'Edit properties in this panel',
                  'Snap-to-grid keeps everything aligned',
                ].map((tip, i) => (
                  <p key={i} className="font-body text-xs leading-relaxed" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    {tip}
                  </p>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
