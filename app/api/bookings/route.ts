import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { getTenantApiContext } from "@/lib/tenant";

type CreateBookingPayload = {
  customerName?: string;
  phone?: string;
  dressId?: string;
  pickupDate?: string;
  returnDate?: string;
  deposit?: number;
  note?: string;
};

function isPhoneValid(phone: string) {
  return /^01\d{9}$/.test(phone);
}

export async function POST(request: Request) {
  const { supabase, user, activeAtelier } = await getTenantApiContext();

  if (!supabase) {
    return NextResponse.json(
      {
        message: "إعدادات Supabase ناقصة. ضيفي المفاتيح في .env.local الأول."
      },
      { status: 503 }
    );
  }

  if (!hasSupabasePublicEnv()) {
    return NextResponse.json({ message: "Supabase مش متفعل." }, { status: 503 });
  }

  if (!user) {
    return NextResponse.json({ message: "لازم تسجلي دخول الأول." }, { status: 401 });
  }

  if (!activeAtelier) {
    return NextResponse.json(
      { message: "اعملي أو اختاري فرع أول عشان الحجز يتحفظ." },
      { status: 409 }
    );
  }

  const body = (await request.json()) as CreateBookingPayload;
  const customerName = body.customerName?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const dressId = body.dressId?.trim() ?? "";
  const pickupDate = body.pickupDate?.trim() ?? "";
  const returnDate = body.returnDate?.trim() ?? "";
  const deposit = Number(body.deposit ?? 0);
  const note = body.note?.trim() ?? "";

  if (!customerName || !phone || !dressId || !pickupDate || !returnDate) {
    return NextResponse.json(
      { message: "من فضلك كملي اسم العميلة والموبايل والفستان والتواريخ." },
      { status: 400 }
    );
  }

  if (!isPhoneValid(phone)) {
    return NextResponse.json(
      { message: "رقم الموبايل لازم يبدأ بـ 01 ويكون 11 رقم." },
      { status: 400 }
    );
  }

  if (returnDate < pickupDate) {
    return NextResponse.json(
      { message: "تاريخ الرد لازم يكون بعد أو نفس تاريخ الاستلام." },
      { status: 400 }
    );
  }

  const { data: dress, error: dressError } = await supabase
    .from("dresses")
    .select("*")
    .eq("id", dressId)
    .eq("atelier_id", activeAtelier.id)
    .single();

  if (dressError || !dress) {
    return NextResponse.json(
      { message: "الفستان المختار مش موجود في الفرع الحالي." },
      { status: 404 }
    );
  }

  const { data: conflictingBooking, error: conflictError } = await supabase
    .from("bookings")
    .select(
      `
        id,
        customer:customers!bookings_customer_id_fkey (name)
      `
    )
    .eq("atelier_id", activeAtelier.id)
    .eq("dress_id", dressId)
    .neq("status", "تم الاسترجاع")
    .lte("pickup_date", returnDate)
    .gte("return_date", pickupDate)
    .limit(1)
    .maybeSingle();

  if (conflictError) {
    return NextResponse.json(
      { message: "حصلت مشكلة أثناء مراجعة تعارض الحجز." },
      { status: 500 }
    );
  }

  if (conflictingBooking) {
    return NextResponse.json(
      {
        message: `الفستان محجوز بالفعل في نفس المدة باسم ${(conflictingBooking as { customer?: { name?: string } }).customer?.name ?? "عميلة"}.`
      },
      { status: 409 }
    );
  }

  const { data: existingCustomer, error: existingCustomerError } = await supabase
    .from("customers")
    .select("*")
    .eq("atelier_id", activeAtelier.id)
    .eq("phone", phone)
    .maybeSingle();

  if (existingCustomerError) {
    return NextResponse.json(
      { message: "تعذر حفظ بيانات العميلة." },
      { status: 500 }
    );
  }

  let customer = existingCustomer;

  if (customer && customer.name !== customerName) {
    const { data: updatedCustomer, error: updateCustomerError } = await supabase
      .from("customers")
      .update({ name: customerName })
      .eq("id", customer.id)
      .eq("atelier_id", activeAtelier.id)
      .select("*")
      .single();

    if (updateCustomerError || !updatedCustomer) {
      return NextResponse.json(
        { message: "تعذر تحديث بيانات العميلة." },
        { status: 500 }
      );
    }

    customer = updatedCustomer;
  }

  if (!customer) {
    const { data: insertedCustomer, error: insertCustomerError } = await supabase
      .from("customers")
      .insert({
        atelier_id: activeAtelier.id,
        name: customerName,
        phone
      })
      .select("*")
      .single();

    if (insertCustomerError || !insertedCustomer) {
      return NextResponse.json(
        { message: "تعذر حفظ بيانات العميلة." },
        { status: 500 }
      );
    }

    customer = insertedCustomer;
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      atelier_id: activeAtelier.id,
      customer_id: customer.id,
      dress_id: dress.id,
      pickup_date: pickupDate,
      return_date: returnDate,
      time_label: "12:00 م",
      status: "محجوز",
      deposit,
      total: dress.price,
      payment_status: deposit >= dress.price ? "مدفوع" : "غير مدفوع",
      note,
      fitting_stage: "حجز جديد"
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    const message =
      bookingError?.code === "23P01"
        ? "الفستان اتحجز في نفس المدة من حجز تاني. حدّثي الشاشة وجربي تاني."
        : "تعذر حفظ الحجز في قاعدة البيانات.";

    return NextResponse.json({ message }, { status: 500 });
  }

  await supabase
    .from("dresses")
    .update({ status: "محجوز" })
    .eq("id", dress.id)
    .eq("atelier_id", activeAtelier.id);

  revalidatePath("/");
  revalidatePath("/bookings");
  revalidatePath("/bookings/new");
  revalidatePath("/calendar");
  revalidatePath("/customers");
  revalidatePath("/dresses");
  revalidatePath(`/bookings/${booking.id}`);

  return NextResponse.json({
    id: booking.id,
    message: "تم حفظ الحجز."
  });
}
