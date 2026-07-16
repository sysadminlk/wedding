# Feature Sections — All 16 Planning Sections

## Section Overview

Each section is a **permission boundary** — collaborators get read/write/none per section.

| # | Section            | Key Features                                     |
|---|--------------------|--------------------------------------------------|
| 01| Dashboard          | Countdown, budget, guest counts, section tiles   |
| 02| Checklist          | Phased tasks, progress tracking, assignment      |
| 03| Budget             | Categories, planned vs actual, donut chart       |
| 04| Guests & RSVPs     | Party counts, dietary, sides, tracking           |
| 05| Seating Chart      | Drag-and-drop tables, capacity, printable        |
| 06| 3D Floor Plan      | React Three Fiber room editor (web only)         |
| 07| Vendors            | Ratings, comparison, booked tracking             |
| 08| Wedding Crew       | Teams, helpers, roles, day-of contacts           |
| 09| Timeline           | Day-of schedule, public site rendering           |
| 10| Inspiration        | Mood board, drag-to-reorder                      |
| 11| Wedding Menu       | Upload menu pages, carousel, guest display       |
| 12| Photos             | Guest photo gallery, paginated                   |
| 13| Guest Memories     | Video/voice guestbook, paginated                 |
| 14| Public Website     | Story, schedule, registry, RSVP (6 themes)       |
| 15| RSVP Page          | Theme, fonts, button shape, live preview         |
| 16| Email Templates    | Save-the-date & invite editor, live preview      |
| 17| Collaborators      | Invite by email, per-section permissions         |

---

## 01. Dashboard

### Purpose
Calm overview. Everything at a glance.

### Widgets
1. **Countdown** — Days until wedding date
2. **Budget** — Total spent vs planned (donut chart mini)
3. **Guests** — Total invited, RSVPs received, attending
4. **Seating** — Guests seated / total guests
5. **Checklist** — Tasks completed / total
6. **Section Tiles** — One tile per section (click to navigate)

### Data
```sql
SELECT
  (SELECT COUNT(*) FROM guests WHERE tenant_id = ?) as total_guests,
  (SELECT COUNT(*) FROM guests WHERE tenant_id = ? AND rsvp_status = 'attending') as attending,
  (SELECT COUNT(*) FROM checklist_items WHERE tenant_id = ? AND completed = true) as tasks_done,
  (SELECT COUNT(*) FROM checklist_items WHERE tenant_id = ?) as tasks_total,
  (SELECT SUM(actual_amount) FROM budget_items WHERE tenant_id = ?) as spent,
  (SELECT SUM(planned_amount) FROM budget_items WHERE tenant_id = ?) as planned;
```

### API
```
GET /api/v1/{tenantId}/dashboard
```

---

## 02. Checklist

### Purpose
Phased task list. 12+ months out → the week of.

### Phases
| Phase              | Timeframe          |
|--------------------|--------------------|
| 12+ Months Out     | Venue, budget, guest list |
| 9-12 Months Out    | Vendors, wedding party |
| 6-9 Months Out     | Invitations, registry |
| 3-6 Months Out     | Seating, menu, timeline |
| 1-3 Months Out     | Final details, fittings |
| The Week Of        | Confirmations, packing |

### Features
- Add/edit/delete tasks
- Assign to collaborators
- Set due date (absolute or phase-relative)
- Mark complete (checkbox)
- Progress bar per phase
- Bulk actions (complete selected, delete selected)

