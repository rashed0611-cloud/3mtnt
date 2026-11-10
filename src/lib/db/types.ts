import type {
  Activity,
  Agent,
  AppSettings,
  Booking,
  BookingInput,
  Customer,
  Database,
  HajjPackage,
  Hotel,
  Invoice,
  Lead,
  LeadStatus,
  Supplier,
  Task,
  TaskStatus,
  Tour,
  VisaPackage,
} from "@/lib/types";

export interface Repository {
  getDatabase(): Promise<Database>;

  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | null>;
  createCustomer(input: Partial<Customer>): Promise<Customer>;
  updateCustomer(id: string, input: Partial<Customer>): Promise<Customer | null>;

  getTours(): Promise<Tour[]>;
  createTour(input: Partial<Tour>): Promise<Tour>;
  updateTour(id: string, input: Partial<Tour>): Promise<Tour | null>;

  getHotels(): Promise<Hotel[]>;
  createHotel(input: Partial<Hotel>): Promise<Hotel>;
  updateHotel(id: string, input: Partial<Hotel>): Promise<Hotel | null>;

  getVisas(): Promise<VisaPackage[]>;
  createVisa(input: Partial<VisaPackage>): Promise<VisaPackage>;
  updateVisa(id: string, input: Partial<VisaPackage>): Promise<VisaPackage | null>;

  getHajjPackages(): Promise<HajjPackage[]>;
  createHajjPackage(input: Partial<HajjPackage>): Promise<HajjPackage>;
  updateHajjPackage(id: string, input: Partial<HajjPackage>): Promise<HajjPackage | null>;

  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | null>;
  createBooking(input: BookingInput): Promise<Booking>;
  updateBookingStatus(id: string, status: Booking["status"]): Promise<void>;
  addBookingPayment(id: string, amount: number): Promise<void>;

  getInvoices(): Promise<Invoice[]>;

  getLeads(): Promise<Lead[]>;
  createLead(input: Partial<Lead>): Promise<Lead>;
  updateLeadStatus(id: string, status: LeadStatus): Promise<void>;

  getTasks(): Promise<Task[]>;
  createTask(input: Partial<Task>): Promise<Task>;
  updateTaskStatus(id: string, status: TaskStatus): Promise<void>;

  getActivities(): Promise<Activity[]>;
  getSuppliers(): Promise<Supplier[]>;
  getAgents(): Promise<Agent[]>;

  getSettings(): Promise<AppSettings>;
  updateSettings(input: Partial<AppSettings>): Promise<AppSettings>;
}
