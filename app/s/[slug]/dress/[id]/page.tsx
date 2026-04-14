import Link from "next/link";
import { notFound } from "next/navigation";
import { DataSourceBanner } from "@/components/data-source-banner";
import { DressGalleryViewer } from "@/components/dress-gallery-viewer";
import { MessageIcon } from "@/components/icons";
import { PublicShell } from "@/components/public-shell";
import { formatCurrency } from "@/lib/data";
import {
  getPublicDressById,
  getPublicWhatsAppLink
} from "@/lib/public-data";
import { getDressAvailabilityLabel, getDressAvailabilityTone } from "@/lib/public-catalog-shared";
import { DetailItem, PageHero, SectionHeader, StatusPill } from "@/components/ui";
import { formatDateLabel } from "@/lib/mock-data";

export default async function PublicDressPage({
  params
}: {
  params: { slug: string; id: string };
}) {
  const data = await getPublicDressById(params.slug, params.id);

  if (!data?.dress) {
    notFound();
  }

  const { atelierName, atelierPhone, dress, source, slug } = data;
  const whatsappLink = getPublicWhatsAppLink(
    atelierPhone,
    `عايزة أحجز الفستان رقم ${dress.code}`
  );

  return (
    <PublicShell atelierName={atelierName} slug={slug}>
      <DataSourceBanner source={source} />
      <PageHero
        badge={dress.category}
        title={dress.name}
        description={dress.notes || "تفاصيل الفستان كاملة قدامك علشان تقدري تاخدي قرار بسرعة."}
        primaryHref={`/s/${slug}/booking?dressId=${dress.id}`}
        primaryLabel="احجز الآن"
        secondaryHref={whatsappLink}
        secondaryLabel="اسألي على واتساب"
      />

      <section className="detail-card public-detail-layout">
        <div className="form-grid">
          <div className="selection-card active">
            <DressGalleryViewer
              tone={dress.imageTone}
              code={dress.code}
              imageUrl={dress.imageUrl}
              gallery={dress.gallery}
              alt={`صورة ${dress.name}`}
            />
          </div>

          <div className="field-block">
            <div className="section-header">
              <div>
                <h1 className="section-title">{dress.name}</h1>
                <p className="section-copy">
                  {dress.category} - {dress.color}
                </p>
              </div>
              <StatusPill tone={getDressAvailabilityTone(dress)}>
                {getDressAvailabilityLabel(dress)}
              </StatusPill>
            </div>

            <div className="detail-list">
              <DetailItem label="السعر" value={formatCurrency(dress.price)} />
              <DetailItem label="المقاس" value={dress.size} />
              <DetailItem label="الكود" value={dress.code} />
              <DetailItem label="الحالة" value={dress.status} />
            </div>

            {dress.nextBookedDate ? (
              <div className="alert-box info" style={{ marginTop: 16 }}>
                أقرب موعد عليه حجز: {dress.nextBookedDate}
              </div>
            ) : (
              <div className="alert-box success" style={{ marginTop: 16 }}>
                الفستان متاح للحجز دلوقتي.
              </div>
            )}

            <div className="inline-actions" style={{ marginTop: 18 }}>
              <Link href={`/s/${slug}/booking?dressId=${dress.id}`} className="pill-button primary">
                احجز الآن
              </Link>
              <a href={whatsappLink} className="ghost-button" target="_blank" rel="noreferrer">
                <MessageIcon />
                واتساب
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeader
          title="المواعيد المشغولة قريب"
          copy="علشان الصورة تبقى أوضح قبل ما تحجزي."
        />

        {dress.upcomingBookings.length ? (
          <div className="task-list">
            {dress.upcomingBookings.map((booking) => (
              <div key={booking.id} className="notification-banner">
                <div>
                  <strong>
                    من {formatDateLabel(booking.pickupDate)} إلى {formatDateLabel(booking.returnDate)}
                  </strong>
                  <span className="helper-text">الفستان بيكون محجوز في الفترة دي.</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert-box success">مفيش مواعيد مشغولة قريبة على الفستان ده.</div>
        )}
      </section>
    </PublicShell>
  );
}
