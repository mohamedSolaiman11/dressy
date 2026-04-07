import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  hasSupabasePublicEnv,
  hasSupabaseServiceRoleEnv
} from "@/lib/supabase/env";
import { getTenantApiContext } from "@/lib/tenant";
import {
  ALLOWED_DRESS_IMAGE_MIME_TYPES,
  DRESS_IMAGES_BUCKET,
  MAX_DRESS_IMAGE_SIZE_BYTES,
  getDressImageUrl
} from "@/lib/storage";

function getExtension(file: File) {
  const extensionFromName = file.name.split(".").pop()?.toLowerCase();

  if (extensionFromName && /^[a-z0-9]+$/.test(extensionFromName)) {
    return extensionFromName;
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

async function ensureBucket() {
  const admin = createSupabaseAdminClient();
  const { data: existingBucket } = await admin.storage.getBucket(DRESS_IMAGES_BUCKET);

  if (!existingBucket) {
    const { error } = await admin.storage.createBucket(DRESS_IMAGES_BUCKET, {
      public: true,
      allowedMimeTypes: ALLOWED_DRESS_IMAGE_MIME_TYPES,
      fileSizeLimit: MAX_DRESS_IMAGE_SIZE_BYTES
    });

    if (error && !/already exists/i.test(error.message)) {
      throw error;
    }
  }

  return admin;
}

export async function POST(request: Request) {
  if (!hasSupabasePublicEnv() || !hasSupabaseServiceRoleEnv()) {
    return NextResponse.json(
      { message: "إعدادات Supabase ناقصة لرفع الصور." },
      { status: 503 }
    );
  }

  const { user, activeAtelier } = await getTenantApiContext();

  if (!user) {
    return NextResponse.json({ message: "لازم تسجلي دخول الأول." }, { status: 401 });
  }

  if (!activeAtelier) {
    return NextResponse.json(
      { message: "اختاري أو أضيفي فرع أول عشان ترفعي الصور." },
      { status: 409 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "اختاري صورة أول." }, { status: 400 });
  }

  if (!ALLOWED_DRESS_IMAGE_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { message: "نوع الصورة لازم يكون JPG أو PNG أو WEBP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_DRESS_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { message: "حجم الصورة كبير. ارفعي صورة لحد 8 ميجا." },
      { status: 400 }
    );
  }

  try {
    const admin = await ensureBucket();
    const extension = getExtension(file);
    const filePath = `${activeAtelier.id}/${Date.now()}-${randomUUID()}.${extension}`;

    const { error: uploadError } = await admin.storage
      .from(DRESS_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json(
        { message: "تعذر رفع الصورة إلى Supabase Storage." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imagePath: filePath,
      imageUrl: getDressImageUrl(filePath),
      message: "تم رفع الصورة."
    });
  } catch {
    return NextResponse.json(
      { message: "حصلت مشكلة أثناء تجهيز رفع الصورة." },
      { status: 500 }
    );
  }
}
