# Design System — Atelier

## Philosophy

weddingWire doesn't look like a SaaS template. It looks like a private studio.
- **Calm > colourful**
- **Typography-led** (Playfair Display + system sans-serif)
- **Warm, editorial feel** — ivory, espresso, brushed gold

## Color Palettes

### 1. Brand Surface (Dashboard, Sidebar)

```css
--color-bg-primary: #2C1810;       /* dark espresso */
--color-bg-secondary: #3D2317;     /* slightly lighter */
--color-bg-tertiary: #4A2E1F;
--color-text-primary: #F5F0EB;     /* warm ivory */
--color-text-secondary: #C4A882;   /* brushed gold */
--color-text-muted: #8B7355;
--color-border: #4A2E1F;
--color-accent: #C4A882;           /* brushed gold */
--color-accent-hover: #D4B892;
```

### 2. Auth & Guest Pages (Warm Ivory)

```css
--color-auth-bg: #FDF8F3;          /* warm ivory */
--color-auth-surface: #FFFFFF;
--color-auth-text: #2C1810;        /* dark espresso */
--color-auth-text-secondary: #6B5B4E;
--color-auth-accent: #C4A882;      /* brushed gold */
--color-auth-border: #E8DDD0;
--color-auth-input-bg: #F5F0EB;
--color-auth-input-border: #D4C5B3;
```

### 3. Dashboard (Light Mode)

```css
--color-dashboard-bg: #FAFAFA;
--color-dashboard-surface: #FFFFFF;
--color-dashboard-text: #1A1A1A;
--color-dashboard-text-secondary: #6B7280;
--color-dashboard-border: #E5E5E5;
--color-dashboard-accent: #C4A882;
--color-dashboard-success: #10B981;
--color-dashboard-warning: #F59E0B;
--color-dashboard-error: #EF4444;
```

### 4. Dashboard (Dark Mode)

```css
--color-dashboard-bg: #111111;
--color-dashboard-surface: #1A1A1A;
--color-dashboard-text: #F5F5F5;
--color-dashboard-text-secondary: #9CA3AF;
--color-dashboard-border: #333333;
--color-dashboard-accent: #C4A882;
--color-dashboard-success: #34D399;
--color-dashboard-warning: #FBBF24;
--color-dashboard-error: #F87171;
```

## Typography

### Font Stack

```css
--font-heading: 'Playfair Display', Georgia, 'Times New Roman', serif;
--font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
--font-mono: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;
```

### Scale

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

### Usage

- **Headings:** Playfair Display, scale 2xl–6xl, font-weight 700
- **Body:** System sans-serif, scale base–lg, font-weight 400
- **Labels:** System sans-serif, scale sm, font-weight 500
- **Captions:** System sans-serif, scale xs, font-weight 400, muted color

## Spacing & Layout

### Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

## Component Tokens

### Buttons

```css
--btn-primary-bg: #C4A882;          /* brushed gold */
--btn-primary-text: #2C1810;        /* dark espresso */
--btn-primary-hover: #D4B892;
--btn-secondary-bg: transparent;
--btn-secondary-text: #C4A882;
--btn-secondary-border: #C4A882;
--btn-danger-bg: #EF4444;
--btn-danger-text: #FFFFFF;
```

### Cards

```css
--card-bg: #FFFFFF;
--card-border: #E5E5E5;
--card-shadow: var(--shadow-md);
--card-radius: var(--radius-lg);
--card-padding: var(--space-6);
```

### Forms

```css
--input-bg: #FFFFFF;
--input-border: #D4C5B3;
--input-focus-border: #C4A882;
--input-focus-ring: rgba(196, 168, 130, 0.3);
--input-label: #2C1810;
--input-placeholder: #9CA3AF;
--input-error: #EF4444;
```

## CSS Architecture

### Global Tokens (globals.css)

```css
/* All tokens defined here — single source of truth */
:root {
  /* Import from theme files or define inline */
  @import './themes/light.css';
}

/* Dark mode override */
html.dark {
  @import './themes/dark.css';
}
```

