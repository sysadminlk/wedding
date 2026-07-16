-- weddingWire Database Schema
-- V1__init_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TENANCY & AUTH
-- =============================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    theme VARCHAR(50) DEFAULT 'atelier',
    plan VARCHAR(20) DEFAULT 'free',
    status VARCHAR(20) DEFAULT 'active',
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(200) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    verification_code VARCHAR(10),
    verification_expires_at TIMESTAMP,
    reset_code VARCHAR(10),
    reset_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_tenants (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'partner',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, tenant_id)
);

-- =============================================
-- WEDDING DATA
-- =============================================

CREATE TABLE weddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    partner1 VARCHAR(200) NOT NULL,
    partner2 VARCHAR(200) NOT NULL,
    date DATE,
    venue VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(50),
    side VARCHAR(20) DEFAULT 'mutual',
    party_size INT DEFAULT 1,
    rsvp_status VARCHAR(20) DEFAULT 'pending',
    dietary TEXT,
    table_id UUID,
    save_the_date_sent BOOLEAN DEFAULT false,
    invite_sent BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE table_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    capacity INT DEFAULT 8,
    table_type VARCHAR(20) DEFAULT 'round',
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    floor_plan_image_key VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE guests ADD CONSTRAINT fk_guests_table
    FOREIGN KEY (table_id) REFERENCES table_configs(id) ON DELETE SET NULL;

CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    phase VARCHAR(50),
    due_offset_days INT,
    due_date DATE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    assigned_to UUID REFERENCES users(id),
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    planned_amount DECIMAL(10,2) DEFAULT 0,
    actual_amount DECIMAL(10,2) DEFAULT 0,
    vendor_id UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    rating DECIMAL(2,1) DEFAULT 0,
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'researching',
    contact_name VARCHAR(200),
    contact_email VARCHAR(200),
    contact_phone VARCHAR(50),
    website VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE budget_items ADD CONSTRAINT fk_budget_vendor
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL;

CREATE TABLE crew_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(100),
    email VARCHAR(200),
    phone VARCHAR(50),
    is_external BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE timeline_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    time TIME,
    end_time TIME,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES crew_members(id),
    order_index INT DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CONTENT (S3-BACKED)
-- =============================================

CREATE TABLE inspiration_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    s3_key VARCHAR(500) NOT NULL,
    caption TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    s3_key VARCHAR(500) NOT NULL,
    title VARCHAR(200),
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    uploaded_by_guest_id UUID,
    s3_key VARCHAR(500) NOT NULL,
    thumbnail_key VARCHAR(500),
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guest_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
    type VARCHAR(10) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    duration_seconds INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- GIFT REGISTRY
-- =============================================

CREATE TABLE gift_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    image_s3_key VARCHAR(500),
    store_link VARCHAR(500),
    note TEXT,
    claimed_by_guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
    claimed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cash_funds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    label VARCHAR(200) NOT NULL,
    payment_link VARCHAR(500),
    icon VARCHAR(50),
    goal_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PUBLIC SITE
-- =============================================

CREATE TABLE public_websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    slug VARCHAR(200) UNIQUE NOT NULL,
    theme VARCHAR(50) DEFAULT 'atelier',
    story TEXT,
    custom_css TEXT,
    hero_image_key VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rsvp_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(50) DEFAULT 'atelier',
    font_heading VARCHAR(100) DEFAULT 'Playfair Display',
    font_body VARCHAR(100) DEFAULT 'system-ui',
    button_shape VARCHAR(20) DEFAULT 'rounded',
    button_color VARCHAR(7) DEFAULT '#C4A882',
    custom_fields JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE share_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    slug VARCHAR(200) UNIQUE NOT NULL,
    qr_code_s3_key VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CONFIG & ADMIN
-- =============================================

CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(500),
    body_html TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE landing_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    design_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL,
    strings_json JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- COLLABORATORS
-- =============================================

CREATE TABLE collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'partner',
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collaborator_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(200) NOT NULL,
    role VARCHAR(50) NOT NULL,
    permissions JSONB DEFAULT '{}',
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BILLING
-- =============================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    plan VARCHAR(20) DEFAULT 'free',
    status VARCHAR(20) DEFAULT 'active',
    gateway VARCHAR(30),
    gateway_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    trial_ends_at TIMESTAMP,
    canceled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending',
    gateway_transaction_id VARCHAR(255),
    invoice_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plan_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    limits JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- DEMO
-- =============================================

CREATE TABLE demo_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    seed_data JSONB DEFAULT '{}',
    last_reset_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FLOOR PLAN (3D room editor data)
-- =============================================

CREATE TABLE floor_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    room_width FLOAT DEFAULT 20,
    room_depth FLOAT DEFAULT 15,
    elements JSONB DEFAULT '[]',
    camera_position JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CASH GIFT DONATIONS
-- =============================================

