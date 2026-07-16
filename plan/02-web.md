# Web — Next.js App Router

## Tech Stack

| Component        | Choice                    | Notes                           |
|------------------|---------------------------|---------------------------------|
| Framework        | Next.js 14+ (App Router)  | Server Components by default    |
| Language         | TypeScript                | Strict mode                     |
| Styling          | Tailwind CSS              | + CSS variables for Atelier     |
| State            | Zustand or React Query    | For client-side server state    |
| Forms            | React Hook Form + Zod     | Validation shared with backend  |
| 3D               | React Three Fiber         | 3D floor plan editor            |
| PDF/Excel        | Client-side download      | Triggered from backend export   |
| Auth             | JWT in httpOnly cookies   | No client-side token storage    |
| Testing          | Vitest + Playwright       | Unit + E2E                      |

## Project Layout

```
web/
├── src/
│   ├── app/                      # App Router pages
│   │   ├── (auth)/               # Login, register, verify-email
│   │   ├── (dashboard)/          # Authenticated layout
│   │   │   ├── layout.tsx        # Sidebar, topbar, theme provider
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── checklist/
│   │   │   ├── budget/
│   │   │   ├── guests/
│   │   │   ├── seating/
│   │   │   ├── floor-plan/       # 3D editor
│   │   │   ├── vendors/
│   │   │   ├── crew/
│   │   │   ├── timeline/
│   │   │   ├── inspiration/
│   │   │   ├── menu/
│   │   │   ├── photos/
│   │   │   ├── memories/
│   │   │   ├── website/
│   │   │   ├── rsvp/
│   │   │   ├── email-templates/
│   │   │   ├── collaborators/
│   │   │   ├── billing/
│   │   │   └── settings/
│   │   ├── (public)/             # No auth required
│   │   │   ├── w/[slug]/         # Public wedding site
│   │   │   ├── share/[slug]/     # Guest page
│   │   │   └── landing/          # Landing page designs
│   │   ├── install/              # Web installer wizard
│   │   ├── admin/                # Admin panel
│   │   │   ├── landing/
│   │   │   ├── branding/
│   │   │   ├── email/
│   │   │   ├── storage/
│   │   │   ├── oauth/
│   │   │   ├── payments/
│   │   │   └── languages/
│   │   └── api/                  # Next.js API routes (proxy to backend)
│   ├── components/
│   │   ├── ui/                   # Design system primitives
│   │   ├── layout/               # Sidebar, topbar, page shells
│   │   ├── charts/               # Budget donut, dashboard widgets
│   │   ├── tables/               # Sortable, filterable data tables
│   │   ├── forms/                # Reusable form fields
│   │   ├── floor-plan/           # 3D scene, table models, controls
│   │   ├── gallery/              # Photo grid, video player, upload
│   │   └── export/               # PDF/Excel download buttons
│   ├── hooks/                    # Custom React hooks
│   ├── lib/
│   │   ├── api.ts                # Backend API client
│   │   ├── auth.ts               # Auth helpers, JWT cookie mgmt
│   │   ├── s3.ts                 # Presigned URL helpers
│   │   ├── export.ts             # PDF/Excel download triggers
│   │   └── utils.ts              # Date formatting, currency, etc.
│   ├── stores/                   # Zustand stores (if used)
│   ├── types/                    # TypeScript types (shared schema)
│   └── styles/
│       ├── globals.css           # CSS variables, Atelier tokens
│       └── themes/               # light.css, dark.css
├── public/                       # Static assets
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── Dockerfile
```

## Key Routes

| Path                      | Auth | Description                          |
|---------------------------|------|--------------------------------------|
| `/`                       | Yes  | Dashboard (redirect from `/`)        |
| `/checklist`              | Yes  | Task list with phases                |
| `/budget`                 | Yes  | Budget tracker with donut chart      |
| `/guests`                 | Yes  | Guest list, RSVP tracking            |
| `/seating`                | Yes  | Drag-and-drop seating chart          |
| `/floor-plan`             | Yes  | 3D room editor (React Three Fiber)   |
| `/vendors`                | Yes  | Vendor comparison table              |
| `/crew`                   | Yes  | Wedding crew roster                  |
| `/timeline`               | Yes  | Day-of schedule editor               |
| `/inspiration`            | Yes  | Mood board grid                      |
| `/menu`                   | Yes  | Menu page carousel manager           |
| `/photos`                 | Yes  | Guest photo gallery                  |
| `/memories`               | Yes  | Video/voice guestbook                |
| `/website`                | Yes  | Public website editor                |
| `/rsvp`                   | Yes  | RSVP page customizer                 |
| `/email-templates`        | Yes  | Email template editor with preview   |
| `/collaborators`          | Yes  | Invite & manage collaborators        |
| `/billing`                | Yes  | Plan & payment management            |
| `/settings`               | Yes  | Wedding settings                     |
| `/w/[slug]`               | No   | Public wedding site (6 themes)       |
| `/share/[slug]`           | No   | Guest page (tabbed)                  |
| `/install`                | No   | 4-step web installer                 |
| `/admin/*`                | Admin| Admin panel                          |

