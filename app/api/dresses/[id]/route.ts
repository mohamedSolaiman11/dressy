import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import {
  normalizeDressImageInputs,
  type DressImageInput
} from "@/lib/dress-gallery";
import { syncDressImages } from "@/lib/dress-images-server";
import { getTenantApiContext } from "@/lib/tenant";

type DressPayload = {
  code?: string;
  name?: string;
  category?: string;
  size?: string;
  color?: string;
  price?: number;
  status?: "متاح" | "محجوز";
  imageTone?: string;
  imagePath?: string;
  imagePaths?: string[];
  imageItems?: Array<{ path?: string; shotType?: string | null }>;
  notes?: string;
};

const allowedTones = new Set(["rose", "champagne", "velvet", "blush", "pearl"]);

function validateDressPayload(body: DressPayload) {
  const code = body.code?.trim().toUpperCase() ?? "";
  const name = body.name?.trim() ?? "";
  const category = body.category?.trim() ?? "";
  const size = body.size?.trim() ?? "";
  const color = body.color?.trim() ?? "";
  const price = Number(body.price ?? 0);
  const status = body.status ?? "متاح";
  const imageTone = body.imageTone?.trim() ?? "rose";
  const imageItems: DressImageInput[] = normalizeDressImageInputs(
    body.imageItems,
    body.imagePaths,
    body.imagePath ?? ""
  );
  const notes = body.notes?.trim() ?? "";

  if (!code || !name || !category || !size || !color) {
    return { error: "من فضلك كملي اسم الفستان والكود والنوع والمقاس واللون." };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { error: "السعر لازم يكون رقم صحيح أكبر من أو يساوي صفر." };
  }

  if (!allowedTones.has(imageTone)) {
    return { error: "لون المعاينة غير صالح." };
  }

  return {
    value: {
      code,
      name,
      category,
      size,
      color,
      price,
      status,
      image_tone: imageTone,
      image_path: imageItems[0]?.path ?? "",
      notes
    },
    imageItems
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
      { message: "اختاري فرع أول عشان تعدلي الفستان." },
      { status: 409 }
    );
  }

  const { id } = await params;
  const body = (await request.json()) as DressPayload;
  const parsed = validateDressPayload(body);

  if ("error" in parsed) {
    return NextResponse.json({ message: parsed.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("dresses")
    .update(parsed.value)
    .eq("id", id)
    .eq("atelier_id", activeAtelier.id)
    .select("id")
    .maybeSingle();

  if (error) {
    const message =
      error.code === "23505" ? "كود الفستان موجود قبل كده." : "تعذر تعديل بيانات الفستان.";

    return NextResponse.json({ message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ message: "الفستان ده مش موجود في الفرع الحالي." }, { status: 404 });
  }

  try {
    await syncDressImages(supabase, id, activeAtelier.id, parsed.imageItems);
  } catch {
    return NextResponse.json(
      { message: "اتحدث الفستان لكن حصلت مشكلة في حفظ الصور." },
      { status: 500 }
    );
  }

  revalidatePath("/dresses");
  revalidatePath(`/dresses/${id}/edit`);

  return NextResponse.json({
    message: "تم تحديث الفستان."
  });
}
