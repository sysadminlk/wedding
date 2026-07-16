'use client';

import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const FLAGS: Record<string, string> = {
  en: '🇬🇧', si: '🇱🇰', ta: '🇱🇰', fr: '🇫🇷', de: '🇩🇪', es: '🇪🇸', pt: '🇵🇹', ja: '🇯🇵', zh: '🇨🇳', ko: '🇰🇷', ar: '🇸🇦', hi: '🇮🇳', th: '🇹🇭', vi: '🇻🇳', nl: '🇳🇱',
};

export default function LanguageSwitcher() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [current, setCurrent] = useState('en');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await fetch('/api/languages/enabled', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const list = (data.data ?? data) as { code: string; name: string }[];
          setLanguages(list.map((l) => ({ ...l, flag: FLAGS[l.code] ?? '🌐' })));
        }
      } catch {
        setLanguages([{ code: 'en', name: 'English', flag: '🇬🇧' }]);
      }
    };
    fetchLanguages();
    const saved = localStorage.getItem('preferredLanguage');
    if (saved) setCurrent(saved);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setCurrent(code);
    localStorage.setItem('preferredLanguage', code);
    setOpen(false);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: code } }));
  };

  const currentLang = languages.find((l) => l.code === current) ?? { code: 'en', name: 'English', flag: '🇬🇧' };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 hover:shadow-luxury"
        style={{
          borderColor: 'var(--color-dashboard-border)',
          backgroundColor: 'var(--color-dashboard-surface)',
          color: 'var(--color-dashboard-text)',
        }}
      >
        <Globe size={16} style={{ color: '#d4af37' }} />
        <span className="text-sm">{currentLang.flag}</span>
        <span className="font-label text-xs font-semibold uppercase">{currentLang.code}</span>
        <ChevronDown size={14} style={{ color: 'var(--color-dashboard-text-secondary)', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-luxury-lg z-50 overflow-hidden"
          style={{ borderColor: 'var(--color-dashboard-border)', backgroundColor: 'var(--color-dashboard-surface)' }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-black/5"
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-body text-sm flex-1" style={{ color: 'var(--color-dashboard-text)' }}>
                {lang.name}
              </span>
              {lang.code === current && (
                <Check size={14} style={{ color: '#d4af37' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