CREATE TABLE cash_gift_donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    cash_fund_id UUID REFERENCES cash_funds(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending',
    gateway VARCHAR(30),
    gateway_transaction_id VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES
-- =============================================

-- Tenant-scoped indexes (critical for multi-tenant performance)
CREATE INDEX idx_guests_tenant ON guests(tenant_id);
CREATE INDEX idx_tables_tenant ON table_configs(tenant_id);
CREATE INDEX idx_checklist_tenant ON checklist_items(tenant_id);
CREATE INDEX idx_budget_tenant ON budget_items(tenant_id);
CREATE INDEX idx_vendors_tenant ON vendors(tenant_id);
CREATE INDEX idx_crew_tenant ON crew_members(tenant_id);
CREATE INDEX idx_timeline_tenant ON timeline_items(tenant_id);
CREATE INDEX idx_inspiration_tenant ON inspiration_items(tenant_id);
CREATE INDEX idx_menu_tenant ON menu_pages(tenant_id);
CREATE INDEX idx_photos_tenant ON photos(tenant_id);
CREATE INDEX idx_memories_tenant ON guest_memories(tenant_id);
CREATE INDEX idx_gifts_tenant ON gift_items(tenant_id);
CREATE INDEX idx_funds_tenant ON cash_funds(tenant_id);
CREATE INDEX idx_website_tenant ON public_websites(tenant_id);
CREATE INDEX idx_rsvp_tenant ON rsvp_pages(tenant_id);
CREATE INDEX idx_share_tenant ON share_pages(tenant_id);
CREATE INDEX idx_email_templates_tenant ON email_templates(tenant_id);
CREATE INDEX idx_landing_tenant ON landing_pages(tenant_id);
CREATE INDEX idx_languages_tenant ON languages(tenant_id);
CREATE INDEX idx_collaborators_tenant ON collaborators(tenant_id);
CREATE INDEX idx_invitations_tenant ON collaborator_invitations(tenant_id);
CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_floor_plans_tenant ON floor_plans(tenant_id);
CREATE INDEX idx_cash_donations_tenant ON cash_gift_donations(tenant_id);
CREATE INDEX idx_cash_donations_fund ON cash_gift_donations(cash_fund_id);

-- Guest search
CREATE INDEX idx_guests_name ON guests(tenant_id, name);
CREATE INDEX idx_guests_rsvp ON guests(tenant_id, rsvp_status);
CREATE INDEX idx_guests_side ON guests(tenant_id, side);
CREATE INDEX idx_guests_table ON guests(tenant_id, table_id);

-- Slug lookups (public routes)
CREATE INDEX idx_share_slug ON share_pages(slug);
CREATE INDEX idx_website_slug ON public_websites(slug);

-- User lookup
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_tenants_user ON user_tenants(user_id);
CREATE INDEX idx_user_tenants_tenant ON user_tenants(tenant_id);

-- Collaborator invitations
CREATE INDEX idx_invitations_token ON collaborator_invitations(token);
CREATE INDEX idx_invitations_email ON collaborator_invitations(email);

-- =============================================
-- SEED DATA
-- =============================================

-- Default plan configs
INSERT INTO plan_configs (plan, name, price_monthly, price_yearly, limits, features) VALUES
('free', 'Free', 0, 0, '{"guests": 50, "photos": 50, "memories": 10, "checklist_items": 30, "budget_items": 20, "vendors": 5, "collaborators": 2, "email_sends": 0}', '{"three_d_floor_plan": false, "excel_export": false, "custom_themes": false, "sms_whatsapp": false}'),
('premium', 'Premium', 29.99, 299.99, '{"guests": -1, "photos": -1, "memories": -1, "checklist_items": -1, "budget_items": -1, "vendors": -1, "collaborators": -1, "email_sends": 500}', '{"three_d_floor_plan": true, "excel_export": true, "custom_themes": true, "sms_whatsapp": false}'),
('planner', 'Planner', 79.99, 799.99, '{"guests": -1, "photos": -1, "memories": -1, "checklist_items": -1, "budget_items": -1, "vendors": -1, "collaborators": -1, "email_sends": 2000, "multiple_weddings": 10}', '{"three_d_floor_plan": true, "excel_export": true, "custom_themes": true, "sms_whatsapp": true, "white_label": true, "client_portal": true}');

-- Default email templates (system-wide, not tenant-specific)
INSERT INTO email_templates (id, tenant_id, type, subject, body_html, is_default) VALUES
(uuid_generate_v4(), NULL, 'verification', 'Verify your weddingWire account', '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><h1>Welcome to weddingWire!</h1><p>Your verification code is: <strong>{{code}}</strong></p><p>This code expires in 15 minutes.</p></body></html>', true),
(uuid_generate_v4(), NULL, 'password_reset', 'Reset your weddingWire password', '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><h1>Password Reset</h1><p>Your reset code is: <strong>{{code}}</strong></p><p>This code expires in 15 minutes.</p></body></html>', true),
(uuid_generate_v4(), NULL, 'save_the_date', 'Save the Date - {{partner1}} & {{partner2}}', '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><h1>Save the Date!</h1><p>{{partner1}} and {{partner2}} are getting married on {{date}}!</p><p><a href="{{rsvp_link}}">View Details</a></p></body></html>', true),
(uuid_generate_v4(), NULL, 'invitation', 'You''re Invited - {{partner1}} & {{partner2}}', '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><h1>You''re Invited!</h1><p>{{partner1}} and {{partner2}} invite you to celebrate their wedding on {{date}}.</p><p><a href="{{rsvp_link}}">RSVP Now</a></p></body></html>', true),
(uuid_generate_v4(), NULL, 'collaborator_invite', 'You''ve been invited to collaborate on weddingWire', '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><h1>You''re Invited!</h1><p>{{inviter_name}} has invited you to collaborate on their wedding planning.</p><p><a href="{{invite_link}}">Accept Invitation</a></p></body></html>', true);
