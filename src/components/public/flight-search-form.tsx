"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, ArrowRight, CalendarDays, Plane, Search } from "lucide-react";
import {
  AIRPORTS,
  CABIN_CLASSES,
  TRIP_TYPES,
  addDaysISO,
  airportByCode,
  todayISO,
  type CabinClass,
  type TripType,
} from "@/lib/flights";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-[12.5px] font-medium text-ink outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10";
const labelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500";

export interface FlightSearchDefaults {
  trip?: TripType;
  from?: string;
  to?: string;
  depart?: string;
  ret?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabin?: CabinClass;
}

export function FlightSearchForm({
  defaults,
  compact = false,
  className,
}: {
  defaults?: FlightSearchDefaults;
  compact?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const today = todayISO();
  const fromDefault = airportByCode(defaults?.from)?.code ?? "DAC";
  const toDefault = airportByCode(defaults?.to)?.code ?? "DXB";

  const [trip, setTrip] = useState<TripType>(defaults?.trip ?? "oneway");
  const [from, setFrom] = useState(fromDefault);
  const [to, setTo] = useState(toDefault);
  const [depart, setDepart] = useState(defaults?.depart && defaults.depart >= today ? defaults.depart : addDaysISO(today, 21));
  const [ret, setRet] = useState(
    defaults?.ret && defaults.ret > (defaults.depart ?? today) ? defaults.ret : addDaysISO(depart, 7),
  );
  const [adults, setAdults] = useState(defaults?.adults ?? 1);
  const [children, setChildren] = useState(defaults?.children ?? 0);
  const [infants, setInfants] = useState(defaults?.infants ?? 0);
  const [cabin, setCabin] = useState<CabinClass>(defaults?.cabin ?? "economy");
  const [error, setError] = useState("");

  const airports = useMemo(() => {
    const groups = new Map<string, { code: string; city: string }[]>();
    for (const { code, city, country } of AIRPORTS) {
      const bucket = groups.get(country) ?? [];
      bucket.push({ code, city });
      groups.set(country, bucket);
    }
    return [...groups.entries()]
      .sort((a, b) => (a[0] === "Bangladesh" ? -1 : b[0] === "Bangladesh" ? 1 : a[0].localeCompare(b[0])))
      .map(([country, list]) => ({ country, list: list.sort((a, b) => a.city.localeCompare(b.city)) }));
  }, []);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (from === to) {
      setError("Choose two different airports.");
      return;
    }
    if (trip === "round" && (!ret || ret <= depart)) {
      setError("The return date must be after the departure date.");
      return;
    }
    setError("");
    const params = new URLSearchParams({
      trip,
      from,
      to,
      depart,
      adults: String(adults),
      children: String(children),
      infants: String(infants),
      cabin,
    });
    if (trip === "round") params.set("return", ret);
    router.push(`/flights/search?${params.toString()}`);
  }

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] sm:p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-full bg-slate-100 p-1" role="tablist" aria-label="Trip type">
          {TRIP_TYPES.map((option) => (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={trip === option.key}
              onClick={() => setTrip(option.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold transition",
                trip === option.key ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-ink",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10.5px] text-slate-400">
          <button
            type="button"
            onClick={swap}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 font-semibold text-slate-500 transition hover:border-primary/30 hover:text-primary"
          >
            <ArrowLeftRight className="h-3 w-3" /> Swap
          </button>
          {compact ? null : <span className="hidden sm:inline">Open to everyone · no account needed</span>}
        </div>
      </div>

      <form onSubmit={submit} className="mt-3 space-y-2.5">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClass} htmlFor="flight-from">Flying from</label>
            <div className="relative">
              <Plane className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <select
                id="flight-from"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className={cn(inputClass, "appearance-none pl-9")}
                required
              >
                {airports.map((group) => (
                  <optgroup key={group.country} label={group.country}>
                    {group.list.map((airport) => (
                      <option key={airport.code} value={airport.code}>
                        {airport.city} ({airport.code})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="flight-to">Flying to</label>
            <div className="relative">
              <Plane className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-slate-400" />
              <select
                id="flight-to"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className={cn(inputClass, "appearance-none pl-9")}
                required
              >
                {airports.map((group) => (
                  <optgroup key={group.country} label={group.country}>
                    {group.list.map((airport) => (
                      <option key={airport.code} value={airport.code}>
                        {airport.city} ({airport.code})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="flight-depart">Departure</label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                id="flight-depart"
                type="date"
                value={depart}
                min={today}
                onChange={(event) => {
                  const value = event.target.value;
                  setDepart(value);
                  if (ret <= value) setRet(addDaysISO(value, 7));
                }}
                className={cn(inputClass, "pl-9")}
                required
              />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="flight-return">
              Return {trip === "oneway" ? "(one way)" : ""}
            </label>
            <div className="relative">
              <CalendarDays className={cn("pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2", trip === "oneway" ? "text-slate-300" : "text-slate-400")} />
              <input
                id="flight-return"
                type="date"
                value={trip === "oneway" ? "" : ret}
                min={addDaysISO(depart, 1)}
                onChange={(event) => setRet(event.target.value)}
                disabled={trip === "oneway"}
                required={trip === "round"}
                placeholder="One way"
                className={cn(inputClass, "pl-9 disabled:cursor-not-allowed disabled:bg-slate-100/70 disabled:text-slate-400")}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.2fr_auto]">
          <div>
            <label className={labelClass} htmlFor="flight-adults">Adults</label>
            <select
              id="flight-adults"
              value={adults}
              onChange={(event) => {
                const value = Number(event.target.value);
                setAdults(value);
                if (infants > value) setInfants(value);
              }}
              className={inputClass}
            >
              {Array.from({ length: 9 }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="flight-children">Children</label>
            <select
              id="flight-children"
              value={children}
              onChange={(event) => setChildren(Number(event.target.value))}
              className={inputClass}
            >
              {Array.from({ length: 9 }, (_, index) => index).map((count) => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="flight-infants">Infants</label>
            <select
              id="flight-infants"
              value={Math.min(infants, adults)}
              onChange={(event) => setInfants(Number(event.target.value))}
              className={inputClass}
            >
              {Array.from({ length: Math.min(adults, 4) + 1 }, (_, index) => index).map((count) => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="flight-cabin">Cabin</label>
            <select
              id="flight-cabin"
              value={cabin}
              onChange={(event) => setCabin(event.target.value as CabinClass)}
              className={inputClass}
            >
              {CABIN_CLASSES.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-primary-strong lg:w-auto"
            >
              <Search className="h-3.5 w-3.5" /> Search flights <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {error ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11.5px] font-medium text-red-700">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
