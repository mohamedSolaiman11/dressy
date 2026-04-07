import { supabaseUrl } from "@/lib/supabase/env";

export const DRESS_IMAGES_BUCKET = "dress-images";
export const MAX_DRESS_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_DRESS_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function getDressImageUrl(path?: string | null) {
  if (!supabaseUrl || !path) {
    return null;
  }

  return `${supabaseUrl}/storage/v1/object/public/${DRESS_IMAGES_BUCKET}/${encodeStoragePath(path)}`;
}
