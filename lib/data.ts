import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { getEgyptTodayIso, getMonthKey } from "@/lib/date";
import {
  atelierProfile,
  bookings as mockBookings,
  customers as mockCustomers,
  dashboardStats as mockDashboardStats,
  dresses as mockDresses,
  formatCurrency,
  formatDateLabel,
  getBookingById as getMockBookingById,
  notifications as mockNotifications,
  paymentSnapshot as mockPaymentSnapshot,
  todayTasks as mockTodayTasks,
  type Booking,
  type Customer,
  type DressGalleryImage,
  type Dress
} from "@/lib/mock-data";
import { isDressImageShotType } from "@/lib/dress-image-types";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { getDressImageUrl } from "@/lib/storage";
import { requireTenantContext } from "@/lib/tenant";

export type DataSourceStatus = "supabase" | "mock";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"] & {
  customer: Database["public"]["Tables"]["customers"]["Row"] | null;
  dress: Database["public"]["Tables"]["dresses"]["Row"] | null;
};

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];
type DressImageRow = Database["public"]["Tables"]["dress_images"]["Row"];
type DressRow = Database["public"]["Tables"]["dresses"]["Row"] & {
  dress_images?: DressImageRow[] | null;
};

async function getSupabaseQueryClient() {
  if (hasSupabasePublicEnv()) {
    return createSupabaseServerClient();
  }

  return null;
}

function getInitials(name: string) {
  return name.trim().slice(0, 1) || "ع";
}

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

function mapBookingRow(row: BookingRow): Booking {
  const bookingSource =
    row.fitting_stage === "حجز من العميلة" || row.note.includes("حجز من الكتالوج العام")
      ? ("website" as const)
      : ("admin" as const);

  return {
    id: row.id,
    customerId: row.customer_id,
    dressId: row.dress_id,
    customerName: row.customer?.name ?? "عميلة",
    phone: row.customer?.phone ?? "",
    dressName: row.dress?.name ?? "فستان",
    dressCode: row.dress?.code ?? "",
    pickupDate: row.pickup_date,
    returnDate: row.return_date,
    timeLabel: row.time_label,
    status: row.status,
    deposit: row.deposit,
    total: row.total,
    paymentStatus: row.payment_status,
    note: row.note,
    fittingStage: row.fitting_stage,
    bookingSource
  };
}

