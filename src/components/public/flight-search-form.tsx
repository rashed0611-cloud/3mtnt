"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, ArrowRight, CalendarDays, Plane, Plus, Search, X } from "lucide-react";
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
  extraLegs?: { from: string; to: string; depart: string }[];
}

interface ExtraLeg {
  from: string;
  to: string;
  depart: string;
}

export function FlightSearchForm({
  defaults,
  compact = false,
  bare = false,
  className,
}: {
  defaults?: FlightSearchDefaults;
  compact?: boolean;
  bare?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const today = todayISO();
  const fromDefault = airportByCode(defaults?.from)?.code ?? "DAC";
  const toDefault = airportByCode(defaults?.to)?.code ?? "DXB";
  const departDefault = defaults?.depart && defaults.depart >= today ? defaults.depart : addDaysISO(today, 21);

  const [trip, setTrip] = useState<TripType>(defaults?.trip ?? "oneway");
  const [from, setFrom] = useState(fromDefault);
  const [to, setTo] = useState(toDefault);
  const [depart, setDepart] = useState(departDefault);
  const [ret, setRet] = useState(
    defaults?.ret && defaults.ret > (defaults.depart ?? today) ? defaults.ret : addDaysISO(departDefault, 7),
  );
  const [extraLegs, setExtraLegs] = useState<ExtraLeg[]>(
    defaults?.extraLegs?.length
      ? defaults.extraLegs
      : [{ from: toDefault, to: fromDefault, depart: addDaysISO(departDefault, 5) }],
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

  function updateLeg(index: number, patch: Partial<ExtraLeg>) {
    setExtraLegs((legs) => legs.map((leg, position) => (position === index ? { ...leg, ...patch } : leg)));
  }

  function addLeg() {
    if (extraLegs.length >= 2) return;
    const previous = extraLegs[extraLegs.length - 1];
    setExtraLegs((legs) => [
      ...legs,
      {
        from: previous.to,
        to: previous.from,
        depart: addDaysISO(previous.depart, 4),
      },
    ]);
  }

  function removeLeg(index: number) {
    setExtraLegs((legs) => legs.filter((_, position) => position !== index));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (from === to) {
      setError("Choose two different airports for the first flight.");
      return;
    }
    if (trip === "round" && (!ret || ret <= depart)) {
      setError("The return date must be after the departure date.");
      return;
    }
    if (trip === "multi") {
      let previous = depart;
      for (let index = 0; index < extraLegs.length; index += 1) {
        const leg = extraLegs[index];
        if (leg.from === leg.to) {
          setError(`Choose two different airports for flight ${index + 2}.`);
          return;
        }
        if (!leg.depart || leg.depart <= previous) {
          setError(`Flight ${index + 2} must depart after flight ${index + 1}.`);
          return;
        }
        previous = leg.depart;
      }
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
    if (trip === "multi") {
      extraLegs.forEach((leg, index) => {
        params.set(`from${index + 2}`, leg.from);
        params.set(`to${index + 2}`, leg.to);
        params.set(`depart${index + 2}`, leg.depart);
      });
    }
    router.push(`/flights/search?${params.toString()}`);
  }

  return (
    <div
      className={cn(
        bare ? "" : "rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] sm:p-4",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1 rounded-full bg-slate-100 p-1" role="tablist" aria-label="Trip type">
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
          {trip !== "multi" ? (
            <button
              type="button"
              onClick={swap}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 font-semibold text-slate-500 transition hover:border-primary/30 hover:text-primary"
            >
              <ArrowLeftRight className="h-3 w-3" /> Swap
            </button>
          ) : null}
          {compact || bare ? null : <span className="hidden sm:inline">Open to everyone · no account needed</span>}
        </div>
      </div>

      <form onSubmit={submit} className="mt-3 space-y-2.5">
        <div className={cn("grid gap-2.5", trip === "multi" ? "sm:grid-cols-2 lg:grid-cols-[1fr_1fr_180px]" : "sm:grid-cols-2 lg:grid-cols-4")}>
          <div>
            <label className={labelClass} htmlFor="flight-from">
              {trip === "multi" ? "Flight 1 · from" : "Flying from"}
            </label>
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
            <label className={labelClass} htmlFor="flight-to">
              {trip === "multi" ? "Flight 1 · to" : "Flying to"}
            </label>
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
            <label className={labelClass} htmlFor="flight-depart">
              {trip === "multi" ? "Flight 1 · departure" : "Departure"}
            </label>
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
                  setExtraLegs((legs) => {
                    if (!legs.length || legs[0].depart > value) return legs;
                    return legs.map((leg, index) =>
                      index === 0 ? { ...leg, depart: addDaysISO(value, 5) } : leg,
                    );
                  });
                }}
                className={cn(inputClass, "pl-9")}
                required
              />
            </div>
          </div>
          {trip !== "multi" ? (
            <div>
              <label className={labelClass} htmlFor="flight-return">
                Return {trip === "oneway" ? "(one way)" : ""}
              </label>
              <div className="relative">
                <CalendarDays
                  className={cn(
                    "pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2",
                    trip === "oneway" ? "text-slate-300" : "text-slate-400",
                  )}
                />
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
          ) : null}
        </div>

        {trip === "multi"
          ? extraLegs.map((leg, index) => (
              <div key={index} className="grid gap-2.5 rounded-xl border border-slate-100 bg-slate-50/40 p-2.5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_180px_auto]">
                <div>
                  <label className={labelClass} htmlFor={`flight-from${index + 2}`}>
                    Flight {index + 2} · from
                  </label>
                  <select
                    id={`flight-from${index + 2}`}
                    value={leg.from}
                    onChange={(event) => updateLeg(index, { from: event.target.value })}
                    className={inputClass}
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
                <div>
                  <label className={labelClass} htmlFor={`flight-to${index + 2}`}>
                    Flight {index + 2} · to
                  </label>
                  <select
                    id={`flight-to${index + 2}`}
                    value={leg.to}
                    onChange={(event) => updateLeg(index, { to: event.target.value })}
                    className={inputClass}
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
                <div>
                  <label className={labelClass} htmlFor={`flight-depart${index + 2}`}>
                    Flight {index + 2} · departure
                  </label>
                  <input
                    id={`flight-depart${index + 2}`}
                    type="date"
                    value={leg.depart}
                    min={addDaysISO(index === 0 ? depart : extraLegs[index - 1].depart, 1)}
                    onChange={(event) => updateLeg(index, { depart: event.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeLeg(index)}
                    aria-label={`Remove flight ${index + 2}`}
                    className="inline-flex h-11 w-full items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-500 transition hover:border-red-200 hover:text-red-600 lg:w-11"
                  >
                    <X className="h-3.5 w-3.5" /> <span className="lg:hidden">Remove</span>
                  </button>
                </div>
              </div>
            ))
          : null}

        {trip === "multi" && extraLegs.length < 2 ? (
          <button
            type="button"
            onClick={addLeg}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary/30 bg-primary/5 px-3 py-1.5 text-[11px] font-semibold text-primary transition hover:bg-primary/10"
          >
            <Plus className="h-3 w-3" /> Add another flight
          </button>
        ) : null}

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
