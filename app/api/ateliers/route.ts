import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ACTIVE_ATELIER_COOKIE } from "@/lib/tenant";
import {
  hasSupabasePublicEnv,
  hasSupabaseServiceRoleEnv
} from "@/lib/supabase/env";
import { createAtelierSlug, slugifySegment } from "@/lib/slug";

type AtelierPayload = {
  name?: string;
  branchName?: string;
  publicSlug?: string;
  claimExistingData?: boolean;
};

async function ensureUniqueSlug(baseSlug: string) {
  const admin = createSupabaseAdminClient();
  let nextSlug = baseSlug || createAtelierSlug("store");
  let counter = 1;

  while (true) {
    const { data } = await admin
      .from("ateliers")
      .select("id")
      .eq("public_slug", nextSlug)
      .maybeSingle();

    if (!data) {
      return nextSlug;
    }

    counter += 1;
    nextSlug = `${baseSlug}-${counter}`;
  }
}

export async function POST(request: Request) {
  if (!hasSupabasePublicEnv() || !hasSupabaseServiceRoleEnv()) {
    return NextResponse.json(
      { message: "إعدادات Supabase ناقصة للـ multi-tenant setup." },
      { status: 503 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "لازم تسجلي دخول الأول." }, { status: 401 });
  }

  const body = (await request.json()) as AtelierPayload;
  const name = body.name?.trim() ?? "";
  const branchName = body.branchName?.trim() ?? "";
  const claimExistingData = Boolean(body.claimExistingData);
  const requestedSlug = slugifySegment(body.publicSlug?.trim() ?? "");

  if (!name) {
    return NextResponse.json(
      { message: "اكتبي اسم الأتيليه أو الفرع الأول." },
      { status: 400 }
    );
  }

  const publicSlug = await ensureUniqueSlug(requestedSlug || createAtelierSlug(name, branchName));

  const { data: atelier, error: atelierError } = await admin
    .from("ateliers")
    .insert({
      name,
      branch_name: branchName || null,
      public_slug: publicSlug
    })
    .select("*")
    .single();

  if (atelierError || !atelier) {
    return NextResponse.json({ message: "تعذر إنشاء الأتيليه." }, { status: 500 });
  }

  const { error: membershipError } = await admin.from("atelier_memberships").insert({
    user_id: user.id,
    atelier_id: atelier.id,
    role: "owner"
  });

  if (membershipError) {
    await admin.from("ateliers").delete().eq("id", atelier.id);
    return NextResponse.json({ message: "تعذر ربط الحساب بالفرع." }, { status: 500 });
  }

  if (claimExistingData) {
    await admin.from("customers").update({ atelier_id: atelier.id }).is("atelier_id", null);
    await admin.from("dresses").update({ atelier_id: atelier.id }).is("atelier_id", null);
    await admin.from("bookings").update({ atelier_id: atelier.id }).is("atelier_id", null);
  }

  const response = NextResponse.json({
    id: atelier.id,
    publicSlug,
    storefrontPath: `/s/${publicSlug}`,
    message: "تم إنشاء الفرع بنجاح."
  });

  response.cookies.set(ACTIVE_ATELIER_COOKIE, atelier.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/bookings");
  revalidatePath("/customers");
  revalidatePath("/dresses");
  revalidatePath("/calendar");
  revalidatePath("/onboarding");
  revalidatePath(`/s/${publicSlug}`);

  return response;
}
