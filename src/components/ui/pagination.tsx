import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageSize,
  total,
  params,
  basePath,
}: {
  page: number;
  pageSize: number;
  total: number;
  params: Record<string, string | undefined>;
  basePath: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);

  function href(target: number) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && key !== "page") query.set(key, value);
    }
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  }

  const windowStart = Math.max(1, Math.min(current - 1, pages - 2));
  const windowEnd = Math.min(pages, windowStart + 2);
  const numbers = Array.from({ length: windowEnd - windowStart + 1 }, (_, index) => windowStart + index);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row">
      <p className="text-[11px] text-muted">
        Showing <span className="font-medium text-slate-700">{from}</span>–<span className="font-medium text-slate-700">{to}</span> of{" "}
        <span className="font-medium text-slate-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <Link
          href={href(Math.max(1, current - 1))}
          aria-disabled={current <= 1}
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-control border border-line px-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50",
            current <= 1 && "pointer-events-none opacity-40",
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Previous
        </Link>
        {numbers.map((number) => (
          <Link
            key={number}
            href={href(number)}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-control text-[11px] font-medium text-slate-600 hover:bg-slate-100",
              number === current && "bg-primary text-white hover:bg-primary",
            )}
          >
            {number}
          </Link>
        ))}
        <Link
          href={href(Math.min(pages, current + 1))}
          aria-disabled={current >= pages}
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-control border border-line px-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50",
            current >= pages && "pointer-events-none opacity-40",
          )}
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
