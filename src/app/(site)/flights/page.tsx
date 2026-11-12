import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Headphones,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  Search,
  Ticket,
  Users,
} from "lucide-react";
import { FlightSearchForm } from "@/components/public/flight-search-form";
import { InquiryForm } from "@/components/public/inquiry-form";
import { getPublicSettings } from "@/lib/db/public";

export const metadata: Metadata = {
  title: "Flights",
  description:
    "Flight quotes, routing advice and ticketing support from 3M Tours & Travels. Economy, business, group and multi-city itineraries handled by a real travel desk.",
};

const SERVICES = [
  {
    title: "Fare quotes & routing",
    text: "Tell us the route and dates. We compare realistic connections, baggage allowances and total journey time — not just the lowest headline fare.",
    icon: Plane,
  },
  {
    title: "Multi-city & open-jaw",
    text: "Complex itineraries across several airlines, built so every connection and baggage rule is clear before you pay.",
    icon: Route,
  },
  {
    title: "Group & corporate travel",
    text: "Seats held for families, tour groups and company travel, with consolidated invoicing and named passenger lists.",
    icon: Users,
  },
  {
    title: "Reissues & refunds",
    text: "Date changes, name corrections and refund applications tracked by the same team that issued the ticket.",
    icon: Ticket,
  },
  {
    title: "Disruption support",
    text: "If a schedule changes or a connection is missed, we help with rebooking options and airline follow-up.",
    icon: Headphones,
  },
  {
    title: "Visa-aware planning",
    text: "Transit rules, arrival cards and connection requirements checked alongside your visa file when both are booked with us.",
    icon: ShieldCheck,
  },
];

const STEPS = [
  { title: "Share the route", text: "Send origin, destination, dates, travellers and any flexibility. A one-way quote needs only the basics." },
  { title: "Review clear options", text: "We send two or three realistic itineraries with fare rules, baggage and total price in BDT." },
  { title: "Approve and ticket", text: "Confirm your choice, pay by your preferred method and receive the e-ticket and invoice together." },
  { title: "Travel with backup", text: "Keep our desk number handy. Schedule changes and disruptions are handled by the team that booked you." },
];

const FAQS = [
  {
    question: "Can I book only a flight without a tour or visa?",
    answer: "Yes. Flight-only bookings are welcome. We quote the fare, explain the rules and issue the ticket once you approve.",
  },
  {
    question: "Do you support group bookings?",
    answer: "Yes. We handle family groups, pilgrimage groups and corporate travel, including seat holds and consolidated invoicing.",
  },
  {
    question: "What happens if the airline changes the schedule?",
    answer: "We monitor the booking and contact you with the new timing and rebooking options. Airline policies determine any fare difference.",
  },
  {
    question: "Are the fares shown in the search live prices?",
    answer:
      "No. The search shows an indicative band built from the route, cabin and trip type so you can plan. Fares move constantly, so the desk confirms the current price, taxes and rules before you commit — the quote you approve is the amount you pay.",
  },
];

