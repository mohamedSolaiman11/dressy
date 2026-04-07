import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ACTIVE_ATELIER_COOKIE } from "@/lib/tenant";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

export async function POST(request: Request) {
  if (!hasSupabasePublicEnv()) {
    return NextResponse.json({ message: "Supabase مش متفعل." }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "لازم تسجلي دخول الأول." }, { status: 401 });
  }

  const body = (await request.json()) as { atelierId?: string };
  const atelierId = body.atelierId?.trim() ?? "";

  if (!atelierId) {
    return NextResponse.json({ message: "اختاري فرع صالح." }, { status: 400 });
  }

  const { data: membership, error } = await supabase
    .from("atelier_memberships")
    .select("id")
    .eq("user_id", user.id)
    .eq("atelier_id", atelierId)
    .maybeSingle();

  if (error || !membership) {
    return NextResponse.json({ message: "الفرع ده مش تابع لحسابك." }, { status: 403 });
  }

  const response = NextResponse.json({ message: "تم تبديل الفرع." });

  response.cookies.set(ACTIVE_ATELIER_COOKIE, atelierId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  return response;
}
