import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { DressImageInput } from "@/lib/dress-gallery";

export async function syncDressImages(
  supabase: SupabaseClient<Database>,
  dressId: string,
  atelierId: string,
  imageItems: DressImageInput[]
) {
  const { error: deleteError } = await supabase
    .from("dress_images")
    .delete()
    .eq("dress_id", dressId)
    .eq("atelier_id", atelierId);

  if (deleteError) {
    throw deleteError;
  }

  if (imageItems.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from("dress_images").insert(
    imageItems.map((item, index) => ({
      atelier_id: atelierId,
      dress_id: dressId,
      storage_path: item.path,
      shot_type: item.shotType,
      sort_order: index
    }))
  );

  if (insertError) {
    throw insertError;
  }
}
