import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "blue" | "green" | "amber" | "red" | "violet" | "slate";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  slate: "bg-slate-800 text-white border-slate-800",
};

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const statusMap: Record<string, { tone: Tone; label: string }> = {
  draft: { tone: "neutral", label: "Draft" },
  pending: { tone: "amber", label: "Pending" },
  processing: { tone: "blue", label: "Processing" },
  reserved: { tone: "violet", label: "Reserved" },
  confirmed: { tone: "green", label: "Confirmed" },
  approved: { tone: "green", label: "Approved" },
  ready_to_travel: { tone: "green", label: "Ready to travel" },
  departed: { tone: "blue", label: "Departed" },
  completed: { tone: "green", label: "Completed" },
  cancelled: { tone: "red", label: "Cancelled" },
  rejected: { tone: "red", label: "Rejected" },
  delivered: { tone: "green", label: "Delivered" },
  closed: { tone: "neutral", label: "Closed" },
  on_hold: { tone: "amber", label: "On hold" },
  unpaid: { tone: "red", label: "Unpaid" },
  partial: { tone: "amber", label: "Partial" },
  paid: { tone: "green", label: "Paid" },
  refunded: { tone: "neutral", label: "Refunded" },
  balance_due: { tone: "amber", label: "Balance due" },
  failed: { tone: "red", label: "Failed" },
  active: { tone: "green", label: "Active" },
  inactive: { tone: "neutral", label: "Inactive" },
  publish: { tone: "green", label: "Published" },
  archived: { tone: "neutral", label: "Archived" },
  new: { tone: "blue", label: "New" },
  contacted: { tone: "blue", label: "Contacted" },
  qualified: { tone: "violet", label: "Qualified" },
  proposal_sent: { tone: "amber", label: "Proposal sent" },
  negotiation: { tone: "amber", label: "Negotiation" },
  converted: { tone: "green", label: "Converted" },
  lost: { tone: "red", label: "Lost" },
  to_do: { tone: "neutral", label: "To do" },
  in_progress: { tone: "blue", label: "In progress" },
  review: { tone: "violet", label: "Review" },
  blocked: { tone: "red", label: "Blocked" },
  sent: { tone: "blue", label: "Sent" },
  overdue: { tone: "red", label: "Overdue" },
  void: { tone: "neutral", label: "Void" },
  high: { tone: "amber", label: "High" },
  urgent: { tone: "red", label: "Urgent" },
  medium: { tone: "blue", label: "Medium" },
  low: { tone: "neutral", label: "Low" },
  info: { tone: "blue", label: "Info" },
  warning: { tone: "amber", label: "Warning" },
  critical: { tone: "red", label: "Critical" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const entry = statusMap[status] ?? { tone: "neutral" as Tone, label: status.replace(/_/g, " ") };
  return (
    <Badge tone={entry.tone} className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {entry.label}
    </Badge>
  );
}