async function fetchSupabaseDresses() {
  const supabase = await getSupabaseQueryClient();
  const { activeAtelier } = await requireTenantContext();

  if (!supabase || !activeAtelier) {
    return null;
  }

  const { data, error } = await supabase
    .from("dresses")
    .select("*, dress_images(*)")
    .eq("atelier_id", activeAtelier.id)
    .order("sort_order", { foreignTable: "dress_images", ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return null;
  }

  return data.map(mapDressRow);
}

async function fetchSupabaseBookings() {
  const supabase = await getSupabaseQueryClient();
  const { activeAtelier } = await requireTenantContext();

  if (!supabase || !activeAtelier) {
    return null;
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
        *,
        customer:customers!bookings_customer_id_fkey (*),
        dress:dresses!bookings_dress_id_fkey (*)
      `
    )
    .eq("atelier_id", activeAtelier.id)
    .order("pickup_date", { ascending: true });

  if (error || !data) {
    return null;
  }

  return (data as BookingRow[]).map(mapBookingRow);
}

async function fetchSupabaseCustomers(bookings: Booking[]) {
  const supabase = await getSupabaseQueryClient();
  const { activeAtelier } = await requireTenantContext();

  if (!supabase || !activeAtelier) {
    return null;
  }

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("atelier_id", activeAtelier.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return null;
  }

  return (data as CustomerRow[]).map((row) => {
    const customerBookings = bookings.filter((booking) => booking.customerId === row.id);
    const latestBooking = [...customerBookings].sort((a, b) =>
      b.pickupDate.localeCompare(a.pickupDate)
    )[0];

    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      area: row.area,
      lastDress: latestBooking?.dressName ?? "لسه مفيش حجز",
      historyCount: customerBookings.length,
      balanceDue: customerBookings.reduce(
        (sum, booking) => sum + Math.max(booking.total - booking.deposit, 0),
        0
      ),
      preferredSize: row.preferred_size || "M",
      initials: getInitials(row.name)
    } satisfies Customer;
  });
}

function createDashboardPayload(bookings: Booking[]) {
  const today = getEgyptTodayIso();
  const currentMonth = getMonthKey(today);
  const todaysBookings = bookings.filter((booking) => booking.pickupDate === today);
  const todaysReturns = bookings.filter((booking) => booking.returnDate === today);
  const revenue = bookings
    .filter((booking) => getMonthKey(booking.pickupDate) === currentMonth)
    .reduce((sum, booking) => sum + booking.total, 0);
  const unpaidAmount = bookings.reduce(
    (sum, booking) =>
      booking.paymentStatus === "غير مدفوع"
        ? sum + Math.max(booking.total - booking.deposit, 0)
        : sum,
    0
  );

  const notifications = [
    {
      id: "notif-delivery",
      title: "تذكير تسليم",
      copy: `فيه ${new Intl.NumberFormat("ar-EG").format(
        todaysBookings.length
      )} حجوزات استلام النهارده.`
    },
    {
      id: "notif-return",
      title: "تذكير استرجاع",
      copy: `فيه ${new Intl.NumberFormat("ar-EG").format(
        todaysReturns.length
      )} فساتين راجعة النهارده وعايزة مراجعة.`
    }
  ];

  const todayTasks = [...todaysBookings, ...todaysReturns].slice(0, 3).map((booking, index) => ({
    id: `task-${booking.id}`,
    title:
      booking.pickupDate === today
        ? `تسليم ${booking.dressName}`
        : `استرجاع ${booking.dressName}`,
    copy: `${booking.customerName} - ${booking.note || "راجعي بيانات الحجز بسرعة."}`,
    time: booking.timeLabel || "12:00 م",
    status: index === 2 ? "تحصيل" : booking.pickupDate === today ? "مهم" : "استرجاع"
  }));

  const dashboardStats = [
    {
      label: "حجوزات النهارده",
      value: todaysBookings.length,
      hint: "مواعيد التسليم والبروفات المؤكدة",
      tone: "bookings" as const
    },
    {
      label: "فساتين التسليم النهارده",
      value: todaysBookings.length,
      hint: "جاهزة للخروج النهارده",
      tone: "delivery" as const
    },
    {
      label: "فساتين الاسترجاع النهارده",
      value: todaysReturns.length,
      hint: "راجعي الحالة أول ما توصل",
      tone: "return" as const
    },
    {
      label: "إيراد الشهر",
      value: revenue,
      hint: "إجمالي حجوزات الشهر الحالي",
      tone: "cash" as const
    }
  ];

  return {
    dashboardStats,
    notifications,
    paymentSnapshot: {
      bookingsCount: bookings.length,
      bookingsGrowth: "مباشر",
      revenue,
      unpaidAmount
    },
    today,
    todayTasks
  };
}

export async function getDataSourceStatus(): Promise<DataSourceStatus> {
  noStore();
  return hasSupabasePublicEnv() ? "supabase" : "mock";
}

export async function getAtelierProfile() {
  return atelierProfile;
}

export async function getDressesData() {
  noStore();
  const dresses = await fetchSupabaseDresses();

  return {
    dresses: dresses ?? mockDresses,
    source: dresses ? ("supabase" as const) : ("mock" as const)
  };
}

export async function getBookingsData() {
  noStore();
  const bookings = await fetchSupabaseBookings();

  return {
    bookings: bookings ?? mockBookings,
    source: bookings ? ("supabase" as const) : ("mock" as const)
  };
}

export async function getCustomersData() {
  noStore();
  const { bookings, source: bookingsSource } = await getBookingsData();
  const customers = await fetchSupabaseCustomers(bookings);

  return {
    customers: customers ?? mockCustomers,
    source: customers ? ("supabase" as const) : bookingsSource
  };
}

export async function getDashboardData() {
  noStore();
  const { bookings, source } = await getBookingsData();
  const payload = source === "supabase"
    ? createDashboardPayload(bookings)
    : {
        dashboardStats: mockDashboardStats,
        notifications: mockNotifications,
        paymentSnapshot: mockPaymentSnapshot,
        today: getEgyptTodayIso(),
        todayTasks: mockTodayTasks
      };

  return {
    ...payload,
    source
  };
}

export async function getCalendarData() {
  noStore();
  const { bookings, source } = await getBookingsData();

  return {
    bookings,
    source,
    today: getEgyptTodayIso()
  };
}

export async function getBookingDetailData(id: string) {
  noStore();
  const { bookings, source } = await getBookingsData();
  const booking = bookings.find((item) => item.id === id) ?? getMockBookingById(id);

  if (!booking) {
    return {
      booking: null,
      customer: null,
      dress: null,
      source
    };
  }

  const { customers } = await getCustomersData();
  const { dresses } = await getDressesData();
  const customer = customers.find((item) => item.id === booking.customerId) ?? null;
  const dress = dresses.find((item) => item.id === booking.dressId) ?? null;

  return {
    booking,
    customer,
    dress,
    source
  };
}

export async function getBookingFormData() {
  noStore();
  const [{ bookings, source }, { customers }, { dresses }] = await Promise.all([
    getBookingsData(),
    getCustomersData(),
    getDressesData()
  ]);

  return {
    bookings,
    customers,
    dresses,
    source,
    today: getEgyptTodayIso()
  };
}

export async function getDressEditorData() {
  noStore();
  const { dresses, source } = await getDressesData();

  return {
    dress: dresses[0] ?? mockDresses[0],
    source
  };
}

export async function getDressByIdData(id: string) {
  noStore();
  const { dresses, source } = await getDressesData();
  const dress = dresses.find((item) => item.id === id) ?? null;

  return {
    dress,
    source
  };
}

export async function getCustomerByIdData(id: string) {
  noStore();
  const { customers, source } = await getCustomersData();
  const customer = customers.find((item) => item.id === id) ?? null;

  return {
    customer,
    source
  };
}

export { formatCurrency, formatDateLabel };
