export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'premium' | 'planner';
  createdAt: string;
}

export interface UserTenant {
  id: string;
  userId: string;
  tenantId: string;
  role: 'partner' | 'planner' | 'family' | 'friend' | 'vendor';
  permissions: TenantPermissions;
}

export interface TenantPermissions {
  dashboard: 'read' | 'write' | 'none';
  checklist: 'read' | 'write' | 'none';
  budget: 'read' | 'write' | 'none';
  guests: 'read' | 'write' | 'none';
  seating: 'read' | 'write' | 'none';
  vendors: 'read' | 'write' | 'none';
  crew: 'read' | 'write' | 'none';
  timeline: 'read' | 'write' | 'none';
  inspiration: 'read' | 'write' | 'none';
  menu: 'read' | 'write' | 'none';
  photos: 'read' | 'write' | 'none';
  memories: 'read' | 'write' | 'none';
  gifts: 'read' | 'write' | 'none';
  website: 'read' | 'write' | 'none';
  rsvp: 'read' | 'write' | 'none';
  emailTemplates: 'read' | 'write' | 'none';
}

export interface Wedding {
  id: string;
  tenantId: string;
  partner1: string;
  partner2: string;
  weddingDate: string;
  venue: string;
  slug: string;
  theme: string;
  createdAt: string;
}

export interface Guest {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  side: 'bride' | 'groom' | 'mutual';
  dietaryRestrictions?: string;
  plusOne: boolean;
  partySize: number;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  tableId?: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  phase: string;
  dueDate?: string;
  completed: boolean;
  assignedTo?: string;
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  tenantId: string;
  category: string;
  description?: string;
  estimatedCost: number;
  actualCost: number;
  vendor?: string;
  paid: boolean;
  notes?: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  cost: number;
  rating: number;
  status: 'contacted' | 'booked' | 'confirmed' | 'declined';
  notes?: string;
  createdAt: string;
}

export interface CrewMember {
  id: string;
  tenantId: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  isExternal: boolean;
  notes?: string;
  createdAt: string;
}

export interface TimelineItem {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  sortOrder: number;
  createdAt: string;
}

export interface InspirationItem {
  id: string;
  tenantId: string;
  imageUrl: string;
  caption?: string;
  sortOrder: number;
  createdAt: string;
}

export interface MenuPage {
  id: string;
  tenantId: string;
  title: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  course: string;
  imageUrl?: string;
  dietaryTags?: string;
  sortOrder: number;
  createdAt: string;
}

export interface Photo {
  id: string;
  tenantId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface GuestMemory {
  id: string;
  tenantId: string;
  type: 'video' | 'audio' | 'photo';
  fileUrl: string;
  thumbnailUrl?: string;
  guestName?: string;
  message?: string;
  createdAt: string;
}

export interface GiftItem {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  claimed: boolean;
  claimedBy?: string;
  link?: string;
  createdAt: string;
}

export interface CashFund {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  goalAmount: number;
  currentAmount: number;
  createdAt: string;
}

export interface CashFundDonation {
  id: string;
  fundId: string;
  donorName: string;
  amount: number;
  message?: string;
  createdAt: string;
}

export interface SeatingTable {
  id: string;
  tenantId: string;
  name: string;
  capacity: number;
  shape: 'round' | 'rectangular' | 'oval';
  guests: Guest[];
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  tenantId: string;
  type: string;
  subject: string;
  body: string;
  createdAt: string;
}

export interface WebsiteConfig {
  id: string;
  tenantId: string;
  slug: string;
  theme: string;
  heroImageUrl?: string;
  title?: string;
  subtitle?: string;
  story?: string;
  schedule?: { title: string; time: string; description?: string }[];
  showGiftRegistry: boolean;
  showRsvp: boolean;
  showGallery: boolean;
  createdAt: string;
}

export interface RsvpConfig {
  id: string;
  tenantId: string;
  welcomeMessage?: string;
  plusOneAllowed: boolean;
  dietaryField: boolean;
  accommodationField: boolean;
  customQuestions?: string;
  createdAt: string;
}

export interface DashboardData {
  wedding: Wedding;
  daysUntilWedding: number;
  budgetSummary: {
    totalEstimated: number;
    totalActual: number;
    totalPaid: number;
  };
  guestSummary: {
    total: number;
    confirmed: number;
    declined: number;
    pending: number;
  };
  checklistSummary: {
    total: number;
    completed: number;
  };
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface BillingSubscription {
  plan: 'free' | 'premium' | 'planner';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  price: number;
  currency: string;
  nextBillingDate: string | null;
  cancelledAt: string | null;
  gateway: string;
}

export interface BillingUsage {
  guests: { current: number; limit: number };
  photos: { current: number; limit: number };
  memories: { current: number; limit: number };
  menuItems: { current: number; limit: number };
  crewMembers: { current: number; limit: number };
}

export interface Invoice {
  id: string;
  date: string;
  plan: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  gateway: string;
}

export interface PlanDefinition {
  id: 'free' | 'premium' | 'planner';
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}