export default async function FlightsPage() {
  const settings = await getPublicSettings();

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-primary/10 via-page to-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[10.5px] text-slate-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-slate-600">Flights</span>
          </nav>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold text-sky-700">
                <Plane className="h-3 w-3" /> Flight desk · economy to business
              </span>
              <h1 className="mt-2 text-[30px] font-bold tracking-tight text-ink sm:text-[36px]">Flights, planned properly</h1>
              <p className="mt-1.5 max-w-2xl text-[12.5px] leading-6 text-slate-500">
                Search <span className="font-semibold text-ink">one-way, round-trip or multi-city</span> flights below for an instant
                indicative fare band, then let the same operations team that handles your holiday, hotel or visa file confirm live
                options. No account, no bots, no surprise connection times.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="#flight-search" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong">
                  Search flights <Search className="h-3.5 w-3.5" />
                </Link>
                <Link href="#flight-enquiry" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-600 hover:border-primary/30 hover:text-primary">
                  Request a fare quote <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                <CalendarClock className="h-4 w-4 text-sky-500" />
                <p className="mt-1.5 text-[9.5px] uppercase tracking-wide text-slate-400">Quote turnaround</p>
                <p className="text-[15px] font-bold text-ink">Same business day</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                <BadgeCheck className="h-4 w-4 text-emerald-500" />
                <p className="mt-1.5 text-[9.5px] uppercase tracking-wide text-slate-400">Fare rules</p>
                <p className="text-[15px] font-bold text-ink">Explained upfront</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                <Headphones className="h-4 w-4 text-violet-500" />
                <p className="mt-1.5 text-[9.5px] uppercase tracking-wide text-slate-400">Support</p>
                <p className="text-[15px] font-bold text-ink">Named specialist</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="mt-1.5 text-[9.5px] uppercase tracking-wide text-slate-400">Ticketing</p>
                <p className="text-[15px] font-bold text-ink">Invoice included</p>
              </div>
            </div>
          </div>
        </div>

        <div id="flight-search" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-9 sm:px-6 lg:px-8">
          <FlightSearchForm />
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-slate-400">
            <span>Open to everyone — no login needed.</span>
            <span className="hidden sm:inline">·</span>
            <span>Indicative fares only; the desk confirms live prices before ticketing.</span>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">One travel desk</p>
          <h2 className="mt-1.5 text-[26px] font-bold tracking-tight text-ink">What our flight desk handles</h2>
          <p className="mt-1.5 text-[12.5px] leading-6 text-slate-500">
            From a simple Dhaka–Dubai return to a multi-city group itinerary, every booking is checked by a person before it is issued.
          </p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ title, text, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-[13.5px] font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-[11.5px] leading-5 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-page">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">How it works</p>
              <h2 className="mt-1.5 text-[26px] font-bold tracking-tight text-ink">Four steps from route to ticket</h2>
              <p className="mt-2 max-w-md text-[12.5px] leading-6 text-slate-500">
                We do not take payment until you have seen the itinerary, the fare rules and the final amount. If it does not fit, we
                look again.
              </p>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-[11.5px] leading-5 text-slate-600">
                <p className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>
                    Booking a tour, hotel or visa with us too? Tell us in the enquiry and we will align the flight times with the rest
                    of your itinerary.
                  </span>
                </p>
              </div>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {STEPS.map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {index + 1}
                  </span>
                  <h3 className="mt-2.5 text-[13px] font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-[11.5px] leading-5 text-slate-500">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="flight-enquiry" className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">Fare quote</p>
          <h2 className="mt-1.5 text-[26px] font-bold tracking-tight text-ink">Tell us where you are flying</h2>
          <p className="mt-1.5 max-w-xl text-[12.5px] leading-6 text-slate-500">
            Include the route, travel dates, number of travellers and any flexibility. A specialist replies with realistic options and
            the full fare conditions.
          </p>

          <div className="mt-5 space-y-3">
            {[
              "No payment until you approve the itinerary and fare.",
              "Baggage, transit and change rules explained before ticketing.",
              "Quotes in BDT with the airline and routing named clearly.",
            ].map((item) => (
              <p key={item} className="flex items-start gap-2 text-[12px] leading-5 text-slate-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {item}
              </p>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[11.5px] leading-5 text-slate-600">
            <p className="font-semibold text-ink">Prefer to talk?</p>
            <p className="mt-1">
              Call <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="font-medium text-primary hover:underline">{settings.phone}</a>{" "}
              or email <a href={`mailto:${settings.email}`} className="font-medium text-primary hover:underline">{settings.email}</a>. Office hours
              are Sunday–Thursday, 9:00–18:00 (Asia/Dhaka).
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <h3 className="text-[15px] font-semibold text-ink">Flight questions</h3>
            {FAQS.map((faq) => (
              <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer list-none text-[12.5px] font-semibold text-ink marker:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {faq.question}
                    <span className="text-slate-300 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-2 text-[11.5px] leading-6 text-slate-500">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-[16px] font-bold text-ink">Request a flight quote</h2>
          <p className="mt-1 text-[11.5px] text-slate-500">A specialist replies within one business day.</p>
          <div className="mt-5">
            <InquiryForm defaultInterest="Flights" />
          </div>
        </div>
      </section>
    </>
  );
}