## Guest Page Tabs (`/share/[slug]`)

Single-page tabbed layout:
1. **Seat Finder** — search input → result card with table name + floor plan highlight
2. **Gallery** — photo/video grid (upload button, write-only)
3. **Menu** — carousel of uploaded menu pages (tap-to-zoom)
4. **Gifts** — gift cards + cash fund links
5. **Memory** — video/voice recorder (MediaRecorder API) or file upload

## 3D Floor Plan Editor

- React Three Fiber scene with orbit controls
- Drag-and-drop table placement
- Table models: round (8-10), rectangular (6-8), head table
- Room walls, dance floor, DJ booth, bar, décor elements
- Capacity counter per table and total
- Export as image (canvas screenshot)
- 2D fallback for mobile view

## Design System Implementation

### CSS Variables (Atelier)

```css
:root {
  /* Brand surface */
  --color-bg-primary: #2C1810;       /* dark espresso */
  --color-bg-secondary: #3D2317;
  --color-text-primary: #F5F0EB;     /* warm ivory */
  --color-text-secondary: #C4A882;   /* brushed gold */

  /* Auth/Guest pages */
  --color-auth-bg: #FDF8F3;          /* warm ivory */
  --color-auth-surface: #FFFFFF;
  --color-auth-accent: #C4A882;      /* brushed gold */

  /* Dashboard */
  --color-dashboard-bg: #FAFAFA;
  --color-dashboard-surface: #FFFFFF;
  --color-dashboard-text: #1A1A1A;
  --color-dashboard-border: #E5E5E5;

  /* Typography */
  --font-heading: 'Playfair Display', serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Spacing, radius, shadows */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
}
```

### Theme Switching

- Light/dark toggle via CSS class on `<html>`
- Dashboard always uses dashboard palette
- Auth/guest pages use warm ivory palette
- Public site themes (Atelier, Rose, Garden, Minimal, Luxe, Coastal) override tokens

## Component Patterns

### Data Tables

```tsx
// Reusable sortable/filterable table
<DataTable
  columns={columns}
  data={guests}
  pagination={{ page, size, total }}
  onPageChange={handlePageChange}
  onSort={handleSort}
  actions={[
    { label: 'Export PDF', onClick: exportPDF },
    { label: 'Export Excel', onClick: exportExcel },
  ]}
/>
```

### Form Pattern

```tsx
// React Hook Form + Zod validation
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  side: z.enum(['bride', 'groom', 'mutual']),
});

function GuestForm({ onSubmit }: Props) {
  const form = useForm({ resolver: zodResolver(schema) });
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input label="Name" {...form.register('name')} />
      <Select label="Side" options={sides} {...form.register('side')} />
    </form>
  );
}
```

## Implementation Order

1. App shell (layout, sidebar, topbar, theme provider)
2. Auth pages (login, register, email verification)
3. Dashboard (overview cards, section tiles)
4. Guest list (CRUD, import, export)
5. Seating chart (drag-and-drop, capacity)
6. Checklist (phased tasks, progress)
7. Budget (categories, donut chart)
8. Vendors (comparison table)
9. Public wedding site (`/w/[slug]`, themes)
10. Guest page (`/share/[slug]`, tabs)
11. 3D floor plan (React Three Fiber)
12. Photos & memories (gallery, upload)
13. Menu, inspiration, timeline, crew
14. Email templates (editor + preview)
15. RSVP page customizer
16. Collaborators (invitations, permissions)
17. Billing (plan display, payment flow)
18. Admin panel
19. Web installer
20. Demo mode headers

## API Integration

All backend calls go through a typed API client:

```typescript
// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include', // send httpOnly cookies
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new ApiError(res.status, await res.json());
  return res.json();
}

export const guests = {
  list: (tenantId: string, page: number) =>
    api<PaginatedResponse<Guest>>(`/api/v1/${tenantId}/guests?page=${page}`),
  create: (tenantId: string, data: CreateGuest) =>
    api<Guest>(`/api/v1/${tenantId}/guests`, { method: 'POST', body: JSON.stringify(data) }),
  // ...
};
```
