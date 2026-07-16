'use client';

import { useState, useEffect } from 'react';
import { Languages, Plus, Search, Download, Upload, Check, X, Edit3 } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Language {
  code: string;
  name: string;
  enabled: boolean;
}

interface TranslationEntry {
  key: string;
  value: string;
}

const SECTIONS = ['All', 'Dashboard', 'Guests', 'Budget', 'Checklist', 'Vendors', 'Menu', 'Photos', 'RSVP'];

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [editingLang, setEditingLang] = useState<string | null>(null);
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSection, setFilterSection] = useState('All');

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await fetch('/api/admin/languages', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const list = data.data ?? data;
          setLanguages(Array.isArray(list) ? list : []);
        }
      } catch {}
      setLoading(false);
    };
    fetchLanguages();
  }, []);

  const toggleLanguage = async (code: string) => {
    setLanguages((prev) => prev.map((l) => (l.code === code ? { ...l, enabled: !l.enabled } : l)));
  };

  const handleAddLanguage = () => {
    if (newCode.trim() && newName.trim()) {
      setLanguages((prev) => [...prev, { code: newCode.trim().toLowerCase(), name: newName.trim(), enabled: true }]);
      setNewCode('');
      setNewName('');
      setShowAdd(false);
    }
  };

  const handleEditTranslations = async (code: string) => {
    setEditingLang(code);
    try {
      const res = await fetch(`/api/admin/languages/${code}/translations`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const list = data.data ?? data;
        setTranslations(Array.isArray(list) ? list : []);
      }
    } catch {
      setTranslations([]);
    }
  };

  const handleSaveTranslations = async () => {
    if (!editingLang) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/admin/languages/${editingLang}/translations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ translations }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const updateTranslation = (index: number, field: 'key' | 'value', val: string) => {
    setTranslations((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: val } : t)));
  };

  const addTranslation = () => setTranslations((prev) => [...prev, { key: '', value: '' }]);

  const removeTranslation = (index: number) => setTranslations((prev) => prev.filter((_, i) => i !== index));

  const filteredTranslations = translations.filter((t) => {
    const matchesSearch = !searchQuery || t.key.toLowerCase().includes(searchQuery.toLowerCase()) || t.value.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            Loading languages...
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Languages"
        description="Manage translations and language settings"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Download size={14} className="mr-2" />
              Export
            </Button>
            <Button variant="secondary" size="sm">
              <Upload size={14} className="mr-2" />
              Import
            </Button>
          </div>
        }
      />

      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages size={18} style={{ color: '#d4af37' }} />
            <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
              Enabled Languages
            </h2>
          </div>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={14} className="mr-2" />
            Add Language
          </Button>
        </div>

        {showAdd && (
          <div className="flex items-end gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-dashboard-bg)' }}>
            <div className="flex-1">
              <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                Code
              </label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="fr"
                className="w-full px-3 py-2 rounded-xl border font-body text-sm"
                style={inputStyle}
              />
            </div>
            <div className="flex-1">
              <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="French"
                className="w-full px-3 py-2 rounded-xl border font-body text-sm"
                style={inputStyle}
              />
            </div>
            <Button size="sm" onClick={handleAddLanguage}>Add</Button>
          </div>
        )}

        <div className="space-y-2">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="flex items-center justify-between p-4 rounded-xl border"
              style={{ borderColor: 'var(--color-dashboard-border)' }}
            >
              <div className="flex items-center gap-3">
                <span className="font-body text-sm font-bold uppercase" style={{ color: '#d4af37' }}>
                  {lang.code}
                </span>
                <span className="font-body text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                  {lang.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => handleEditTranslations(lang.code)}>
                  <Edit3 size={14} className="mr-1" />
                  Translations
                </Button>
                <button
                  onClick={() => toggleLanguage(lang.code)}
                  className="relative w-12 h-6 rounded-full transition-colors duration-200"
                  style={{ backgroundColor: lang.enabled ? '#16a34a' : 'var(--color-dashboard-border)' }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                    style={{ transform: lang.enabled ? 'translateX(24px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {editingLang && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 size={18} style={{ color: '#d4af37' }} />
              <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
                Translations — {editingLang.toUpperCase()}
              </h2>
            </div>
            <button onClick={() => setEditingLang(null)} className="p-1.5 rounded-lg transition-colors hover:bg-black/5">
              <X size={20} style={{ color: 'var(--color-dashboard-text-secondary)' }} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-dashboard-text-secondary)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search translations..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border font-body text-sm"
                style={inputStyle}
              />
            </div>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="px-4 py-2 rounded-xl border font-body text-sm"
              style={inputStyle}
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTranslations.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={t.key}
                  onChange={(e) => updateTranslation(i, 'key', e.target.value)}
                  placeholder="key"
                  className="flex-1 px-3 py-2 rounded-xl border font-body text-sm"
                  style={inputStyle}
                />
                <input
                  type="text"
                  value={t.value}
                  onChange={(e) => updateTranslation(i, 'value', e.target.value)}
                  placeholder="Translation"
                  className="flex-1 px-3 py-2 rounded-xl border font-body text-sm"
                  style={inputStyle}
                />
                <button onClick={() => removeTranslation(i)} className="p-2 rounded-lg hover:bg-black/5">
                  <X size={14} style={{ color: '#ba1a1a' }} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={addTranslation}>
              <Plus size={14} className="mr-1" />
              Add Key
            </Button>
            <Button size="sm" onClick={handleSaveTranslations} loading={saving}>
              {saved ? <><Check size={14} className="mr-2" /> Saved</> : 'Save Translations'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
