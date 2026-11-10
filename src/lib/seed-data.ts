import type {
  Activity,
  Agent,
  Booking,
  BookingStatus,
  Customer,
  Database,
  HajjPackage,
  Hotel,
  Invoice,
  Lead,
  PaymentStatus,
  Supplier,
  Task,
  Tour,
  VisaPackage,
} from "@/lib/types";

const DAY = 86_400_000;

function iso(date: Date) {
  return date.toISOString();
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysFromNow(days: number, hour = 9) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setTime(d.getTime() + days * DAY);
  return d;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const STAFF = ["Sam Rahman", "Neyamul Kobir", "Md Rohim Mia", "Travalsuiteerp"];

const CUSTOMER_NAMES = [
  "Neyamul Kobir",
  "Md Galib Al Nahian",
  "Delwar Hossain",
  "Farida Begum",
  "Rafiqul Islam",
  "Tasnim Jahan",
  "Mizanur Karim",
  "Sadia Akter",
  "Arif Hossain",
  "Nabila Rahman",
  "Parvin Akter",
  "Zahirul Islam",
  "Mahmuda Khatun",
  "Ibrahim Khalil",
  "Farhana Yeasmin",
  "Nazmul Huda",
  "Kohinoor Begum",
  "Shahin Mia",
  "Rumana Akter",
  "Ashraful Alam",
  "Sadia Islam",
  "Jahangir Alam",
  "Nasrin Sultana",
  "Shafiqur Rahman",
  "Moushumi Das",
  "Tanvir Ahmed",
  "Rehana Parvin",
  "Kamal Uddin",
  "Sharmin Akter",
  "Anwar Hossain",
  "Lutfun Nahar",
  "Faisal Mahmud",
  "Nusrat Jahan",
  "Rashed Khan",
  "Sumaiya Islam",
  "Imran Chowdhury",
  "Dilara Begum",
  "Habibur Rahman",
  "Ayesha Siddika",
  "Monirul Islam",
  "Rokeya Khatun",
  "Sabbir Ahmed",
  "Jannatul Ferdous",
  "Tariqul Islam",
];

const CUSTOMER_COMPANIES = [
  "Naveen Imports Ltd.",
  "Skyline Travel Partner",
  "Green Leaf Holidays",
  "Meghna Textiles",
  "Padma Foods",
  "Jamuna Logistics",
  "Crescent Traders",
  "Bay View Group",
];

const TOUR_SEED: Array<[string, string, Tour["type"], number, number, number]> = [
  ["Bali Temples & Sunset Coast", "Bali", "custom", 5, 4, 37900],
  ["North Malé Atoll Resort Break", "Maldives", "custom", 4, 3, 74900],
  ["Lauterbrunnen & Grindelwald Valley Walks", "Switzerland", "custom", 6, 5, 149000],
  ["Dubai Future & Marina City Break", "Dubai", "custom", 4, 3, 52900],
  ["Bangkok Chinatown & Canal Explorer", "Bangkok", "custom", 4, 3, 29900],
  ["Bangkok Temples & Street Food", "Bangkok", "custom", 4, 3, 24900],
  ["Dubai Desert & City Explorer", "Dubai", "custom", 5, 4, 45900],
  ["Bangkok Floating Market Short Break", "Bangkok", "fixed_departure", 3, 2, 19900],
  ["Dubai Desert Safari & Dune Adventure", "Dubai", "custom", 3, 2, 29900],
  ["Dubai Family Theme Parks & Beach Holiday", "Dubai", "fixed_departure", 5, 4, 52900],
  ["Bangkok Private Riverside Romance", "Bangkok", "private", 4, 3, 69900],
  ["Bali Family Island Fun", "Bali", "custom", 5, 4, 44900],
  ["Bali Private Pool Villa Retreat", "Bali", "private", 4, 3, 69900],
  ["Bali Ubud Culture & Rice Terraces", "Bali", "custom", 4, 3, 38900],
  ["Bali Volcano & Nusa Penida Adventure", "Bali", "group", 5, 4, 42900],
  ["Maldives Family Beach Holiday", "Maldives", "custom", 5, 4, 89900],
  ["Maldives Local Island & Snorkel Escape", "Maldives", "group", 4, 3, 54900],
  ["Maldives Manta Ray & Reef Diving Trip", "Maldives", "custom", 6, 5, 115000],
  ["Maldives Overwater Villa Honeymoon", "Maldives", "private", 4, 3, 129000],
  ["Maldives & Dubai Twin-Centre Escape", "Maldives", "custom", 7, 6, 139000],
  ["Swiss Alps Grand Train Journey", "Switzerland", "group", 8, 7, 189000],
  ["Switzerland Family Alpine Holiday", "Switzerland", "custom", 6, 5, 159000],
  ["Zermatt & Matterhorn Hiking Adventure", "Switzerland", "custom", 5, 4, 175000],
  ["Lucerne & Lake Geneva Private Tour", "Switzerland", "private", 5, 4, 245000],
  ["Jungfrau Region Short Break", "Switzerland", "custom", 4, 3, 99000],
  ["Dubai Heritage & Desert Group Tour", "Dubai", "group", 4, 3, 39900],
  ["Dubai Luxury Marina & Palm Escape", "Dubai", "private", 5, 4, 119000],
];

const HOTEL_SEED: Array<[string, string, number, number, number]> = [
  ["Banani Lakeview Hotel", "Dhaka", 4, 3300, 48],
  ["Dubai Marina Waterfront Hotel", "Dubai", 5, 15800, 86],
  ["Patong Bay Resort", "Phuket", 4, 9600, 64],
  ["Galle Fort Ocean Hotel", "Galle", 4, 7400, 32],
  ["Pokhara Lakeside Retreat", "Pokhara", 3, 6600, 28],
  ["Thamel Heritage Hotel", "Kathmandu", 3, 5200, 34],
  ["Shinjuku Skyline Hotel", "Tokyo", 4, 12800, 60],
  ["Kensington Garden Hotel", "London", 5, 17200, 74],
  ["Le Marais Boutique Hotel", "Paris", 4, 15500, 42],
  ["Sultanahmet Heritage Hotel", "Istanbul", 4, 8800, 38],
  ["Marina Bay Sands View", "Singapore", 5, 19800, 92],
  ["Kuta Beachfront Resort", "Bali", 4, 6100, 56],
  ["Seminyak Villa Resort", "Bali", 5, 11200, 44],
  ["Ubud Jungle Retreat", "Bali", 4, 7900, 36],
  ["Male Atoll Lagoon Resort", "Maldives", 5, 22400, 40],
  ["Maafushi Beach Hotel", "Maldives", 3, 6800, 52],
  ["Hulhumale City Hotel", "Maldives", 3, 4900, 46],
  ["Burj View Downtown", "Dubai", 5, 18600, 70],
  ["Palm Jumeirah Resort", "Dubai", 5, 24800, 58],
  ["Deira Creek Hotel", "Dubai", 3, 7200, 66],
  ["Sukhumvit Grand Hotel", "Bangkok", 4, 6900, 78],
  ["Riverside Bangkok Resort", "Bangkok", 4, 8100, 62],
  ["Chiang Mai Old City Hotel", "Chiang Mai", 3, 4600, 40],
  ["Phuket Kata Beach Resort", "Phuket", 4, 9800, 54],
  ["Krabi Cliffside Resort", "Krabi", 4, 8700, 44],
  ["Zurich Central Hotel", "Zurich", 4, 16400, 56],
  ["Interlaken Lakeview Hotel", "Interlaken", 4, 14200, 48],
  ["Geneva Old Town Hotel", "Geneva", 4, 15800, 50],
  ["Lucerne Bridge Hotel", "Lucerne", 4, 13700, 42],
  ["Cox's Bazar Sea View Hotel", "Cox's Bazar", 3, 3900, 68],
  ["Sylhet Tea Garden Resort", "Sylhet", 4, 4300, 36],
];

const VISA_SEED: Array<[string, string, string, number]> = [
  ["Singapore", "Business", "From 5 working days", 8000],
  ["Malaysia", "Tourist", "3–7 working days", 6000],
  ["Australia", "Tourist", "Usually 3–6 weeks", 22500],
  ["Canada", "Tourist", "Usually 4–12 weeks", 19500],
  ["United Kingdom", "Tourist", "Usually 3–4 weeks", 24000],
  ["France", "Tourist", "Usually 15 days or more", 18000],
  ["Sri Lanka", "Tourist", "1–3 working days", 3500],
  ["Nepal", "Tourist", "2 working days at the embassy", 1500],
  ["Maldives", "Tourist", "Issued on arrival", 1500],
  ["Japan", "Tourist", "About 5–10 working days", 6000],
  ["United Arab Emirates", "Transit", "1–2 working days", 6000],
  ["Indonesia", "Tourist", "3–5 working days", 4500],
  ["Thailand", "Tourist", "5–7 working days", 4000],
  ["India", "Tourist", "7–10 working days", 3500],
  ["Vietnam", "Tourist", "5–8 working days", 5000],
  ["Turkey", "Tourist", "10–15 working days", 9500],
  ["Saudi Arabia", "Umrah", "7–10 working days", 12500],
  ["Egypt", "Tourist", "10–12 working days", 8500],
  ["South Korea", "Tourist", "10–15 working days", 7500],
  ["Germany", "Business", "Usually 2–4 weeks", 21000],
  ["Italy", "Tourist", "Usually 15 days or more", 19000],
  ["Spain", "Tourist", "Usually 15 days or more", 18500],
  ["United States", "B1/B2", "Interview based", 28000],
  ["Qatar", "Transit", "3–5 working days", 5500],
];

const HAJJ_SEED: Array<[string, HajjPackage["kind"], string, number, number, number]> = [
  ["Hajj VIP 21 Days", "hajj", "VIP", 1_330_000, 20, 18],
  ["Hajj Premium 30 Days", "hajj", "Premium", 913_000, 30, 22],
  ["Hajj Standard 40 Days", "hajj", "Standard", 654_000, 40, 31],
  ["Hajj General Package 2027", "hajj", "Economy", 428_000, 50, 12],
  ["Women's Group Umrah 10 Days", "umrah", "Standard", 179_000, 25, 9],
  ["Umrah & Taif 12 Days", "umrah", "Standard", 189_000, 30, 14],
  ["Last Ten Nights Ramadan Umrah 14 Days", "ramadan_umrah", "Premium", 249_000, 25, 21],
  ["Ramadan Umrah VIP 21 Days", "ramadan_umrah", "VIP", 329_000, 20, 16],
  ["Ramadan Umrah Economy 15 Days", "ramadan_umrah", "Economy", 169_000, 35, 20],
  ["Senior Care Umrah 14 Days", "umrah", "Assisted", 219_000, 20, 11],
  ["Small Group Umrah 10 Days", "umrah", "Standard", 165_000, 15, 8],
  ["Family Umrah 12 Days", "umrah", "Standard", 171_000, 30, 17],
  ["Economy Umrah 10 Days", "umrah", "Economy", 143_000, 40, 24],
  ["Premium Umrah 14 Days", "umrah", "Premium", 229_000, 25, 19],
  ["Ramadan Umrah Family 12 Days", "ramadan_umrah", "Standard", 199_000, 30, 13],
];

const LEAD_SEED: Array<[string, string | undefined, Lead["source"], string, Lead["status"], number]> = [
  ["Neyamul Kobir", undefined, "facebook", "Singapore family holiday package", "new", 320000],
  ["Naveen Imports Ltd.", "Naveen Imports Ltd.", "website", "Corporate Dubai visa and hotel request", "contacted", 540000],
  ["Skyline Travel Partner", "Skyline Travel Partner", "agent", "Agent block booking for Cox's Bazar", "qualified", 780000],
  ["Michael Chen", undefined, "referral", "Bangladesh heritage tour quotation", "qualified", 260000],
  ["Green Leaf Holidays", "Green Leaf Holidays", "walk_in", "Transport contract for seasonal tours", "proposal_sent", 450000],
  ["Sadia Islam", undefined, "website", "Maldives honeymoon package", "negotiation", 290000],
  ["Rumana Akter", undefined, "phone", "Family Umrah for four pilgrims", "contacted", 680000],
  ["Jahangir Alam", undefined, "facebook", "Bangkok group departure for eight", "lost", 410000],
  ["Kohinoor Begum", undefined, "referral", "Switzerland tour with senior parents", "converted", 920000],
];

const TASK_SEED: Array<[string, string, Task["priority"], Task["status"], number, number, number]> = [
  ["Complete Thailand tour handover", "TB-000002", "low", "completed", -7, 3, 3],
  ["Review passport renewal cases", "VB-000007", "medium", "in_progress", -5, 2, 1],
  ["Finalize Umrah package payment follow-up", "HU-000015", "high", "pending", -3, 2, 0],
  ["Collect Singapore visa documents", "VB-000003", "urgent", "blocked", -4, 3, 2],
];

const ACTIVITY_SEED: Array<[string, string, string, Activity["severity"], string, number]> = [
  ["Travalsuiteerp", "Booking Created", "Hotel", "info", "HB-0001 created for Single Room Guest", 0],
  ["Travalsuiteerp", "Invoice Generated", "Sales", "info", "Invoice INV-2026-00027 generated for TB-000002", 0],
  ["Sam Rahman", "Lead Created", "Crm", "info", "Website lead Naveen Imports Ltd. added to the pipeline", -1],
  ["Travalsuiteerp", "Payment Recorded", "Sales", "info", "Partial payment recorded on TB-000002", -1],
  ["Travalsuiteerp", "Status Updated", "Booking", "info", "TB-000001 moved from processing to confirmed", -2],
  ["Neyamul Kobir", "Follow Up Scheduled", "Crm", "info", "Follow-up scheduled for Naveen Imports Ltd.", -2],
  ["Travalsuiteerp", "Task Created", "Task Management", "info", "Collect Singapore visa documents", -3],
  ["Sam Rahman", "Login Succeeded", "Auth", "info", "Staff session started", -3],
  ["Travalsuiteerp", "Booking Cancelled", "Hotel", "warning", "HB-8Y586Q9G cancelled by customer request", -4],
  ["Travalsuiteerp", "Refund Reviewed", "Finance", "warning", "Refund request opened for HB-8Y586Q9G", -4],
  ["Travalsuiteerp", "Documents Generated", "Visa", "info", "Document checklist generated for VB-000003", -5],
  ["Travalsuiteerp", "Checklist Updated", "Hajj Umrah", "info", "Passport verified for HU-000015", -5],
  ["Sam Rahman", "Login Failed", "Auth", "critical", "Three failed login attempts from a new device", -6],
  ["Travalsuiteerp", "Booking Created", "Tour", "info", "TB-000002 created for Md Galib Al Nahian", -6],
  ["Travalsuiteerp", "Workflow Generated", "Visa", "info", "Processing workflow attached to Malaysia Business Visa", -7],
  ["Travalsuiteerp", "Invoice Generated", "Sales", "info", "Invoice INV-2026-00026 generated for HU-000016", -8],
  ["Neyamul Kobir", "Stay Status Changed", "Hotel", "info", "Banani Lakeview room status set to available", -9],
  ["Travalsuiteerp", "Financial Resolution Updated", "Finance", "info", "Invoice balance recalculated after partial payment", -10],
  ["Travalsuiteerp", "Members Added", "Authorization", "info", "Marketing role assigned to Sam Rahman", -12],
  ["Travalsuiteerp", "Role Created", "Authorization", "info", "Staff role created with 4 permissions", -15],
];

export function buildSeedData(): Database {
  const rand = rng(20261110);
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const customers: Customer[] = CUSTOMER_NAMES.map((name, i) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, ".");
    const corporate = i % 9 === 1 || i % 13 === 4;
    return {
      id: `cus_${String(i + 1).padStart(4, "0")}`,
      code: `CUS-${String(44 - i).padStart(6, "0")}`,
      name,
      company: corporate ? CUSTOMER_COMPANIES[i % CUSTOMER_COMPANIES.length] : undefined,
      email: i === 0 ? "neyamulkn1@gmail.com" : `${slug}@example.com`,
      phone: `+880${1700000000 + i * 13579}`,
      nationality: i % 11 === 0 ? "British" : "Bangladeshi",
      status: i === 7 || i === 26 ? "inactive" : "active",
      tags:
        i === 0
          ? ["VIP", "Hot Lead"]
          : corporate
            ? ["Corporate", "Repeat"]
            : i % 5 === 0
              ? ["Repeat"]
              : [],
      assignedTo: STAFF[i % STAFF.length],
      notes: i === 0 ? "Prefers WhatsApp updates. Passport expires in 2028." : undefined,
      createdAt: iso(daysFromNow(-(1 + Math.floor(rand() * 180)))),
    };
  });

  const tours: Tour[] = TOUR_SEED.map(([title, destination, type, days, nights, price], i) => ({
    id: `tour_${String(i + 1).padStart(3, "0")}`,
    code: `TOUR-${String(i + 1).padStart(3, "0")}`,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    destination,
    type,
    durationDays: days,
    durationNights: nights,
    adultPrice: price,
    childPrice: Math.round(price * 0.65),
    currency: "BDT",
    capacity: type === "fixed_departure" ? 24 : type === "group" ? 30 : 12,
    status: "active",
    featured: i % 4 === 0,
    supplier: ["Bali Discovery DMC", "Atoll Experiences", "Alpine Rail Partners", "Gulf Gateway DMC", "Siam Horizons"][i % 5],
    description: `${title} is a ${days}-day ${destination} experience with hand-picked stays, private transfers and a local English-speaking guide. The pace is balanced between guided discovery and free time.`,
    inclusions: ["Accommodation with breakfast", "Airport transfers", "English-speaking guide", "Entrance fees", "Travel insurance"],
    exclusions: ["International flights", "Visa fees", "Personal expenses", "Optional activities"],
    itinerary: Array.from({ length: Math.min(days, 6) }, (_, day) => ({
      day: day + 1,
      title: ["Arrival & welcome", "Destination discovery", "Local culture", "Coast & sunset", "Free day", "Departure"][day] ?? `Day ${day + 1}`,
      description: ["Meet your guide and settle in.", "Guided highlights with time for photos.", "Markets, food and neighbourhood walks.", "Coastal drive and a relaxed evening.", "Free time for optional experiences.", "Transfer to the airport."][day] ?? "Flexible discovery day.",
    })),
    createdAt: iso(daysFromNow(-(30 + i * 3))),
  }));

  const hotels: Hotel[] = HOTEL_SEED.map(([name, location, stars, price, rooms], i) => ({
    id: `hotel_${String(i + 1).padStart(3, "0")}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    location,
    starRating: stars,
    price,
    currency: "BDT",
    rooms,
    status: "publish",
    featured: i % 5 === 0,
    description: `${name} is a ${stars}-star property in ${location} with comfortable rooms, breakfast and a 24-hour front desk.`,
    amenities: ["Free Wi-Fi", "Breakfast", "Airport pickup", "Pool", "Spa", "Parking"].slice(0, 3 + (i % 4)),
    supplier: ["Own inventory", "Gulf Gateway DMC", "Siam Horizons", "Alpine Rail Partners"][i % 4],
  }));

  const visas: VisaPackage[] = VISA_SEED.map(([country, visaType, processingTime, price], i) => ({
    id: `visa_${String(i + 1).padStart(3, "0")}`,
    country,
    visaType,
    processingTime,
    price,
    currency: "BDT",
    status: "active",
    requiredDocuments: ["Passport copy", "Passport photo", "Bank statement", "Employment letter", "Hotel booking", "Flight itinerary"].slice(0, 3 + (i % 4)),
    description: `${country} ${visaType.toLowerCase()} visa processing with document review, embassy submission and status tracking.`,
  }));

  const hajjPackages: HajjPackage[] = HAJJ_SEED.map(([title, kind, tier, price, capacity, booked], i) => {
    const departure = daysFromNow(120 + i * 14);
    const durationMatch = title.match(/(\d+)\s*days?/i);
    const durationDays = durationMatch ? Number(durationMatch[1]) : kind === "hajj" ? 30 : 12;
    const ret = new Date(departure.getTime() + durationDays * DAY);
    return {
      id: `hajj_${String(i + 1).padStart(3, "0")}`,
      title,
      kind,
      tier,
      departureDate: dateOnly(departure),
      returnDate: dateOnly(ret),
      price,
      currency: "BDT",
      capacity,
      booked,
      status: "active",
    };
  });

  const suppliers: Supplier[] = [
    ["Bali Discovery DMC", "Tours", "Wayan Putra", "+62 812 3456 7890", 0],
    ["Atoll Experiences", "Hotels", "Ahmed Naseer", "+960 777 1122", 0],
    ["Alpine Rail Partners", "Transport", "Claudia Meier", "+41 44 123 4567", 0],
    ["Gulf Gateway DMC", "Tours & Hotels", "Omar Al Farsi", "+971 50 123 4567", 0],
    ["Siam Horizons", "Tours", "Nattaya Chai", "+66 81 234 5678", 0],
    ["Dhaka Air Consolidator", "Flights", "Rafiq Hasan", "+880 1711 223344", 0],
    ["Embassy Visa Services", "Visa", "Shahana Akter", "+880 1811 556677", 0],
  ].map(([name, service, contact, phone, balance], i) => ({
    id: `sup_${String(i + 1).padStart(3, "0")}`,
    name: String(name),
    service: String(service),
    contact: String(contact),
    phone: String(phone),
    balance: Number(balance),
    status: "active" as const,
  }));

  const agents: Agent[] = [
    {
      id: "agn_001",
      code: "AGN-00001",
      name: "FlyZone",
      contact: "Md Rohim Mia",
      phone: "017900000000",
      type: "agency",
      commission: 3,
      bookings: 0,
      sales: 0,
      available: 0,
      status: "active",
    },
    {
      id: "agn_002",
      code: "AGN-00002",
      name: "Far Fly",
      contact: "Saaaam",
      phone: "01722933435",
      type: "agency",
      commission: 8,
      bookings: 0,
      sales: 0,
      available: 0,
      status: "active",
    },
  ];

  const leads: Lead[] = LEAD_SEED.map(([name, company, source, requirement, status, value], i) => ({
    id: `lead_${String(i + 1).padStart(3, "0")}`,
    name,
    company,
    phone: `+880${1711001001 + i * 1000}`,
    email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@example.com`,
    source,
    requirement,
    assignedTo: STAFF[i % STAFF.length],
    priority: i === 0 || i === 3 ? "high" : i === 8 ? "urgent" : "medium",
    tags: i === 0 ? ["Hot Lead", "VIP"] : company ? ["Corporate", "Repeat"] : ["New"],
    status,
    nextFollowUp: status === "converted" || status === "lost" ? undefined : dateOnly(daysFromNow(i - 2)),
    lastContact: dateOnly(daysFromNow(-(i + 1))),
    estimatedValue: value,
    notes: `Requirement: ${requirement}.`,
    createdAt: iso(daysFromNow(-(i + 2))),
  }));

  const statusPlan: BookingStatus[] = [
    "processing", "reserved", "confirmed", "cancelled", "reserved", "processing", "confirmed",
    "approved", "processing", "ready_to_travel", "completed", "departed", "cancelled", "processing",
    "confirmed", "draft", "pending", "processing", "reserved", "confirmed", "approved", "on_hold",
    "processing", "ready_to_travel", "confirmed", "processing", "draft", "reserved", "confirmed",
  ];

  const bookings: Booking[] = statusPlan.map((status, i) => {
    const serviceType: Booking["serviceType"] = i < 13 ? "tour" : i < 19 ? "hotel" : i < 24 ? "visa" : "hajj";
    let title: string;
    let unitPrice: number;
    let start: Date;
    let end: Date;
    let supplier: string | undefined;
    if (serviceType === "tour") {
      const tour = tours[i % tours.length];
      title = tour.title;
      unitPrice = tour.adultPrice;
      start = daysFromNow((i % 18) - 6);
      end = new Date(start.getTime() + tour.durationDays * DAY);
      supplier = tour.supplier;
    } else if (serviceType === "hotel") {
      const hotel = hotels[i % hotels.length];
      title = hotel.name;
      unitPrice = hotel.price * 3;
      start = daysFromNow((i % 14) - 3);
      end = new Date(start.getTime() + 3 * DAY);
      supplier = hotel.supplier;
    } else if (serviceType === "visa") {
      const visa = visas[i % visas.length];
      title = `${visa.country} ${visa.visaType} Visa`;
      unitPrice = visa.price;
      start = daysFromNow((i % 10) - 2);
      end = new Date(start.getTime() + 10 * DAY);
      supplier = "Embassy Visa Services";
    } else {
      const hajj = hajjPackages[i % hajjPackages.length];
      title = hajj.title;
      unitPrice = hajj.price;
      start = new Date(hajj.departureDate);
      end = new Date(hajj.returnDate);
      supplier = "Gulf Gateway DMC";
    }

    const travelers = serviceType === "hajj" ? 1 + (i % 3) : 1 + (i % 4);
    const adults = travelers;
    const children = i % 7 === 0 && serviceType === "tour" ? 1 : 0;
    const subtotal = unitPrice * travelers + (children ? Math.round(unitPrice * 0.65) : 0);
    const discount = i % 6 === 0 ? 2000 : 0;
    const tax = Math.round((subtotal - discount) * 0.05);
    const total = subtotal - discount + tax;
    const paidRatio =
      status === "cancelled" || status === "draft"
        ? 0
        : status === "completed" || status === "confirmed"
          ? 1
          : status === "processing" || status === "reserved"
            ? 0.2
            : 0.35;
    const paid = Math.round(total * paidRatio);
    const due = total - paid;
    const paymentStatus: PaymentStatus = paid <= 0 ? "unpaid" : paid >= total ? "paid" : "partial";
    const customer = customers[i % customers.length];
    const prefix = serviceType === "tour" ? "TB" : serviceType === "hotel" ? "HB" : serviceType === "visa" ? "VB" : "HU";
    const createdAt = daysFromNow(-(i % 12) - 1);

    return {
      id: `bk_${String(i + 1).padStart(4, "0")}`,
      ref: `${prefix}-${String(i + 1).padStart(6, "0")}`,
      serviceType,
      title,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      startDate: dateOnly(start),
      endDate: dateOnly(end),
      travelers: travelers + children,
      adults,
      children,
      subtotal,
      discount,
      tax,
      total,
      paid,
      due,
      currency: "BDT",
      paymentStatus,
      status,
      assignedTo: i % 3 === 0 ? "-" : STAFF[i % STAFF.length],
      supplier,
      source: ["Direct Booking", "Website", "Agent", "Walk In"][i % 4],
      notes: i === 0 ? "Prefers a high floor and airport pickup." : undefined,
      createdAt: iso(createdAt),
      timeline: [
        { at: iso(createdAt), label: "Booking created", note: `${prefix} created in the admin workspace` },
        { at: iso(new Date(createdAt.getTime() + 2 * 3600_000)), label: `Status set to ${status.replace(/_/g, " ")}` },
        ...(paid > 0 ? [{ at: iso(new Date(createdAt.getTime() + 6 * 3600_000)), label: "Payment recorded", note: `৳${paid.toLocaleString()} received` }] : []),
      ],
    };
  });

  const invoices: Invoice[] = bookings
    .filter((b) => b.status !== "draft" && b.status !== "cancelled")
    .slice(0, 26)
    .map((booking, i) => {
      const issue = new Date(booking.createdAt);
      const dueDate = new Date(issue.getTime() + 7 * DAY);
      const status: Invoice["status"] =
        booking.due <= 0 ? "paid" : booking.paid > 0 ? "partial" : dueDate < now ? "overdue" : i < 4 ? "draft" : "sent";
      return {
        id: `inv_${String(i + 1).padStart(4, "0")}`,
        number: `INV-2026-${String(27 - i).padStart(5, "0")}`,
        bookingRef: booking.ref,
        customerName: booking.customerName,
        issueDate: dateOnly(issue),
        dueDate: dateOnly(dueDate),
        total: booking.total,
        paid: booking.paid,
        due: booking.due,
        status,
        type: `${booking.serviceType[0].toUpperCase()}${booking.serviceType.slice(1)} booking`,
        currency: "BDT",
      };
    });

  const tasks: Task[] = TASK_SEED.map(([title, related, priority, status, dueOffset, total, done], i) => ({
    id: `task_${String(i + 1).padStart(3, "0")}`,
    title,
    relatedTo: related,
    assignedTo: "Travalsuiteerp",
    priority,
    status,
    startDate: dateOnly(daysFromNow(dueOffset - 2)),
    dueDate: dateOnly(daysFromNow(dueOffset)),
    subtasks: { done: Math.min(done, total), total },
    checklist: { done: Math.min(done + 1, total + 1), total: total + 1 },
  }));

  const activities: Activity[] = ACTIVITY_SEED.map(([actor, action, module, severity, description, offset], i) => ({
    id: `act_${String(i + 1).padStart(4, "0")}`,
    actor,
    action,
    module,
    severity,
    description,
    createdAt: iso(daysFromNow(offset, 9 + (i % 8))),
  }));

  return {
    customers,
    tours,
    hotels,
    visas,
    hajjPackages,
    bookings,
    invoices,
    leads,
    tasks,
    activities,
    suppliers,
    agents,
    settings: {
      siteName: "3M Tours & Travels ERP",
      tagline: "Travel operations, without the spreadsheets.",
      legalName: "3M Tours & Travels Ltd.",
      email: "hello@3mtours.com",
      phone: "+880 1711 000 000",
      address: "House 12, Road 7, Banani, Dhaka 1213, Bangladesh",
      defaultCurrency: "BDT",
      timezone: "Asia/Dhaka",
      invoicePrefix: "INV",
      taxRate: 5,
      logoText: "3M",
    },
  };
}
