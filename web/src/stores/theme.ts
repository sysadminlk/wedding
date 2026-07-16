import { create } from 'zustand';

interface ThemeState {
  dark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  dark: typeof window !== 'undefined' ? localStorage.getItem('theme') === 'dark' : false,
  toggle: () =>
    set((state) => {
      const next = !state.dark;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', next ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', next);
      }
      return { dark: next };
    }),
  setDark: (dark) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', dark);
    }
    set({ dark });
  },
}));
