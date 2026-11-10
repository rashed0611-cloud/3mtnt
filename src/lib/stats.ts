import type { Booking, DashboardStats, Database } from "@/lib/types";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date);
}

export function computeDashboardStats(db: Database): DashboardStats {
  const now = new Date();
  const currentMonth = monthKey(now);
  const today = now.toISOString().slice(0, 10);

  const thisMonthBookings = db.bookings.filter((b) => monthKey(new Date(b.createdAt)) === currentMonth);
  const incomeThisMonth = thisMonthBookings.reduce((sum, b) => sum + b.paid, 0);

  const bookingsByStatus: Record<string, number> = {};
  for (const booking of db.bookings) {
    bookingsByStatus[booking.status] = (bookingsByStatus[booking.status] ?? 0) + 1;
  }

  const bookingMomentum = Array.from({ length: 6 }, (_, index) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const key = monthKey(d);
    const rows = db.bookings.filter((b) => monthKey(new Date(b.createdAt)) === key);
    return {
      month: monthLabel(d),
      bookings: rows.length,
      value: rows.reduce((sum, b) => sum + b.total, 0),
    };
  });

  const openStatuses = new Set(["draft", "pending", "processing", "reserved", "confirmed", "approved", "ready_to_travel", "on_hold"]);
  const openBookings = db.bookings.filter((b) => openStatuses.has(b.status)).length;
  const receivables = db.invoices.reduce((sum, i) => sum + i.due, 0);
  const overdueInvoices = db.invoices.filter((i) => i.due > 0 && i.dueDate < today).length;
  const invoiceValue = db.invoices.reduce((sum, i) => sum + i.total, 0);
  const income = db.bookings.reduce((sum, b) => sum + b.paid, 0);
  const transactions = db.bookings.filter((b) => b.paid > 0).length;

  const costRate: Record<Booking["serviceType"], number> = { tour: 0.62, hotel: 0.58, visa: 0.28, hajj: 0.72 };
  const expenses = db.bookings.reduce((sum, b) => {
    if (b.paid <= 0 || b.total <= 0) return sum;
    return sum + Math.round(b.total * costRate[b.serviceType] * (b.paid / b.total));
  }, 0);

  const openTasks = db.tasks.filter((t) => !["completed", "cancelled"].includes(t.status));
  const inProgressTasks = db.tasks.filter((t) => t.status === "in_progress");
  const overdueTasks = openTasks.filter((t) => t.dueDate < today);
  const activeLeads = db.leads.filter((l) => !["converted", "lost"].includes(l.status));
  const newLeads = db.leads.filter((l) => l.status === "new");
  const convertedLeads = db.leads.filter((l) => l.status === "converted");

  return {
    incomeThisMonth,
    bookingsThisMonth: thisMonthBookings.length,
    openBookings,
    totalCustomers: db.customers.length,
    newCustomersThisMonth: db.customers.filter((c) => monthKey(new Date(c.createdAt)) === currentMonth).length,
    receivables,
    overdueInvoices,
    bookingsByStatus,
    bookingMomentum,
    recentBookings: [...db.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    documents: {
      proposals: 0,
      quotations: 0,
      invoices: db.invoices.length,
      invoiceValue,
    },
    finance: {
      income,
      expenses,
      netProfit: income - expenses,
      refunds: 0,
      transactions,
      suppliers: db.suppliers.length,
    },
    operations: {
      tasks: {
        open: openTasks.length,
        inProgress: inProgressTasks.length,
        overdue: overdueTasks.length,
        total: db.tasks.length,
      },
      leads: {
        active: activeLeads.length,
        new: newLeads.length,
        converted: convertedLeads.length,
        total: db.leads.length,
      },
      agents: {
        active: db.agents.filter((a) => a.status === "active").length,
        inactive: db.agents.filter((a) => a.status === "inactive").length,
        bookings: db.agents.reduce((sum, a) => sum + a.bookings, 0),
        total: db.agents.length,
      },
      support: { open: 0, urgent: 0, unassigned: 0, total: 0 },
      suppliers: {
        active: db.suppliers.filter((s) => s.status === "active").length,
        awaiting: 0,
        openBookings: 0,
        total: db.suppliers.length,
      },
    },
  };
}

export interface CustomerRow {
  customer: Database["customers"][number];
  bookings: number;
  due: number;
  lastService?: string;
  lastServiceType?: Booking["serviceType"];
}

export function customerRows(db: Database): CustomerRow[] {
  return db.customers.map((customer) => {
    const bookings = db.bookings.filter((b) => b.customerId === customer.id);
    const latest = [...bookings].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
    return {
      customer,
      bookings: bookings.length,
      due: bookings.reduce((sum, b) => sum + b.due, 0),
      lastService: latest?.startDate,
      lastServiceType: latest?.serviceType,
    };
  });
}

export function bookingSummary(db: Database) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = db.bookings.filter((b) => b.startDate >= today).length;
  const paymentDue = db.bookings.filter((b) => b.due > 0).length;
  const dueValue = db.bookings.reduce((sum, b) => sum + b.due, 0);
  return {
    total: db.bookings.length,
    needsAttention: db.bookings.filter((b) => ["pending", "processing", "on_hold"].includes(b.status)).length,
    upcoming,
    confirmed: db.bookings.filter((b) => b.status === "confirmed").length,
    paymentDue,
    dueValue,
    cancelled: db.bookings.filter((b) => ["cancelled", "rejected"].includes(b.status)).length,
  };
}
