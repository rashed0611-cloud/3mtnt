"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updatePackageCoverOverlayAction } from "@/app/admin/gallery/actions";
import { cn } from "@/lib/utils";

type CatalogKind = "tour" | "hotel" | "visa" | "hajj";

/**
 * Brightness control for a package cover. It saves on release rather than on
 * every slider step, so dragging feels immediate and only one request is sent.
 */
export function PackageCoverOverlay({
  kind,
  id,
  overlay: initial,
  className,
}: {
  kind: CatalogKind;
  id: string;
  overlay: number;
  className?: string;
}) {
  const [overlay, setOverlay] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const saved = useRef(initial);

  useEffect(() => {
    setOverlay(initial);
    saved.current = initial;
  }, [initial]);

  function commit(value: number) {
    if (value === saved.current) return;
    saved.current = value;
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("kind", kind);
      formData.set("id", id);
      formData.set("overlay", String(value));
      const result = await updatePackageCoverOverlayAction({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.message ?? "Cover brightness saved.");
    });
  }

  return (
    <div className={cn("rounded-control border border-line bg-white p-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={`cover-overlay-${kind}-${id}`} className="text-[11px] font-medium text-slate-700">
          Cover overlay · {overlay}%
        </label>
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : null}
      </div>
      <input
        id={`cover-overlay-${kind}-${id}`}
        type="range"
        min={0}
        max={85}
        step={5}
        value={overlay}
        onChange={(event) => setOverlay(Number(event.target.value))}
        onPointerUp={(event) => commit(Number(event.currentTarget.value))}
        onKeyUp={(event) => commit(Number(event.currentTarget.value))}
        onBlur={(event) => commit(Number(event.currentTarget.value))}
        className="mt-2 h-2 w-full accent-primary"
      />
      <p className="mt-1 text-[10px] leading-4 text-muted">
        Lower the overlay to brighten the cover photo behind the package title.
      </p>
      {error ? (
        <p role="alert" className="mt-1 text-[10.5px] font-medium text-red-600">
          {error}
        </p>
      ) : message && !pending ? (
        <p className="mt-1 text-[10.5px] font-medium text-emerald-600">{message}</p>
      ) : null}
    </div>
  );
}
