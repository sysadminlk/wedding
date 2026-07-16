# Public Routes & Guest Page

## Public Wedding Site (`/w/{slug}`)

### Purpose

The public-facing wedding website guests see. Shows story, schedule, registry, and RSVP.

### Themes (6)

| Theme     | Style                                    |
|-----------|------------------------------------------|
| Atelier   | Typography-led, warm ivory + gold        |
| Rose      | Soft pinks, romantic                     |
| Garden    | Green tones, botanical                   |
| Minimal   | Clean, monochrome                        |
| Luxe      | Dark + gold, editorial                   |
| Coastal   | Blue tones, beachy                       |

### Content Sections

Each wedding's public site shows:

1. **Hero** — Names, date, venue, countdown
2. **Story** — How the couple met (rich text)
3. **Schedule** — Day-of timeline (auto-generated from Timeline section)
4. **Registry** — Gift cards + cash fund (from Gift Registry section)
5. **RSVP** — Link to RSVP form (or inline)
6. **Photos** — Optional: curated gallery from Photos section

### Data Flow

```
/w/{slug}
  → Lookup public_website by slug
  → Fetch wedding details, timeline, gifts
  → Render with selected theme
  → No auth required
```

### Next.js Route

```typescript
// src/app/(public)/w/[slug]/page.tsx
export default async function PublicWeddingPage({ params }) {
  const { slug } = params;
  const data = await fetchPublicWedding(slug);

  return (
    <WeddingLayout theme={data.theme}>
      <Hero wedding={data.wedding} />
      <Story content={data.story} />
      <Schedule items={data.timeline} />
      <Registry gifts={data.gifts} funds={data.funds} />
      <RSPLink slug={slug} />
    </WeddingLayout>
  );
}
```

### Theme Switching

- Theme stored in `public_website.theme` field
- CSS variables loaded dynamically based on theme
- Each theme defines its own token set:

```css
/* Theme: Rose */
.rose {
  --color-primary: #E8B4B8;
  --color-secondary: #F5E6E8;
  --font-heading: 'Playfair Display', serif;
  --hero-bg: linear-gradient(135deg, #F5E6E8, #FFFFFF);
}
```

## Guest Page (`/share/{slug}`)

### Purpose

Single QR code → single tabbed page. Everything guests need.

### Tabs (5)

#### 1. Seat Finder

```
Input: guest name (autocomplete search)
Output: table name + table number + floor plan image with highlighted seat
```

- Search is instant (debounced, client-side filter or API call)
- Shows: "You're at Table {name}, Seat {number}"
- Floor plan image with table highlighted (static image, not 3D)
- No auth required — guest just enters their name

#### 2. Gallery

```
Shows: photo/video grid (read-only for guests)
Action: upload button (write-only — guests can add, can't delete)
```

- Paginated grid (load more)
- Tap to view full-size / play video
- Upload: camera or file picker
- Upload goes directly to S3 (presigned URL)
- Couple sees everything; guests only see what they uploaded

#### 3. Menu

```
Shows: carousel of uploaded menu pages
Action: swipe to navigate, tap to zoom
```

- Menu pages uploaded by couple in Menu section
- Displayed as high-res images (tap to zoom/pan)
- Carousel with dots indicator

#### 4. Gift Registry

```
Shows: gift cards + cash fund links
Action: "I'll get this" button (marks as claimed)
```

- Gift cards: image + store name + link + note
- Cash fund: label + payment link (PayPal.me, Venmo, bank)
- "I'll get this" marks gift as claimed (shows claimer name to couple)
- Guests pay couple directly — no platform payment processing

#### 5. Memory

```
Shows: record button (video or voice)
Action: MediaRecorder → browser-native recording
```

- Two modes: video (with camera) or voice (audio only)
- Recording limit: 60 seconds
- MediaRecorder API (no plugins, no app)
- Recorded blob → uploaded to S3
- Couple sees all memories in their Memories section

### Next.js Route

```typescript
// src/app/(public)/share/[slug]/page.tsx
export default async function GuestPage({ params }) {
  const { slug } = params;
  const data = await fetchSharePage(slug);

  return (
    <GuestPageLayout>
      <TabBar tabs={['Seat', 'Gallery', 'Menu', 'Gifts', 'Memory']} />
      <SeatFinder guests={data.guests} floorPlan={data.floorPlan} />
      <Gallery tenantId={data.tenantId} />
      <MenuCarousel pages={data.menuPages} />
      <GiftRegistry gifts={data.gifts} funds={data.funds} />
      <MemoryRecorder tenantId={data.tenantId} />
    </GuestPageLayout>
  );
}
```

### Guest Page — No Auth

- Entire page is public
- Guest identification is by name search (seat finder) or anonymous upload
- No login required
- No account required

## Landing Pages (10)

Admin-switchable front page designs for the marketing site:

| Design     | Style                                    |
|------------|------------------------------------------|
| Atelier    | Typography-led, warm ivory + gold        |
| Ivory      | Clean, warm neutral                      |
| Cinema     | Full-width imagery, editorial            |
| Split      | Two-column, text + image                 |
| Editorial  | Magazine-style, large type               |
| Minimal    | Clean, lots of whitespace                |
| Gilded     | Gold accents, luxurious                  |
| Folio      | Portfolio-style, image-heavy             |
| Portrait   | Couple-focused, large portrait           |
| Deco       | Art deco geometric patterns              |

### Admin Landing Page Selector

```
/admin/landing
  → Grid of 10 landing page previews
  → Click to preview (full-screen)
  → Click "Set as active" to switch
  → One-click, instant change
```

## Public API Endpoints

```
GET  /api/v1/public/w/{slug}              # Wedding site data
GET  /api/v1/public/share/{slug}          # Guest page data
GET  /api/v1/public/share/{slug}/guests   # Guest list (for search)
GET  /api/v1/public/share/{slug}/seat/{name}  # Seat lookup
GET  /api/v1/public/share/{slug}/menu     # Menu pages
GET  /api/v1/public/share/{slug}/gifts    # Gift registry
POST /api/v1/public/share/{slug}/rsvp     # Submit RSVP
POST /api/v1/public/share/{slug}/upload   # Guest upload (gallery/memory)
POST /api/v1/public/share/{slug}/memory   # Record video/voice
GET  /api/v1/public/landing/{slug}        # Landing page config
```

## QR Code Generation

### When Generated

- On tenant creation (share page created)
- On share page slug change
- On manual regeneration (admin)

### Storage

- Generated server-side (Java QR library or API)
- Stored in S3: `{tenant_id}/share/qr-{slug}.png`
- Also stored as base64 in DB for quick access

### Usage

- Displayed on RSVP page
- Printable on place cards (seating section)
- Downloadable by couple
- Embeddable in email templates

## SEO & Social

### Public Wedding Site

```html
<meta property="og:title" content="{Partner1} & {Partner2}">
<meta property="og:description" content="Join us on {date}">
<meta property="og:image" content="{hero_image_url}">
<meta name="description" content="Wedding of {Partner1} and {Partner2}">
```

### Guest Page

- No SEO (behind QR, not indexed)
- `noindex, nofollow` meta tag

## Performance

- Public wedding site: ISR (Incremental Static Regeneration), revalidate every 60s
- Guest page: SSR (dynamic, needs fresh data for uploads)
- Guest page images: S3 + CloudFront (production)
- Menu carousel: lazy load images
- Gallery: infinite scroll with intersection observer