### Data
```sql
checklist_item (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    title VARCHAR(500),
    description TEXT,
    phase VARCHAR(50),
    due_offset_days INT,       -- days before wedding
    due_date DATE,             -- absolute date (optional)
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    assigned_to UUID REFERENCES users(id),
    order_index INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API
```
GET    /api/v1/{tenantId}/checklist
POST   /api/v1/{tenantId}/checklist
PUT    /api/v1/{tenantId}/checklist/{id}
DELETE /api/v1/{tenantId}/checklist/{id}
POST   /api/v1/{tenantId}/checklist/{id}/complete
POST   /api/v1/{tenantId}/checklist/{id}/uncomplete
```

---

## 03. Budget

### Purpose
Track planned vs actual spending.

### Features
- Categories (venue, catering, flowers, photography, etc.)
- Add/edit/delete budget items
- Link to vendor (optional)
- Spend donut chart (by category)
- Planned vs actual comparison
- Export to PDF/Excel

### Data
```sql
budget_item (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    category VARCHAR(100),
    description VARCHAR(500),
    planned_amount DECIMAL(10,2),
    actual_amount DECIMAL(10,2),
    vendor_id UUID REFERENCES vendors(id),
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Default Categories
Venue, Catering, Photography, Videography, Flowers, Music/DJ, Attire, Hair & Makeup, Invitations, Decorations, Transportation, Favors, Cake, Officiant, Honeymoon, Other

### API
```
GET    /api/v1/{tenantId}/budget
POST   /api/v1/{tenantId}/budget
PUT    /api/v1/{tenantId}/budget/{id}
DELETE /api/v1/{tenantId}/budget/{id}
GET    /api/v1/{tenantId}/budget/summary   # totals by category
```

---

## 04. Guests & RSVPs

### Purpose
Manage the guest list, track RSVPs, dietary needs, and sides.

### Features
- Add/edit/delete guests
- Import from CSV/Excel
- Filter by: side, RSVP status, dietary, table
- Search by name
- Bulk actions (assign table, mark RSVP)
- RSVP status: pending, invited, attending, declined
- Party size tracking
- Dietary restrictions
- Side: bride, groom, mutual
- Save-the-date and invite tracking (sent, opened)
- Export to PDF/Excel
- Themed public RSVP page

### Data
```sql
guest (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(50),
    side VARCHAR(20),           -- bride, groom, mutual
    party_size INT DEFAULT 1,
    rsvp_status VARCHAR(20),    -- pending, invited, attending, declined
    dietary TEXT,
    table_id UUID REFERENCES tables(id),
    save_the_date_sent BOOLEAN DEFAULT false,
    invite_sent BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API
```
GET    /api/v1/{tenantId}/guests
POST   /api/v1/{tenantId}/guests
PUT    /api/v1/{tenantId}/guests/{id}
DELETE /api/v1/{tenantId}/guests/{id}
POST   /api/v1/{tenantId}/guests/import        # CSV/Excel upload
GET    /api/v1/{tenantId}/guests/export?format=pdf|xlsx
POST   /api/v1/{tenantId}/guests/bulk-update   # bulk RSVP, table assign
```

---

## 05. Seating Chart

### Purpose
Drag-and-drop guests onto tables. Track capacity.

### Features
- Visual table layout (2D canvas)
- Drag guests from unassigned list to tables
- Drag guests between tables
- Create/edit/delete tables
- Set table capacity
- Capacity indicator (filled/total)
- Print seating chart
- Print per-guest QR place cards
- 2D floor plan view (not 3D — that's separate section)

### Data
```sql
table_config (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(100),          -- "Table 1", "Head Table"
    capacity INT DEFAULT 8,
    table_type VARCHAR(20),     -- round, rectangular, head
    position_x FLOAT,
    position_y FLOAT,
    floor_plan_image_key VARCHAR(500),  -- S3 key for floor plan overlay
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API
```
GET    /api/v1/{tenantId}/tables
POST   /api/v1/{tenantId}/tables
PUT    /api/v1/{tenantId}/tables/{id}
DELETE /api/v1/{tenantId}/tables/{id}
POST   /api/v1/{tenantId}/tables/{id}/assign    # assign guest
POST   /api/v1/{tenantId}/tables/{id}/unassign  # unassign guest
POST   /api/v1/{tenantId}/tables/batch-update   # update positions
GET    /api/v1/{tenantId}/seating/print          # PDF seating chart
```

---

## 06. 3D Floor Plan

**WEB-ONLY** — React Three Fiber

### Purpose
Arrange tables, dance floor, DJ booth, bar, and décor in 3D.

### Features
- 3D room editor (orbit controls, zoom, pan)
- Add/remove tables (round, rectangular, head)
- Drag tables to position
- Set table capacity
- Add room elements: dance floor, DJ booth, bar, stage, décor
- Walk-through mode
- Capacity counter
- Export as image
- Save floor plan to backend

### Tech
- React Three Fiber (R3F)
- @react-three/drei (helpers: OrbitControls, Text, etc.)
- Room model: simple box geometry with walls
- Table models: cylinder (round), box (rectangular)
- Drag-and-drop: @dnd-kit or custom R3F drag

### Mobile
- 2D seating view only (flat layout, not 3D)

### Data
```sql
-- Stored as JSON in tenant record or separate table
floor_plan (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) UNIQUE,
    room_width FLOAT,
    room_depth FLOAT,
    elements JSONB,     -- [{type: "table", id: "...", x, y, z, ...}, ...]
    camera_position JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API
```
GET    /api/v1/{tenantId}/floor-plan
POST   /api/v1/{tenantId}/floor-plan           # save floor plan
DELETE /api/v1/{tenantId}/floor-plan
```

---

## 07. Vendors

### Purpose
Research, rate, compare, and track vendors.

### Features
- Add vendors with: name, category, contact, price range
- Star rating (0-5)
- Status: researching, contacted, booked, declined
- Side-by-side comparison (2+ vendors)
- Compare on: price, rating, status, contact
- Highlight cheapest & top-rated in comparison
- Link to budget item
- Export to PDF/Excel

### Data
```sql
vendor (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(200),
    category VARCHAR(100),      -- DJ, florist, photographer, etc.
    rating DECIMAL(2,1),        -- 0.0 to 5.0
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    status VARCHAR(20),         -- researching, contacted, booked, declined
    contact_name VARCHAR(200),
    contact_email VARCHAR(200),
    contact_phone VARCHAR(50),
    website VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API
```
GET    /api/v1/{tenantId}/vendors
POST   /api/v1/{tenantId}/vendors
PUT    /api/v1/{tenantId}/vendors/{id}
DELETE /api/v1/{tenantId}/vendors/{id}
GET    /api/v1/{tenantId}/vendors/compare?ids=...  # comparison data
```

---

## 08. Wedding Crew

### Purpose
Teams, helpers, roles, day-of contacts.

### Features
- Add/edit/remove crew members
- Roles: best man, maid of honor, bridesmaid, groomsman, usher, flower girl, ring bearer, officiant, photographer, DJ, planner, etc.
- Contact info (email, phone)
- Mark as external (vendor) vs internal (wedding party)
- Day-of contacts list (printable)

### Data
```sql
crew_member (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(200),
    role VARCHAR(100),
    email VARCHAR(200),
    phone VARCHAR(50),
    is_external BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API
```
GET    /api/v1/{tenantId}/crew
POST   /api/v1/{tenantId}/crew
PUT    /api/v1/{tenantId}/crew/{id}
DELETE /api/v1/{tenantId}/crew/{id}
GET    /api/v1/{tenantId}/crew/day-of-contacts  # printable list
```

---

## 09. Timeline

### Purpose
Day-of schedule. Also renders on the public wedding site.

### Features
- Add/edit/delete schedule items
- Set time (absolute or relative to ceremony)
- Description
- Assigned person/role
- Drag to reorder
- Public site view (auto-generated from timeline)
- Export to PDF

### Data
```sql
timeline_item (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    time TIME,
    end_time TIME,
    title VARCHAR(200),
    description TEXT,
    assigned_to UUID REFERENCES crew_member(id),
    order_index INT,
    is_public BOOLEAN DEFAULT true,  -- show on public site
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API
```
GET    /api/v1/{tenantId}/timeline
POST   /api/v1/{tenantId}/timeline
PUT    /api/v1/{tenantId}/timeline/{id}
DELETE /api/v1/{tenantId}/timeline/{id}
POST   /api/v1/{tenantId}/timeline/reorder       # batch reorder
```

---

## 10. Inspiration

### Purpose
Mood board for the look and feel.

### Features
- Upload images (photos, color palettes, anything visual)
- Drag to reorder
- Add captions
- View as grid / masonry layout
- Download all (zip)

### Data
```sql
inspiration_item (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    s3_key VARCHAR(500),
    caption TEXT,
    order_index INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API
```
GET    /api/v1/{tenantId}/inspiration
POST   /api/v1/{tenantId}/inspiration           # upload image
PUT    /api/v1/{tenantId}/inspiration/{id}       # update caption/order
DELETE /api/v1/{tenantId}/inspiration/{id}
POST   /api/v1/{tenantId}/inspiration/reorder
```

---

## 11. Wedding Menu

### Purpose
Upload menu pages. Display to guests behind the QR.

### Features
- Upload menu pages (images or PDFs)
- Drag to reorder
- Preview in admin
- Display to guests in carousel with tap-to-zoom
- Supports multiple pages (appetizer, main, dessert, etc.)

### Data
```sql
menu_page (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    s3_key VARCHAR(500),
    title VARCHAR(200),        -- "Appetizers", "Main Course"
    order_index INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API
```
GET    /api/v1/{tenantId}/menu
POST   /api/v1/{tenantId}/menu                 # upload page
PUT    /api/v1/{tenantId}/menu/{id}            # update title/order
DELETE /api/v1/{tenantId}/menu/{id}
POST   /api/v1/{tenantId}/menu/reorder
```

---

## 12. Photos

### Purpose
Guest photo gallery. Private to the couple (on dashboard).

### Features
- Paginated grid
- Upload by guests (via guest page)
- View by couple (dashboard)
- Lightbox view
- Download
- Delete (couple only)

### Data
```sql
photo (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    uploaded_by_guest_id UUID,
    s3_key VARCHAR(500),
    thumbnail_key VARCHAR(500),
    caption TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API
```
GET    /api/v1/{tenantId}/photos              # paginated
DELETE /api/v1/{tenantId}/photos/{id}
```

---

## 13. Guest Memories

### Purpose
Video/voice guestbook. Private to the couple.

### Features
- Paginated list
- Record via web (MediaRecorder)
- Upload via guest page
- Play in dashboard
- Type: video or audio
- Duration display
- Download

### Data
```sql
guest_memory (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    guest_id UUID REFERENCES guests(id),
    type VARCHAR(10),          -- video, audio
    s3_key VARCHAR(500),
    duration_seconds INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API
```
GET    /api/v1/{tenantId}/memories            # paginated
DELETE /api/v1/{tenantId}/memories/{id}
```

---

## 14. Public Website

### Purpose
Wedding site editor. Story, schedule, registry.

### Features
- Edit story (rich text)
- Edit schedule (pulls from Timeline)
- Edit registry display
- Select theme (6 options)
- Preview in real-time
- Slug customization

### Data
```sql
public_website (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) UNIQUE,
    slug VARCHAR(200) UNIQUE,
    theme VARCHAR(50),         -- atelier, rose, garden, minimal, luxe, coastal
    story TEXT,                 -- rich text / markdown
    custom_css TEXT,
    hero_image_key VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API
```
GET    /api/v1/{tenantId}/website
PUT    /api/v1/{tenantId}/website
POST   /api/v1/{tenantId}/website/preview      # generate preview URL
```

---

## 15. RSVP Page

### Purpose
Customize the public RSVP page's appearance.

### Features
- Select theme (6 options)
- Customize fonts
- Customize button shape
- Live preview
- RSVP form fields (configurable)

### Data
```sql
rsvp_page (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) UNIQUE,
    theme VARCHAR(50),
    font_heading VARCHAR(100),
    font_body VARCHAR(100),
    button_shape VARCHAR(20),  -- rounded, square, pill
    button_color VARCHAR(7),
    custom_fields JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API
```
GET    /api/v1/{tenantId}/rsvp
PUT    /api/v1/{tenantId}/rsvp
POST   /api/v1/{tenantId}/rsvp/preview         # generate preview
```

---

## 16. Email Templates

### Purpose
Override save-the-date and invitation subject & copy.

### Features
- Edit subject line
- Edit body (rich text)
- Live preview (side-by-side)
- Variables: {{partner1}}, {{partner2}}, {{date}}, {{venue}}, {{rsvp_link}}
- Reset to default
- Send test email

### Data
(See email_template schema in 09-integrations.md)

### API
```
GET    /api/v1/{tenantId}/email-templates
GET    /api/v1/{tenantId}/email-templates/{type}
PUT    /api/v1/{tenantId}/email-templates/{type}
POST   /api/v1/{tenantId}/email-templates/{type}/preview
POST   /api/v1/{tenantId}/email-templates/{type}/test    # send test
POST   /api/v1/{tenantId}/email-templates/{type}/reset   # reset to default
```

---

## 17. Collaborators

### Purpose
Invite by email. Set per-section permissions.

### Features
- Send invite by email
- Select role (partner, planner, family, wedding_party, vendor)
- Set permissions per section (read/write/none)
- View active collaborators
- Remove collaborator
- Resend invite
- Transfer ownership

### Data
```sql
collaborator (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(50),
    permissions JSONB,         -- { "guests": "write", "budget": "read", ... }
    invited_by UUID REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

collaborator_invitation (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    email VARCHAR(200),
    role VARCHAR(50),
    permissions JSONB,
    token VARCHAR(255),
    expires_at TIMESTAMP,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP
);
```

### API
```
GET    /api/v1/{tenantId}/collaborators
POST   /api/v1/{tenantId}/collaborators/invite
PUT    /api/v1/{tenantId}/collaborators/{id}    # update permissions
DELETE /api/v1/{tenantId}/collaborators/{id}
POST   /api/v1/{tenantId}/collaborators/{id}/resend
POST   /api/v1/{tenantId}/collaborators/accept  # accept invitation
```

---

## Cross-Cutting Concerns

### PDF & Excel Export

Every list view supports export:
- **PDF:** Print-ready, branded header
- **Excel:** .xlsx workbook with filters and formatting

```java
// Export endpoint pattern
@GetMapping("/{section}/export")
public void export(
    @PathVariable String tenantId,
    @PathVariable String section,
    @RequestParam(defaultValue = "pdf") String format,
    HttpServletResponse response
) {
    if ("xlsx".equals(format)) {
        excelExporter.export(tenantId, section, response.getOutputStream());
    } else {
        pdfExporter.export(tenantId, section, response.getOutputStream());
    }
}
```

### Permission Boundary

Every API call checks:
1. User is authenticated
2. User belongs to tenant
3. User has required permission for section (read for GET, write for POST/PUT/DELETE)

### Mobile Coverage

All 16 sections available in Flutter app with full feature parity (except 3D floor plan → 2D seating).
