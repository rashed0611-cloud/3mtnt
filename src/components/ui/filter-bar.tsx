"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterConfig {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}

export function FilterBar({
  searchKey = "q",
  placeholder = "Search…",
  filters = [],
  className,
  children,
}: {
  searchKey?: string;
  placeholder?: string;
  filters?: FilterConfig[];
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [term, setTerm] = useState(searchParams.get(searchKey) ?? "");
  const hasFilters = Array.from(searchParams.keys()).some((key) => key !== "page");

  useEffect(() => {
    setTerm(searchParams.get(searchKey) ?? "");
  }, [searchParams, searchKey]);

  function update(next: URLSearchParams) {
    next.delete("page");
    const query = next.toString();
    startTransition(() => router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false }));
  }

  function applySearch(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value.trim()) next.set(searchKey, value.trim());
    else next.delete(searchKey);
    update(next);
  }

  function applyFilter(name: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    update(next);
  }

  return (
    <div className={cn("flex flex-col gap-2.5 lg:flex-row lg:items-center", className)}>
      <form
        className="relative w-full lg:max-w-[300px]"
        onSubmit={(event) => {
          event.preventDefault();
          applySearch(term);
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            const value = event.target.value;
            if (value === "") applySearch("");
          }}
          placeholder={placeholder}
          className="h-9 w-full rounded-control border border-line bg-white pl-9 pr-9 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          aria-label={placeholder}
        />
        {term ? (
          <button
            type="button"
            onClick={() => {
              setTerm("");
              applySearch("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-200"
          >
            Enter
          </button>
        )}
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <select
            key={filter.name}
            value={searchParams.get(filter.name) ?? ""}
            onChange={(event) => applyFilter(filter.name, event.target.value)}
            className="h-9 rounded-control border border-line bg-white px-2.5 pr-7 text-[12px] text-slate-600 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            aria-label={filter.label}
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
        {children}
        {hasFilters ? (
          <button
            onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}
            className="inline-flex h-9 items-center gap-1 rounded-control px-2 text-[12px] font-medium text-slate-500 hover:bg-slate-100"
          >
            <X className="h-3.5 w-3.5" /> Reset
          </button>
        ) : null}
        {pending ? <span className="text-[11px] text-muted">Updating…</span> : null}
      </div>
    </div>
  );
}
