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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user, activeAtelier } = await getTenantApiContext();

  if (!supabase || !hasSupabasePublicEnv()) {
    return NextResponse.json({ message: "إعدادات Supabase ناقصة." }, { status: 503 });
  }

  if (!user) {
    return NextResponse.json({ message: "لازم تسجلي دخول الأول." }, { status: 401 });
  }

  if (!activeAtelier) {
    return NextResponse.json(
      { message: "اختاري فرع أول عشان تعدلي بيانات العميلة." },
      { status: 409 }
    );
  }

  const { id } = await params;
  const body = (await request.json()) as CustomerPayload;
  const parsed = validateCustomerPayload(body);

  if ("error" in parsed) {
    return NextResponse.json({ message: parsed.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("customers")
    .update(parsed.value)
    .eq("id", id)
    .eq("atelier_id", activeAtelier.id)
    .select("id")
    .maybeSingle();

  if (error) {
    const message =
      error.code === "23505" ? "رقم الموبايل متسجل قبل كده." : "تعذر تعديل بيانات العميلة.";

    return NextResponse.json({ message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ message: "العميلة دي مش موجودة في الفرع الحالي." }, { status: 404 });
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}/edit`);

  return NextResponse.json({
    message: "تم تحديث العميلة."
  });
}
