import {
  BadgeDollarSign,
  BarChart3,
  BedDouble,
  Bell,
  Blocks,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  Contact,
  CreditCard,
  FileSearch,
  FileText,
  Globe2,
  Headphones,
  Hotel,
  Landmark,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Package,
  Plane,
  ReceiptText,
  Settings,
  ShieldCheck,
  Store,
  Tags,
  Ticket,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export interface NavSection {
  label: string;
  groups: NavGroup[];
}

export const navigation: NavSection[] = [
  {
    label: "",
    groups: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        items: [{ label: "Dashboard", href: "/admin" }],
      },
    ],
  },
  {
    label: "BUSINESS ERP",
    groups: [
      {
        label: "Sales & Quotation",
        icon: BadgeDollarSign,
        items: [
          { label: "Customers", href: "/admin/customers" },
          { label: "Proposals", href: "/admin/proposals" },
          { label: "Quotations", href: "/admin/quotations" },
          { label: "Invoices", href: "/admin/invoices" },
        ],
      },
      {
        label: "Accounts & Finance",
        icon: Wallet,
        items: [
          { label: "Dashboard", href: "/admin/accounts-dashboard" },
          { label: "Expenses", href: "/admin/expenses" },
          { label: "Refunds", href: "/admin/refunds" },
          { label: "Transactions", href: "/admin/transactions" },
          { label: "Suppliers", href: "/admin/suppliers" },
          { label: "Supplier Payments", href: "/admin/supplier-payments" },
          { label: "Profit & Loss Report", href: "/admin/profit-loss-report" },
          { label: "Finance Settings", href: "/admin/finance-settings" },
        ],
      },
      {
        label: "CRM",
        icon: Contact,
        items: [
          { label: "Dashboard", href: "/admin/crm" },
          { label: "Leads", href: "/admin/crm/leads" },
          { label: "Follow-ups", href: "/admin/crm/follow-ups" },
          { label: "Calendar", href: "/admin/crm/calendar" },
          { label: "Notes", href: "/admin/crm/notes" },
          { label: "Documents", href: "/admin/crm/documents" },
          { label: "Reports", href: "/admin/crm/reports" },
          { label: "CRM Settings", href: "/admin/crm/settings" },
        ],
      },
      {
        label: "Task Management",
        icon: ClipboardList,
        items: [
          { label: "All Tasks", href: "/admin/task-management/tasks" },
          { label: "Task Reports", href: "/admin/task-management/reports" },
          { label: "Task Settings", href: "/admin/task-management/settings" },
        ],
      },
      {
        label: "HRM",
        icon: Users,
        items: [
          { label: "Dashboard", href: "/admin/hrm" },
          { label: "Employees", href: "/admin/hrm/employees" },
          { label: "Attendance", href: "/admin/hrm/attendance" },
          { label: "Leave", href: "/admin/hrm/leave" },
          { label: "Holidays", href: "/admin/hrm/holidays" },
          { label: "Payroll", href: "/admin/hrm/payroll" },
          { label: "Requests & Approvals", href: "/admin/hrm/requests" },
          { label: "Reports", href: "/admin/hrm/reports" },
          { label: "HRM Settings", href: "/admin/hrm/settings" },
        ],
      },
    ],
  },
  {
    label: "B2B & B2C BOOKINGS",
    groups: [
      {
        label: "Booking Management",
        icon: CalendarDays,
        items: [
          { label: "All Bookings", href: "/admin/all-bookings" },
          { label: "Create Booking", href: "/admin/create-booking" },
          { label: "Booking Calendar", href: "/admin/booking-calendar" },
        ],
      },
      {
        label: "Tour Package",
        icon: Globe2,
        items: [
          { label: "Tour Booking", href: "/admin/tour-bookings" },
          { label: "Tours", href: "/admin/tours" },
          { label: "Facilities & Specifications", href: "/admin/features?module=tour" },
          { label: "Categories", href: "/admin/categories?module=tour" },
          { label: "Destinations", href: "/admin/destinations" },
          { label: "Locations", href: "/admin/locations?module=tour" },
          { label: "Tour Settings", href: "/admin/tours/settings" },
        ],
      },
      {
        label: "Hajj & Umrah",
        icon: Landmark,
        items: [
          { label: "Dashboard", href: "/admin/hajj-umrah" },
          { label: "Packages", href: "/admin/hajj-umrah/packages" },
          { label: "Bookings", href: "/admin/hajj-umrah/bookings" },
          { label: "Pilgrims", href: "/admin/hajj-umrah/pilgrims" },
          { label: "Document Readiness", href: "/admin/hajj-umrah/documents" },
          { label: "Groups & Departures", href: "/admin/hajj-umrah/groups" },
          { label: "Reports", href: "/admin/hajj-umrah/reports" },
          { label: "Settings", href: "/admin/hajj-umrah/settings" },
        ],
      },
      {
        label: "Visa Processing",
        icon: FileSearch,
        items: [
          { label: "Dashboard", href: "/admin/visa" },
          { label: "Visa Process", href: "/admin/visa-bookings" },
          { label: "Visa List", href: "/admin/visas" },
          { label: "Appointments", href: "/admin/visa/appointments" },
          { label: "Embassies", href: "/admin/visa/embassies" },
          { label: "Reports", href: "/admin/visa/reports" },
          { label: "Visa Settings", href: "/admin/visa/settings" },
        ],
      },
      {
        label: "Flights",
        icon: Plane,
        items: [
          { label: "Flight Search", href: "/admin/flights" },
          { label: "Flight Bookings", href: "/admin/flights/bookings" },
          { label: "Settings", href: "/admin/flights/api-setup" },
        ],
      },
      {
        label: "Hotel",
        icon: Hotel,
        items: [
          { label: "Dashboard", href: "/admin/hotel" },
          { label: "Hotels", href: "/admin/hotels" },
          { label: "Hotel Bookings", href: "/admin/hotel-bookings" },
          { label: "Front Desk", href: "/admin/hotel/front-desk" },
          { label: "Daily Report", href: "/admin/hotel/reports/daily" },
          { label: "Extra Services", href: "/admin/hotels/extra-services" },
          { label: "Categories", href: "/admin/categories?module=hotel" },
          { label: "Locations", href: "/admin/locations?module=hotel" },
          { label: "Features / Amenities", href: "/admin/features?module=hotel" },
          { label: "Hotel Settings", href: "/admin/hotel/settings" },
        ],
      },
    ],
  },
  {
    label: "COMMUNICATION",
    groups: [
      {
        label: "Conversations",
        icon: MessageSquare,
        items: [
          { label: "Dashboard", href: "/admin/conversations" },
          { label: "Inbox", href: "/admin/conversations/inbox" },
          { label: "Contacts", href: "/admin/conversations/contacts" },
          { label: "Reports", href: "/admin/conversations/reports" },
          { label: "Settings", href: "/admin/conversations/settings" },
        ],
      },
      {
        label: "Coupons & Offers",
        icon: Tags,
        items: [{ label: "Coupons & Offers", href: "/admin/coupons" }],
      },
      {
        label: "Marketing Tools",
        icon: Megaphone,
        items: [
          { label: "Campaigns", href: "/admin/marketing/campaigns" },
          { label: "Audiences", href: "/admin/marketing/audiences" },
          { label: "Newsletter Subscribers", href: "/admin/marketing/subscribers" },
          { label: "Campaign Reports", href: "/admin/marketing/reports" },
          { label: "Settings", href: "/admin/marketing/settings" },
        ],
      },
      {
        label: "Customer Enquiries",
        icon: Bell,
        items: [{ label: "Customer Enquiries", href: "/admin/inbox" }],
      },
      {
        label: "Support Tickets",
        icon: Headphones,
        items: [
          { label: "Dashboard", href: "/admin/support-tickets" },
          { label: "All Tickets", href: "/admin/support-tickets/tickets" },
          { label: "My Tickets", href: "/admin/support-tickets/my-tickets" },
          { label: "Categories", href: "/admin/support-tickets/categories" },
          { label: "Reports", href: "/admin/support-tickets/reports" },
          { label: "Settings", href: "/admin/support-tickets/settings" },
        ],
      },
      {
        label: "Notifications",
        icon: Bell,
        items: [{ label: "Notifications", href: "/admin/notifications" }],
      },
    ],
  },
  {
    label: "B2B MANAGEMENT",
    groups: [
      {
        label: "Agent Management",
        icon: Store,
        items: [
          { label: "Dashboard", href: "/admin/agent-management" },
          { label: "Agents", href: "/admin/agent-management/agents" },
          { label: "Bookings", href: "/admin/agent-management/bookings" },
          { label: "Commissions & Payouts", href: "/admin/agent-management/commissions" },
          { label: "Performance", href: "/admin/agent-management/performance" },
          { label: "Settings", href: "/admin/agent-management/settings" },
        ],
      },
      {
        label: "B2B Portal",
        icon: Building2,
        items: [
          { label: "Dashboard", href: "/admin/b2b-portal" },
          { label: "Portal Access", href: "/admin/b2b-portal/agents" },
          { label: "Deposit Requests", href: "/admin/b2b-portal/deposits" },
          { label: "Ticket Requests", href: "/admin/b2b-portal/flight-requests" },
          { label: "Pricing & Markup", href: "/admin/b2b-portal/pricing" },
          { label: "Portal Settings", href: "/admin/b2b-portal/settings" },
        ],
      },
      {
        label: "Vendor Management",
        icon: Package,
        items: [
          { label: "Dashboard", href: "/admin/vendor-management" },
          { label: "Vendors", href: "/admin/vendor-management/vendors" },
          { label: "Content Review", href: "/admin/vendor-management/change-requests" },
          { label: "Vendor Services", href: "/admin/vendor-management/services" },
          { label: "Vendor Bookings", href: "/admin/vendor-management/bookings" },
          { label: "Vendor Payments", href: "/admin/vendor-management/payments" },
          { label: "Performance & Reviews", href: "/admin/vendor-management/performance-reviews" },
          { label: "Settings", href: "/admin/vendor-management/settings" },
        ],
      },
    ],
  },
  {
    label: "CONTENT MANAGEMENT",
    groups: [
      {
        label: "Content Management",
        icon: FileText,
        items: [
          { label: "Website Editor", href: "/admin/homepage" },
          { label: "Pages", href: "/admin/pages" },
          { label: "Details Templates", href: "/admin/details-templates" },
          { label: "Menu Builder", href: "/admin/menu" },
          { label: "Themes", href: "/admin/themes" },
          { label: "Media Library", href: "/admin/media/library" },
          { label: "Reviews", href: "/admin/reviews" },
          { label: "Testimonials", href: "/admin/testimonials" },
          { label: "FAQ", href: "/admin/faq" },
        ],
      },
      {
        label: "Blogs",
        icon: BookOpen,
        items: [
          { label: "All Blogs", href: "/admin/all-blogs" },
          { label: "Add New Blog", href: "/admin/add-new-blog" },
          { label: "Blog Categories", href: "/admin/blog-categories" },
          { label: "Comments", href: "/admin/blog-comments" },
          { label: "Blog Settings", href: "/admin/blog-settings" },
        ],
      },
    ],
  },
  {
    label: "SETTINGS",
    groups: [
      {
        label: "Multi-Language",
        icon: Globe2,
        items: [
          { label: "Language List", href: "/admin/languages" },
          { label: "Translation", href: "/admin/languages/translations" },
        ],
      },
      {
        label: "General Settings",
        icon: Settings,
        items: [{ label: "General Settings", href: "/admin/settings" }],
      },
      {
        label: "Users & Roles",
        icon: ShieldCheck,
        items: [
          { label: "Staffs", href: "/admin/users" },
          { label: "Teams", href: "/admin/teams" },
          { label: "Roles & Permissions", href: "/admin/roles" },
          { label: "Activity Logs", href: "/admin/activity-logs" },
        ],
      },
      {
        label: "Modules & Add-ons",
        icon: Blocks,
        items: [{ label: "Modules & Add-ons", href: "/admin/modules-addons" }],
      },
      {
        label: "Document Intelligence",
        icon: FileSearch,
        items: [
          { label: "Dashboard", href: "/admin/document-intelligence" },
          { label: "OCR Settings", href: "/admin/document-intelligence/settings" },
          { label: "Scan History", href: "/admin/document-intelligence/scans" },
          { label: "Logs", href: "/admin/document-intelligence/logs" },
        ],
      },
      {
        label: "Google Sheets",
        icon: ReceiptText,
        items: [{ label: "Google Sheets", href: "/admin/google-sheets" }],
      },
    ],
  },
];

export const quickActions = [
  { label: "Create booking", href: "/admin/create-booking", icon: CalendarDays },
  { label: "Create customer", href: "/admin/customers?new=1", icon: Users },
  { label: "Add tour", href: "/admin/tours?new=1", icon: Globe2 },
  { label: "Add hotel", href: "/admin/hotels?new=1", icon: BedDouble },
  { label: "Add visa package", href: "/admin/visas?new=1", icon: FileSearch },
  { label: "Create quotation", href: "/admin/quotations", icon: ReceiptText },
  { label: "Create task", href: "/admin/task-management/tasks", icon: ClipboardList },
];

export const sidebarIcon = CreditCard;
export const analyticsIcon = BarChart3;
export const ticketIcon = Ticket;
