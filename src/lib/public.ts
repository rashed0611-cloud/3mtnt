const GRADIENTS = [
  "from-sky-500 via-blue-600 to-indigo-700",
  "from-cyan-500 via-teal-600 to-emerald-700",
  "from-amber-400 via-orange-500 to-rose-600",
  "from-violet-500 via-purple-600 to-fuchsia-700",
  "from-emerald-500 via-green-600 to-teal-700",
  "from-rose-400 via-pink-500 to-red-600",
  "from-slate-600 via-slate-700 to-slate-900",
  "from-indigo-500 via-blue-600 to-cyan-600",
];

export function gradientFor(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

export function destinationInitials(destination: string) {
  return destination
    .split(/[\s,/]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export const SERVICE_TABS = [
  { key: "tours", label: "Tours", href: "/tours", placeholder: "Where would you like to go?" },
  { key: "hotels", label: "Hotels", href: "/hotels", placeholder: "City, area or hotel name" },
  { key: "visas", label: "Visas", href: "/visas", placeholder: "Country or visa type" },
  { key: "hajj-umrah", label: "Hajj & Umrah", href: "/hajj-umrah", placeholder: "Search packages" },
] as const;

export type ServiceTabKey = (typeof SERVICE_TABS)[number]["key"];
