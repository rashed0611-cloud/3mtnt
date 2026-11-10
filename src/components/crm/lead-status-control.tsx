"use client";

import { useRef } from "react";
import { updateLeadStatusAction } from "@/app/admin/actions";
import type { LeadStatus } from "@/lib/types";
import { titleCase } from "@/lib/utils";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "proposal_sent", "negotiation", "converted", "lost"];

export function LeadStatusControl({ id, status, returnTo }: { id: string; status: LeadStatus; returnTo?: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updateLeadStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="returnTo" value={returnTo ?? "/admin/crm/leads"} />
      <select
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="h-7 rounded-control border border-line bg-white px-1.5 pr-6 text-[10.5px] font-medium text-slate-600 outline-none hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20"
        aria-label="Update lead status"
      >
        {STATUSES.map((item) => (
          <option key={item} value={item}>{titleCase(item)}</option>
        ))}
      </select>
    </form>
  );
}
