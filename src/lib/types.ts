export type ServiceType = "tour" | "hotel" | "visa" | "hajj";

export type BookingStatus =
  | "draft"
  | "pending"
  | "processing"
  | "reserved"
  | "confirmed"
  | "approved"
  | "ready_to_travel"
  | "departed"
  | "completed"
  | "cancelled"
  | "rejected"
  | "delivered"
  | "closed"
  | "on_hold";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded" | "balance_due" | "failed";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal_sent"
  | "negotiation"
  | "converted"
  | "lost";

export type TaskStatus =
  | "to_do"
  | "pending"
  | "in_progress"
  | "review"
  | "completed"
  | "blocked"
  | "cancelled";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  nationality: string;
  status: "active" | "inactive";
  tags: string[];
  assignedTo: string;
  notes?: string;
  createdAt: string;
}

export interface Tour {
  id: string;
  code: string;
  title: string;
  slug: string;
  destination: string;
  type: "custom" | "fixed_departure" | "private" | "group";
  durationDays: number;
  durationNights: number;
  adultPrice: number;
  childPrice: number;
  currency: string;
  capacity: number;
  status: "active" | "draft" | "archived";
  featured: boolean;
  supplier: string;
  description: string;
  inclusions: string[];
  exclusions: string[];
  itinerary: { day: number; title: string; description: string }[];
  createdAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  location: string;
  starRating: number;
  price: number;
  currency: string;
  rooms: number;
  status: "publish" | "draft" | "archived";
  featured: boolean;
  description: string;
  amenities: string[];
  supplier: string;
}

export interface VisaPackage {
  id: string;
  country: string;
  visaType: string;
  processingTime: string;
  price: number;
  currency: string;
  status: "active" | "draft";
  requiredDocuments: string[];
  description: string;
}

export interface HajjPackage {
  id: string;
  title: string;
  kind: "hajj" | "umrah" | "ramadan_umrah";
  tier: string;
  departureDate: string;
  returnDate: string;
  price: number;
  currency: string;
  capacity: number;
  booked: number;
  status: "active" | "draft";
}

export interface Booking {
  id: string;
  ref: string;
  serviceType: ServiceType;
  title: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  travelers: number;
  adults: number;
  children: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  due: number;
  currency: string;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  assignedTo: string;
  supplier?: string;
  source: string;
  notes?: string;
  createdAt: string;
  timeline: { at: string; label: string; note?: string }[];
}

export interface Invoice {
  id: string;
  number: string;
  bookingRef: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  total: number;
  paid: number;
  due: number;
  status: "draft" | "sent" | "partial" | "paid" | "overdue" | "void";
  type: string;
  currency: string;
}

export interface Lead {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  source: "website" | "facebook" | "phone" | "referral" | "walk_in" | "agent" | "other";
  requirement: string;
  assignedTo: string;
  priority: Priority;
  tags: string[];
  status: LeadStatus;
  nextFollowUp?: string;
  lastContact?: string;
  estimatedValue: number;
  notes?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  relatedTo: string;
  assignedTo: string;
  priority: Priority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  subtasks: { done: number; total: number };
  checklist: { done: number; total: number };
}

export interface Activity {
  id: string;
  actor: string;
  action: string;
  module: string;
  severity: "info" | "warning" | "critical";
  description: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  service: string;
  contact: string;
  phone: string;
  balance: number;
  status: "active" | "inactive";
}

export interface Agent {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  type: "agency" | "individual";
  commission: number;
  bookings: number;
  sales: number;
  available: number;
  status: "active" | "inactive";
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  alt: string;
}

export interface HomepageContent {
  eyebrow: string;
  headline: string;
  highlight: string;
  subtitle: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  galleryTitle: string;
  gallerySubtitle: string;
}

export interface SiteBrand {
  logoUrl: string;
  faviconUrl: string;
  logoTagline: string;
  facebook: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  whatsapp: string;
}

export interface SiteColors {
  primary: string;
  accent: string;
  page: string;
  text: string;
  footer: string;
}

export interface SiteTypography {
  headingFont: string;
  bodyFont: string;
  headingWeight: number;
  radius: number;
}

export interface SiteBanner {
  imageUrl: string;
  overlay: number;
  align: "left" | "center";
  height: "compact" | "standard" | "tall";
  showSearch: boolean;
}

export interface SiteAnnouncement {
  enabled: boolean;
  text: string;
  linkLabel: string;
  linkHref: string;
  tone: "brand" | "dark" | "light";
}

export interface SiteSections {
  featuredTours: boolean;
  services: boolean;
  destinations: boolean;
  gallery: boolean;
  pilgrimage: boolean;
  testimonials: boolean;
  stats: boolean;
  cta: boolean;
}

export interface SiteSeo {
  title: string;
  description: string;
  ogImageUrl: string;
}

export interface SiteAppearance {
  brand: SiteBrand;
  colors: SiteColors;
  typography: SiteTypography;
  banner: SiteBanner;
  announcement: SiteAnnouncement;
  sections: SiteSections;
  seo: SiteSeo;
}

export interface AppSettings {
  siteName: string;
  tagline: string;
  legalName: string;
  email: string;
  phone: string;
  address: string;
  defaultCurrency: string;
  timezone: string;
  invoicePrefix: string;
  taxRate: number;
  logoText: string;
  tourDefaultStatus: "active" | "draft";
  tourCancellationDays: number;
  tourDepositPercent: number;
  homepage: HomepageContent;
  gallery: GalleryImage[];
  appearance: SiteAppearance;
}

export interface Database {
  customers: Customer[];
  tours: Tour[];
  hotels: Hotel[];
  visas: VisaPackage[];
  hajjPackages: HajjPackage[];
  bookings: Booking[];
  invoices: Invoice[];
  leads: Lead[];
  tasks: Task[];
  activities: Activity[];
  suppliers: Supplier[];
  agents: Agent[];
  settings: AppSettings;
}

export interface DashboardStats {
  incomeThisMonth: number;
  bookingsThisMonth: number;
  openBookings: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  receivables: number;
  overdueInvoices: number;
  bookingsByStatus: Record<string, number>;
  bookingMomentum: { month: string; bookings: number; value: number }[];
  recentBookings: Booking[];
  documents: { proposals: number; quotations: number; invoices: number; invoiceValue: number };
  finance: { income: number; expenses: number; netProfit: number; refunds: number; transactions: number; suppliers: number };
  operations: {
    tasks: { open: number; inProgress: number; overdue: number; total: number };
    leads: { active: number; new: number; converted: number; total: number };
    agents: { active: number; inactive: number; bookings: number; total: number };
    support: { open: number; urgent: number; unassigned: number; total: number };
    suppliers: { active: number; awaiting: number; openBookings: number; total: number };
  };
}

export interface BookingInput {
  serviceType: ServiceType;
  title: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  subtotal: number;
  discount: number;
  tax: number;
  advance: number;
  paymentMethod: string;
  status: BookingStatus;
  priority: Priority;
  source: string;
  assignedTo: string;
  notes?: string;
}
