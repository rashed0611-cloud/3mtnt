"use client";

import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactMoney, formatMoney, titleCase } from "@/lib/utils";

const currencyFormatter = (value: number) => formatMoney(value, "BDT", 0);

export function BookingMomentumChart({
  data,
}: {
  data: { month: string; bookings: number; value: number }[];
}) {
  return (
    <div className="h-[248px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b74de" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#0b74de" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} dy={6} />
          <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} width={38} allowDecimals={false} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            width={44}
            tickFormatter={(value: number) => formatCompactMoney(value)}
          />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 24px rgba(15,23,42,0.10)",
              fontSize: 12,
            }}
            formatter={(value: number, name: string) =>
              name === "Gross value" ? [formatMoney(value, "BDT", 0), name] : [`${value} bookings`, name]
            }
          />
          <Bar yAxisId="right" dataKey="value" name="Gross value" fill="url(#barGradient)" radius={[5, 5, 0, 0]} barSize={26} isAnimationActive={false} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="bookings"
            name="Bookings"
            stroke="#0f172a"
            strokeWidth={2}
            dot={{ r: 3, fill: "#0f172a", strokeWidth: 0 }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  pending: "#f59e0b",
  processing: "#3b82f6",
  reserved: "#8b5cf6",
  confirmed: "#10b981",
  approved: "#059669",
  ready_to_travel: "#0ea5e9",
  departed: "#6366f1",
  completed: "#16a34a",
  cancelled: "#ef4444",
  rejected: "#f43f5e",
  delivered: "#22c55e",
  closed: "#64748b",
  on_hold: "#f97316",
};

export function BookingStatusChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const chartData = entries.map(([status, value]) => ({ name: titleCase(status), status, value }));

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-[186px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={57} outerRadius={80} paddingAngle={2} stroke="none" isAnimationActive={false}>
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#cbd5e1"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
              formatter={(value: number, name: string) => [`${value} bookings`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight text-ink">{total}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted">Bookings</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {entries.slice(0, 8).map(([status, value]) => (
          <div key={status} className="flex items-center gap-1.5 text-[11px]">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: STATUS_COLORS[status] ?? "#cbd5e1" }} />
            <span className="min-w-0 flex-1 truncate text-slate-500">{titleCase(status)}</span>
            <span className="font-medium text-slate-700">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RevenueAreaChart({ data }: { data: { month: string; income: number; expenses: number }[] }) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 4, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b74de" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#0b74de" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} dy={6} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            width={48}
            tickFormatter={(value: number) => formatCompactMoney(value)}
          />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
            formatter={(value: number, name: string) => [currencyFormatter(value), name]}
          />
          <Area type="monotone" dataKey="income" name="Income" stroke="#0b74de" strokeWidth={2} fill="url(#incomeGradient)" isAnimationActive={false} />
          <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" strokeWidth={2} fill="url(#expenseGradient)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
