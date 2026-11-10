import type { AppRole } from "@/lib/access";
import { canAccessPath } from "@/lib/access";
import { navigation, type NavSection } from "@/lib/nav";

/** Navigation tree trimmed to the modules a role is allowed to open. */
export function navigationForRole(role: AppRole): NavSection[] {
  return navigation
    .map((section) => ({
      ...section,
      groups: section.groups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => canAccessPath(role, item.href)),
        }))
        .filter((group) => group.items.length > 0),
    }))
    .filter((section) => section.groups.length > 0);
}
