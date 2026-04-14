import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/env";
import { getDressImageUrl } from "@/lib/storage";
import { isDressImageShotType } from "@/lib/dress-image-types";
import {
  atelierProfile,
  dresses as mockDresses,
  bookings as mockBookings,
  type Dress,
  type DressGalleryImage
} from "@/lib/mock-data";
import type { Database } from "@/lib/supabase/database.types";
import type { PublicCatalogDress } from "@/lib/public-catalog-shared";

type AtelierRow = Database["public"]["Tables"]["ateliers"]["Row"];
type DressImageRow = Database["public"]["Tables"]["dress_images"]["Row"];
type DressRow = Database["public"]["Tables"]["dresses"]["Row"] & {
  dress_images?: DressImageRow[] | null;
};
type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

export type PublicCatalogData = {
  atelierId?: string;
  atelierName: string;
  atelierPhone: string;
  dresses: PublicCatalogDress[];
  slug: string;
  source: "supabase" | "mock";
};

function mapDressRow(row: DressRow): Dress {
  const gallery: DressGalleryImage[] = (row.dress_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({
      id: image.id,
      path: image.storage_path,
      url: getDressImageUrl(image.storage_path) ?? "",
      sortOrder: image.sort_order,
      shotType: isDressImageShotType(image.shot_type) ? image.shot_type : "general"
    }));

  const fallbackGallery: DressGalleryImage[] =
    gallery.length > 0 || !row.image_path
      ? gallery
      : [
          {
            id: `${row.id}-primary`,
            path: row.image_path,
            url: getDressImageUrl(row.image_path) ?? "",
            sortOrder: 0,
            shotType: "general"
          }
        ];

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    size: row.size,
    color: row.color,
    price: row.price,
    status: row.status,
    imageTone: row.image_tone,
    imagePath: row.image_path,
    imageUrl: getDressImageUrl(row.image_path),
    gallery: fallbackGallery,
    notes: row.notes
  };
}

async function getSupabaseCatalogBySlug(slug: string) {
  if (!hasSupabaseServiceRoleEnv()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data: atelier } = await supabase
    .from("ateliers")
    .select("*")
    .eq("public_slug", slug)
    .maybeSingle();

  if (!atelier) {
    return null;
  }

  const [{ data: dresses }, { data: bookings }] = await Promise.all([
    supabase
      .from("dresses")
      .select("*, dress_images(*)")
      .eq("atelier_id", atelier.id)
      .order("sort_order", { foreignTable: "dress_images", ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("bookings")
      .select("*")
      .eq("atelier_id", atelier.id)
      .neq("status", "تم الاسترجاع")
      .order("pickup_date", { ascending: true })
  ]);

  if (!dresses) {
    return null;
  }

  return {
    atelierId: atelier.id,
    atelierName: atelier.branch_name ? `${atelier.name} - ${atelier.branch_name}` : atelier.name,
    atelierPhone: atelierProfile.phone,
    dresses: (dresses as DressRow[]).map((dress) => {
      const nextBooking = (bookings as BookingRow[] | null)?.find(
        (booking) => booking.dress_id === dress.id
      );

      return {
        ...mapDressRow(dress),
        nextBookedDate: nextBooking?.pickup_date ?? null,
        upcomingBookings: ((bookings as BookingRow[] | null) ?? [])
          .filter((booking) => booking.dress_id === dress.id)
          .slice(0, 3)
          .map((booking) => ({
            id: booking.id,
            pickupDate: booking.pickup_date,
            returnDate: booking.return_date
          }))
      } satisfies PublicCatalogDress;
    }),
    slug: atelier.public_slug,
    source: "supabase" as const
  };
}

function getMockCatalog(slug: string): PublicCatalogData | null {
  if (slug !== "demo-store") {
    return null;
  }

  return {
    atelierName: atelierProfile.name,
    atelierPhone: atelierProfile.phone,
    dresses: mockDresses.map((dress) => {
      const nextBooking = mockBookings.find(
        (booking) => booking.dressId === dress.id && booking.status !== "تم الاسترجاع"
      );

      return {
        ...dress,
        nextBookedDate: nextBooking?.pickupDate ?? null,
        upcomingBookings: mockBookings
          .filter((booking) => booking.dressId === dress.id && booking.status !== "تم الاسترجاع")
          .slice(0, 3)
          .map((booking) => ({
            id: booking.id,
            pickupDate: booking.pickupDate,
            returnDate: booking.returnDate
          }))
      };
    }),
    slug,
    source: "mock"
  };
}

export async function getPublicCatalogDataBySlug(slug: string): Promise<PublicCatalogData | null> {
  noStore();
  return (await getSupabaseCatalogBySlug(slug)) ?? getMockCatalog(slug);
}

export async function getPublicDressById(slug: string, id: string) {
  const catalog = await getPublicCatalogDataBySlug(slug);

  if (!catalog) {
    return null;
  }

  const dress = catalog.dresses.find((item) => item.id === id) ?? null;

  return {
    ...catalog,
    dress
  };
}

export async function getPublicBookingFormDataBySlug(selectedSlug: string, selectedDressId?: string) {
  const catalog = await getPublicCatalogDataBySlug(selectedSlug);

  if (!catalog) {
    return null;
  }

  const selectedDress =
    catalog.dresses.find((dress) => dress.id === selectedDressId) ?? catalog.dresses[0] ?? null;

  return {
    ...catalog,
    selectedDress
  };
}

export function getPublicWhatsAppLink(phone: string, message: string) {
  const normalizedPhone = phone.startsWith("0") ? `2${phone}` : phone;
  const search = new URLSearchParams({
    text: message
  });

  return `https://wa.me/${normalizedPhone}?${search.toString()}`;
}
