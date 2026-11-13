import { redirect } from "next/navigation";

/** Legacy link kept working: the media library now lives at /admin/gallery. */
export default function MediaLibraryRedirect() {
  redirect("/admin/gallery");
}
