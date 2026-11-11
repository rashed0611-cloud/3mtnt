/**
 * Role and module access rules.
 *
 * This module is intentionally framework-free so it can be imported by the
 * edge middleware, server components and client components alike.
 *
 * Roles
 *  - superadmin : unrestricted
 *  - admin      : unrestricted
 *  - manager    : operations (bookings, inventory, customers, CRM, tasks)
 *  - account    : finance (invoices, payments, reports) plus booking overview
 *  - guest      : read-only across the workspace
 */

export const APP_ROLES = ["superadmin", "admin", "manager", "account", "guest"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  superadmin: "Super Administrator",
  admin: "Administrator",
  manager: "Operations Manager",
  account: "Accounts Officer",
  guest: "Guest",
};

export const ROLE_SUMMARIES: Record<AppRole, string> = {
  superadmin: "Full access to every module, setting and staff record.",
  admin: "Full access to every module and setting.",
  manager: "Operations access: bookings, inventory, customers, CRM and tasks.",
  account: "Finance access: invoices, payments, suppliers and reports.",
  guest: "View-only access across the workspace. Cannot change records.",
};

export const MODULE_KEYS = [
  "dashboard",
  "bookings",
  "customers",
  "tours",
  "hotels",
  "visas",
  "hajj",
  "crm",
  "tasks",
  "finance",
  "settings",
  "communication",
  "content",
  "b2b",
  "hrm",
  "flights",
  "common",
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

/** First URL segment under /admin mapped to its functional module. */
const PATH_MODULES: Record<string, ModuleKey> = {
  customers: "customers",
  tours: "tours",
  features: "tours",
  categories: "tours",
  destinations: "tours",
  locations: "tours",
  hotels: "hotels",
  hotel: "hotels",
  visas: "visas",
  visa: "visas",
  "hajj-umrah": "hajj",
  crm: "crm",
  "task-management": "tasks",
  "all-bookings": "bookings",
  "create-booking": "bookings",
  "booking-calendar": "bookings",
  "tour-bookings": "bookings",
  "hotel-bookings": "bookings",
  "visa-bookings": "bookings",
  invoices: "finance",
  "accounts-dashboard": "finance",
  expenses: "finance",
  refunds: "finance",
  transactions: "finance",
  suppliers: "finance",
  "supplier-payments": "finance",
  "profit-loss-report": "finance",
  "finance-settings": "finance",
  homepage: "settings",
  settings: "settings",
  users: "settings",
  teams: "settings",
  roles: "settings",
  "modules-addons": "settings",
  "google-sheets": "settings",
  languages: "settings",
  "activity-logs": "settings",
  "document-intelligence": "settings",
  conversations: "communication",
  coupons: "communication",
  marketing: "communication",
  inbox: "communication",
  "support-tickets": "communication",
  notifications: "common",
  search: "common",
  account: "common",
  pages: "content",
  "details-templates": "content",
  menu: "content",
  themes: "content",
  media: "content",
  reviews: "content",
  testimonials: "content",
  faq: "content",
  "all-blogs": "content",
  "add-new-blog": "content",
  "blog-categories": "content",
  "blog-comments": "content",
  "blog-settings": "content",
  "agent-management": "b2b",
  "b2b-portal": "b2b",
  "vendor-management": "b2b",
  hrm: "hrm",
  flights: "flights",
};

const ALL_MODULES: ModuleKey[] = [...MODULE_KEYS];

const VIEW_ACCESS: Record<AppRole, ModuleKey[] | "all"> = {
  superadmin: "all",
  admin: "all",
  manager: [
    "dashboard",
    "bookings",
    "customers",
    "tours",
    "hotels",
    "visas",
    "hajj",
    "crm",
    "tasks",
    "communication",
    "b2b",
    "flights",
    "common",
  ],
  account: ["dashboard", "bookings", "customers", "finance", "common"],
  guest: ALL_MODULES.filter((module) => module !== "settings"),
};

const WRITE_ACCESS: Record<AppRole, ModuleKey[] | "all"> = {
  superadmin: "all",
  admin: "all",
  manager: ["bookings", "customers", "tours", "hotels", "visas", "hajj", "crm", "tasks"],
  account: ["finance"],
  guest: [],
};

export function normalizeRole(value: unknown): AppRole {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");

  if (raw.includes("super")) return "superadmin";
  if (raw === "admin" || raw.includes("administrator")) return "admin";
  if (raw.includes("account") || raw.includes("finance")) return "account";
  if (raw.includes("manager") || raw.includes("operation")) return "manager";
  return "guest";
}

export function roleLabel(value: unknown): string {
  return ROLE_LABELS[normalizeRole(value)];
}

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && (APP_ROLES as readonly string[]).includes(value);
}

export function moduleForPath(pathname: string): ModuleKey {
  const clean = pathname.split("?")[0].split("#")[0];
  const rest = clean.replace(/^\/admin\/?/, "");
  if (!rest) return "dashboard";
  const first = rest.split("/")[0];
  if (first === "denied") return "common";
  return PATH_MODULES[first] ?? "settings";
}

export function canViewModule(role: AppRole, module: ModuleKey): boolean {
  const allowed = VIEW_ACCESS[role];
  return allowed === "all" || allowed.includes(module);
}

export function canWriteModule(role: AppRole, module: ModuleKey): boolean {
  const allowed = WRITE_ACCESS[role];
  return allowed === "all" || allowed.includes(module);
}

export function canAccessPath(role: AppRole, pathname: string): boolean {
  return canViewModule(role, moduleForPath(pathname));
}

/**
 * True when the path is a create/edit screen that must not be reachable by a
 * read-only or unrelated role.
 */
export function isWritePath(pathname: string): boolean {
  const rest = pathname.split("?")[0].split("#")[0].replace(/^\/admin\/?/, "");
  if (rest === "create-booking" || rest.startsWith("create-booking/")) return true;
  return /(^|\/)(new|edit)(\/|$)/.test(rest);
}

export function canWritePath(role: AppRole, pathname: string): boolean {
  if (isWritePath(pathname) && !canWriteModule(role, moduleForPath(pathname))) return false;
  return true;
}
