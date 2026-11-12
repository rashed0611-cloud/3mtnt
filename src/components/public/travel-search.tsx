"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  CalendarDays,
  Compass,
  FileCheck2,
  Hotel,
  Landmark,
  MapPin,
  Palmtree,
  Plane,
  Search,
  Users,
} from "lucide-react";
import { FlightSearchForm } from "@/components/public/flight-search-form";
import { addDaysISO, todayISO } from "@/lib/flights";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "flights", label: "Flights", icon: Plane },
  { key: "hotels", label: "Hotels", icon: Hotel },
  { key: "holidays", label: "Holidays", icon: Palmtree },
  { key: "visa", label: "Visa", icon: FileCheck2 },
  { key: "hajj", label: "Hajj & Umrah", icon: Landmark },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-[12.5px] font-medium text-ink outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10";
const labelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500";
const searchButtonClass =
  "inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-6 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-primary-strong lg:w-auto";

export function TravelSearch({
  hotelLocations,
  holidayDestinations,
  visaCountries,
  className,
}: {
  hotelLocations: string[];
  holidayDestinations: string[];
  visaCountries: string[];
  className?: string;
}) {
  const router = useRouter();
  const today = todayISO();
  const [tab, setTab] = useState<TabKey>("flights");

  const [hotelLocation, setHotelLocation] = useState("");
  const [checkIn, setCheckIn] = useState(addDaysISO(today, 21));
  const [checkOut, setCheckOut] = useState(addDaysISO(today, 24));
  const [hotelAdults, setHotelAdults] = useState(2);
  const [rooms] = useState(1);

  const [holidayDestination, setHolidayDestination] = useState("");
  const [holidayType, setHolidayType] = useState("");
  const [travellers, setTravellers] = useState(2);

  const [visaCountry, setVisaCountry] = useState("");
  const [hajjKind, setHajjKind] = useState("");

  function searchHotels(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (hotelLocation) params.set("location", hotelLocation);
    params.set("checkIn", checkIn);
    params.set("checkOut", checkOut);
    params.set("adults", String(hotelAdults));
    params.set("rooms", String(rooms));
    router.push(`/hotels?${params.toString()}`);
  }

  function searchHolidays(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (holidayDestination) params.set("destination", holidayDestination);
    if (holidayType) params.set("type", holidayType);
    params.set("travellers", String(travellers));
    router.push(`/tours?${params.toString()}`);
  }

  function searchVisa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(visaCountry ? `/visas?country=${encodeURIComponent(visaCountry)}` : "/visas");
  }

  function searchHajj(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(hajjKind ? `/hajj-umrah?kind=${encodeURIComponent(hajjKind)}` : "/hajj-umrah");
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.5)] sm:p-4",
        className,
      )}
    >
      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3" role="tablist" aria-label="Travel search">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11.5px] font-semibold transition",
              tab === key ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-ink",
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="pt-3">
        {tab === "flights" ? <FlightSearchForm bare compact /> : null}

        {tab === "hotels" ? (
          <form onSubmit={searchHotels} className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr_auto]">
            <div>
              <label className={labelClass} htmlFor="travel-hotel-location">Where to</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <select
                  id="travel-hotel-location"
                  value={hotelLocation}
                  onChange={(event) => setHotelLocation(event.target.value)}
                  className={cn(inputClass, "appearance-none pl-9")}
                >
                  <option value="">Any destination</option>
                  {hotelLocations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="travel-check-in">Check-in</label>
              <input
                id="travel-check-in"
                type="date"
                value={checkIn}
                min={today}
                onChange={(event) => {
                  setCheckIn(event.target.value);
                  if (checkOut <= event.target.value) setCheckOut(addDaysISO(event.target.value, 3));
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="travel-check-out">Check-out</label>
              <input
                id="travel-check-out"
                type="date"
                value={checkOut}
                min={addDaysISO(checkIn, 1)}
                onChange={(event) => setCheckOut(event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="travel-hotel-guests">Guests</label>
              <select
                id="travel-hotel-guests"
                value={hotelAdults}
                onChange={(event) => setHotelAdults(Number(event.target.value))}
                className={inputClass}
              >
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className={searchButtonClass}>
                <Search className="h-3.5 w-3.5" /> Search hotels
              </button>
            </div>
            <input type="hidden" name="rooms" value={rooms} />
            <p className="flex items-center gap-1.5 text-[10.5px] text-slate-400 sm:col-span-2 lg:col-span-5">
              <BedDouble className="h-3.5 w-3.5" /> {rooms} room{rooms === 1 ? "" : "s"} · nightly rates in BDT · breakfast options shown on each hotel
            </p>
          </form>
        ) : null}

        {tab === "holidays" ? (
          <form onSubmit={searchHolidays} className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_0.9fr_auto]">
            <div>
              <label className={labelClass} htmlFor="travel-holiday-destination">Destination</label>
              <div className="relative">
                <Compass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <select
                  id="travel-holiday-destination"
                  value={holidayDestination}
                  onChange={(event) => setHolidayDestination(event.target.value)}
                  className={cn(inputClass, "appearance-none pl-9")}
                >
                  <option value="">Anywhere worth going</option>
                  {holidayDestinations.map((destination) => (
                    <option key={destination} value={destination}>{destination}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="travel-holiday-type">Holiday style</label>
              <select
                id="travel-holiday-type"
                value={holidayType}
                onChange={(event) => setHolidayType(event.target.value)}
                className={inputClass}
              >
                <option value="">Any style</option>
                <option value="group">Group tour</option>
                <option value="private">Private journey</option>
                <option value="fixed_departure">Fixed departure</option>
                <option value="custom">Custom itinerary</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="travel-holiday-travellers">Travellers</label>
              <select
                id="travel-holiday-travellers"
                value={travellers}
                onChange={(event) => setTravellers(Number(event.target.value))}
                className={inputClass}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                  <option key={count} value={count}>{count} {count === 1 ? "traveller" : "travellers"}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className={searchButtonClass}>
                <Search className="h-3.5 w-3.5" /> Search holidays
              </button>
            </div>
          </form>
        ) : null}

        {tab === "visa" ? (
          <form onSubmit={searchVisa} className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_auto]">
            <div>
              <label className={labelClass} htmlFor="travel-visa-country">Destination country</label>
              <div className="relative">
                <FileCheck2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <select
                  id="travel-visa-country"
                  value={visaCountry}
                  onChange={(event) => setVisaCountry(event.target.value)}
                  className={cn(inputClass, "appearance-none pl-9")}
                >
                  <option value="">All visa destinations</option>
                  {visaCountries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <p className="flex h-11 items-center gap-1.5 text-[10.5px] leading-4 text-slate-400">
                <Users className="h-3.5 w-3.5 shrink-0" /> Family and group applications welcome.
              </p>
            </div>
            <div className="flex items-end">
              <button type="submit" className={searchButtonClass}>
                <Search className="h-3.5 w-3.5" /> Explore visas
              </button>
            </div>
          </form>
        ) : null}

        {tab === "hajj" ? (
          <form onSubmit={searchHajj} className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_auto]">
            <div>
              <label className={labelClass} htmlFor="travel-hajj-kind">Pilgrimage</label>
              <div className="relative">
                <Landmark className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <select
                  id="travel-hajj-kind"
                  value={hajjKind}
                  onChange={(event) => setHajjKind(event.target.value)}
                  className={cn(inputClass, "appearance-none pl-9")}
                >
                  <option value="">All Hajj & Umrah packages</option>
                  <option value="hajj">Hajj</option>
                  <option value="umrah">Umrah</option>
                  <option value="ramadan_umrah">Ramadan Umrah</option>
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <p className="flex h-11 items-center gap-1.5 text-[10.5px] leading-4 text-slate-400">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" /> Departures through the next 12 months.
              </p>
            </div>
            <div className="flex items-end">
              <button type="submit" className={searchButtonClass}>
                <Search className="h-3.5 w-3.5" /> View packages
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
