import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { getTenantApiContext } from "@/lib/tenant";

type CustomerPayload = {
  name?: string;
  phone?: string;
  area?: string;
  preferredSize?: string;
};

function isPhoneValid(phone: string) {
  return /^01\d{9}$/.test(phone);
}

function validateCustomerPayload(body: CustomerPayload) {
  const name = body.name?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const area = body.area?.trim() ?? "";
  const preferred_size = body.preferredSize?.trim() ?? "";

  if (!name || !phone) {
    return { error: "من فضلك كملي اسم العميلة ورقم الموبايل." };
  }

  if (!isPhoneValid(phone)) {
    return { error: "رقم الموبايل لازم يبدأ بـ 01 ويكون 11 رقم." };
  }

  return {
    value: {
      name,
      phone,
      area,
      preferred_size
    }
  };
}

export async function POST(request: Request) {
  const { supabase, user, activeAtelier } = await getTenantApiContext();

  if (!supabase || !hasSupabasePublicEnv()) {
    return NextResponse.json({ message: "إعدادات Supabase ناقصة." }, { status: 503 });
  }

  if (!user) {
    return NextResponse.json({ message: "لازم تسجلي دخول الأول." }, { status: 401 });
  }

  if (!activeAtelier) {
    return NextResponse.json(
      { message: "اختاري أو أضيفي فرع أول عشان تحفظي العملاء." },
      { status: 409 }
    );
  }

  const body = (await request.json()) as CustomerPayload;
  const parsed = validateCustomerPayload(body);

  if ("error" in parsed) {
    return NextResponse.json({ message: parsed.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      atelier_id: activeAtelier.id,
      ...parsed.value
    })
    .select("id")
    .single();

  if (error || !data) {
    const message =
      error?.code === "23505" ? "رقم الموبايل متسجل قبل كده." : "تعذر حفظ بيانات العميلة.";

    return NextResponse.json({ message }, { status: 500 });
  }

  revalidatePath("/customers");
  revalidatePath("/customers/new");

  return NextResponse.json({
    id: data.id,
    message: "تم حفظ العميلة."
  });
}
