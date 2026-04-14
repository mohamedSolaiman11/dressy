import Link from "next/link";
import { notFound } from "next/navigation";
import { DataSourceBanner } from "@/components/data-source-banner";
import { CheckCircleIcon, MessageIcon } from "@/components/icons";
import { PublicBookingForm } from "@/components/public-booking-form";
import { PublicShell } from "@/components/public-shell";
import { getPublicBookingFormDataBySlug } from "@/lib/public-data";
import { DetailItem, PageHero } from "@/components/ui";

export default async function BookingPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const dressId =
    typeof searchParams?.dressId === "string" ? searchParams.dressId : undefined;
  const isSuccess = searchParams?.success === "1";
  const bookingId = typeof searchParams?.id === "string" ? searchParams.id : "";
  const bookingDress = typeof searchParams?.dress === "string" ? searchParams.dress : "";
  const bookingDate = typeof searchParams?.date === "string" ? searchParams.date : "";
  const customerName = typeof searchParams?.name === "string" ? searchParams.name : "";
  const customerPhone = typeof searchParams?.phone === "string" ? searchParams.phone : "";
  const whatsappLink =
    typeof searchParams?.whatsapp === "string" ? searchParams.whatsapp : "";

  const data = await getPublicBookingFormDataBySlug(params.slug, dressId);

  if (!data) {
    notFound();
  }

  const { atelierName, atelierPhone, dresses, selectedDress, source, slug } = data;

  return (
    <PublicShell atelierName={atelierName} slug={slug}>
      <DataSourceBanner source={source} />
      <PageHero
        badge="حجز سريع"
        title="احجزي من غير خطوات كتير"
        description="اختاري الفستان، اليوم، وبيانات التواصل. بعد التأكيد هتلاقي رسالة واتساب جاهزة."
        primaryHref={`/s/${slug}`}
        primaryLabel="رجوع للكتالوج"
      />

      {isSuccess ? (
        <section className="section">
          <div className="form-card success-card">
            <div className="soft-icon">
              <CheckCircleIcon />
            </div>
            <h2 className="section-title">تم الحجز بنجاح</h2>
            <p className="section-copy">
              حجزك اتسجل، ولو حابة تتأكدي بسرعة ابعتي للأتيليه على واتساب.
            </p>

            <div className="detail-list" style={{ marginTop: 18 }}>
              <DetailItem label="رقم الحجز" value={bookingId} />
              <DetailItem label="الفستان" value={bookingDress} />
              <DetailItem label="اليوم" value={bookingDate} />
              <DetailItem label="الموبايل" value={customerPhone} />
            </div>

            <div className="inline-actions" style={{ marginTop: 20 }}>
              <a
                href={whatsappLink || `https://wa.me/${atelierPhone}`}
                className="pill-button primary"
                target="_blank"
                rel="noreferrer"
              >
                <MessageIcon />
                تواصلي على واتساب
              </a>
              <Link href={`/s/${slug}`} className="ghost-button">
                رجوع للكتالوج
              </Link>
            </div>

            <div className="alert-box info" style={{ marginTop: 16 }}>
              باسم {customerName} - هنراجع معاكي التفاصيل ونأكد المعاد.
            </div>
          </div>
        </section>
      ) : (
        <section className="section">
          <PublicBookingForm
            dresses={dresses}
            selectedDressId={selectedDress?.id}
            atelierPhone={atelierPhone}
            slug={slug}
          />
        </section>
      )}
    </PublicShell>
  );
}