### Theme Files

```
web/src/styles/
├── globals.css           # CSS reset + token imports
├── themes/
│   ├── light.css         # Light mode tokens
│   ├── dark.css          # Dark mode tokens
│   └── public/
│       ├── atelier.css   # Public site: Atelier theme
│       ├── rose.css      # Public site: Rose theme
│       ├── garden.css    # Public site: Garden theme
│       ├── minimal.css   # Public site: Minimal theme
│       ├── luxe.css      # Public site: Luxe theme
│       └── coastal.css   # Public site: Coastal theme
```

### Tailwind Integration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        espresso: {
          DEFAULT: '#2C1810',
          light: '#3D2317',
          lighter: '#4A2E1F',
        },
        ivory: {
          DEFAULT: '#FDF8F3',
          dark: '#F5F0EB',
        },
        gold: {
          DEFAULT: '#C4A882',
          light: '#D4B892',
          dark: '#B3976F',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
};
```

## Public Site Themes (6)

Each theme defines a complete token set:

```css
/* Theme: Rose */
[data-theme="rose"] {
  --color-primary: #E8B4B8;
  --color-secondary: #F5E6E8;
  --color-accent: #D4868C;
  --color-bg: #FDF2F4;
  --color-text: #4A3540;
  --font-heading: 'Playfair Display', serif;
  --hero-bg: linear-gradient(135deg, #F5E6E8, #FFFFFF);
  --hero-text: #4A3540;
}

/* Theme: Garden */
[data-theme="garden"] {
  --color-primary: #5B8C5A;
  --color-secondary: #E8F5E3;
  --color-accent: #3D6B3C;
  --color-bg: #F5FAF4;
  --color-text: #2D3A2C;
  --font-heading: 'Playfair Display', serif;
  --hero-bg: linear-gradient(135deg, #E8F5E3, #FFFFFF);
  --hero-text: #2D3A2C;
}

/* Theme: Luxe */
[data-theme="luxe"] {
  --color-primary: #1A1A1A;
  --color-secondary: #2C2C2C;
  --color-accent: #C4A882;
  --color-bg: #0A0A0A;
  --color-text: #F5F0EB;
  --font-heading: 'Playfair Display', serif;
  --hero-bg: linear-gradient(135deg, #0A0A0A, #1A1A1A);
  --hero-text: #F5F0EB;
}
```

## Landing Page Designs (10)

Admin-switchable marketing site front pages:

| Design     | Hero Style          | Layout            |
|------------|---------------------|-------------------|
| Atelier    | Large type, ivory   | Single column     |
| Ivory      | Warm photo bg       | Centered text     |
| Cinema     | Full-width image    | Overlay text      |
| Split      | Two-column          | Text + image      |
| Editorial  | Magazine spread     | Asymmetric grid   |
| Minimal    | White space         | Centered minimal  |
| Gilded     | Gold gradient       | Luxurious centered|
| Folio      | Image grid          | Portfolio layout  |
| Portrait   | Large couple photo  | Centered portrait |
| Deco       | Geometric pattern   | Art deco frame    |

## Mobile Theme

Flutter uses the same color tokens via Dart theme:

```dart
// AtelierTheme in lib/config/theme.dart
// Mirrors CSS variables from web
static const Color espresso = Color(0xFF2C1810);
static const Color ivory = Color(0xFFFDF8F3);
static const Color gold = Color(0xFFC4A882);
```

## Responsive Breakpoints

```css
--breakpoint-sm: 640px;    /* Mobile landscape */
--breakpoint-md: 768px;    /* Tablet */
--breakpoint-lg: 1024px;   /* Desktop */
--breakpoint-xl: 1280px;   /* Large desktop */
--breakpoint-2xl: 1536px;  /* Extra large */
```

## Iconography

- Use Lucide React icons (web) / Lucide Flutter icons (mobile)
- Consistent sizing: 16px (sm), 20px (md), 24px (lg), 32px (xl)
- Stroke width: 1.5px (light), 2px (medium)
