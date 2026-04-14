import type { Dress } from "@/lib/mock-data";

export type PublicBookingSlot = {
  id: string;
  pickupDate: string;
  returnDate: string;
};

export type PublicCatalogDress = Dress & {
  nextBookedDate?: string | null;
  upcomingBookings: PublicBookingSlot[];
};

export function getDressAvailabilityLabel(dress: PublicCatalogDress) {
  return dress.status === "متاح" ? "متاح" : "محجوز";
}

export function getDressAvailabilityTone(dress: PublicCatalogDress) {
  return dress.status === "متاح" ? "success" : "warning";
}
