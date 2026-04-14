import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/env";
import { getPublicCatalogDataBySlug, getPublicWhatsAppLink } from "@/lib/public-data";

type PublicBookingPayload = {
  customerName?: string;
  phone?: string;
  dressId?: string;
  bookingDate?: string;
  slug?: string;
};

function isPhoneValid(phone: string) {
  return /^01\d{9}$/.test(phone);
}

export async function POST(request: Request) {
  if (!hasSupabaseServiceRoleEnv()) {
    return NextResponse.json(
      { message: "الحجز العام محتاج Service Role في إعدادات Supabase." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as PublicBookingPayload;
  const customerName = body.customerName?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const dressId = body.dressId?.trim() ?? "";
  const bookingDate = body.bookingDate?.trim() ?? "";
  const slug = body.slug?.trim() ?? "";

  if (!customerName || !phone || !dressId || !bookingDate || !slug) {
    return NextResponse.json(
      { message: "كملي الاسم والموبايل والفستان واليوم المطلوب." },
      { status: 400 }
    );
  }

  if (!isPhoneValid(phone)) {
    return NextResponse.json(
      { message: "رقم الموبايل لازم يبدأ بـ 01 ويكون 11 رقم." },
      { status: 400 }
    );
  }

  const catalog = await getPublicCatalogDataBySlug(slug);
  const dress = catalog?.dresses.find((item) => item.id === dressId);

  if (!catalog?.atelierId || !dress) {
    return NextResponse.json({ message: "الفستان المختار مش موجود." }, { status: 404 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: conflictingBooking } = await supabase
    .from("bookings")
    .select("id")
    .eq("atelier_id", catalog.atelierId)
    .eq("dress_id", dressId)
    .neq("status", "تم الاسترجاع")
    .lte("pickup_date", bookingDate)
    .gte("return_date", bookingDate)
    .limit(1)
    .maybeSingle();

  if (conflictingBooking) {
    return NextResponse.json(
      { message: "الفستان ده محجوز في اليوم ده. اختاري يوم تاني أو فستان تاني." },
      { status: 409 }
    );
  }

  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("atelier_id", catalog.atelierId)
    .eq("phone", phone)
    .maybeSingle();

  let customerId = existingCustomer?.id;

  if (!customerId) {
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        atelier_id: catalog.atelierId,
        name: customerName,
        phone
      })
      .select("id")
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ message: "تعذر حفظ بيانات العميلة." }, { status: 500 });
    }

    customerId = customer.id;
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      atelier_id: catalog.atelierId,
      customer_id: customerId,
      dress_id: dress.id,
      pickup_date: bookingDate,
      return_date: bookingDate,
      time_label: "طلب من الكتالوج",
      status: "محجوز",
      deposit: 0,
      total: dress.price,
      payment_status: "غير مدفوع",
      note: `حجز من الكتالوج العام باسم ${customerName}`,
      fitting_stage: "حجز من العميلة"
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ message: "تعذر تأكيد الحجز حالياً." }, { status: 500 });
  }

  await supabase
    .from("dresses")
    .update({ status: "محجوز" })
    .eq("id", dress.id)
    .eq("atelier_id", catalog.atelierId);

  const whatsappLink = getPublicWhatsAppLink(
    catalog.atelierPhone,
    `عايزة أحجز الفستان رقم ${dress.code} يوم ${bookingDate}`
  );

  revalidatePath(`/s/${slug}`);
  revalidatePath(`/s/${slug}/booking`);
  revalidatePath(`/s/${slug}/dress/${dress.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/bookings");

  return NextResponse.json({
    id: booking.id,
    message: "تم الحجز بنجاح",
    whatsappLink
  });
}
