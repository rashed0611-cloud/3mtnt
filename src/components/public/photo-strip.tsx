import { cn } from "@/lib/utils";

/**
 * Related-photo strip used on public catalogue detail pages. Renders nothing
 * when a product has no extra photos, so the gradient hero stays the only
 * visual.
 */
export function PhotoStrip({ images, className }: { images: string[]; className?: string }) {
  const photos = images.filter(Boolean).slice(0, 6);
  if (!photos.length) return null;

  return (
    <section className={cn("mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8", className)}>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((url, index) => (
          <div key={`${url}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" loading="lazy" className="h-44 w-full object-cover sm:h-48" />
          </div>
        ))}
      </div>
    </section>
  );
}
