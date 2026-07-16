'use client';

import { useState, useEffect, useCallback } from 'react';

interface TranslationMap {
  [key: string]: string;
}

const ENGLISH_FALLBACK: TranslationMap = {};

let cachedTranslations: TranslationMap | null = null;
let cachedLanguage: string | null = null;

async function loadTranslations(language: string): Promise<TranslationMap> {
  if (cachedLanguage === language && cachedTranslations) return cachedTranslations;
  try {
    const res = await fetch(`/api/languages/${language}/translations`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      const list = (data.data ?? data) as { key: string; value: string }[];
      const map: TranslationMap = {};
      list.forEach((t) => { map[t.key] = t.value; });
      cachedTranslations = map;
      cachedLanguage = language;
      return map;
    }
  } catch {}
  return ENGLISH_FALLBACK;
}

interface TranslatedTextProps {
  name: string;
  fallback?: string;
  className?: string;
}

export function TranslatedText({ name, fallback, className }: TranslatedTextProps) {
  const [text, setText] = useState<string>(fallback ?? name);

  const resolve = useCallback(async () => {
    const preferred = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') ?? 'en' : 'en';
    if (preferred === 'en') {
      setText(fallback ?? name);
      return;
    }
    const translations = await loadTranslations(preferred);
    if (translations[name]) {
      setText(translations[name]);
    } else if (ENGLISH_FALLBACK[name]) {
      setText(ENGLISH_FALLBACK[name]);
    } else {
      setText(fallback ?? name);
    }
  }, [name, fallback]);

  useEffect(() => {
    resolve();
    const handler = () => resolve();
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, [resolve]);

  return <span className={className}>{text}</span>;
}
