import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DataSourceBanner } from "@/components/data-source-banner";
import { DressGalleryViewer } from "@/components/dress-gallery-viewer";
import { getDressesData, formatCurrency } from "@/lib/data";
import { PageHero, SectionHeader, StatusPill } from "@/components/ui";

export default async function DressesPage() {
  const { dresses, source } = await getDressesData();

  return (
    <AppShell currentPath="/dresses">
      <DataSourceBanner source={source} />
      <PageHero
        badge="عرض سريع للموبايل"
        title="مجموعة الفساتين"
        description="كل فستان بكارت واضح: الصورة الرئيسية، زوايا إضافية صغيرة، الحالة، المقاس، والسعر."
        primaryHref="/dresses/new"
        primaryLabel="إضافة فستان"
        secondaryHref="/bookings/new"
        secondaryLabel="حجز من الفساتين"
      />

      <section className="section">
        <SectionHeader title="القطع المتاحة" copy="شبكة بسيطة وواضحة ومناسبة للموبايل." />

        <div className="dress-grid">
          {dresses.map((dress) => (
            <article key={dress.id} className="dress-card">
              <div className="dress-visual">
                <DressGalleryViewer
                  tone={dress.imageTone}
                  code={dress.code}
                  imageUrl={dress.imageUrl}
                  gallery={dress.gallery}
                  alt={`صورة ${dress.name}`}
                />
                <div className="corner-badge">
                  <StatusPill tone={dress.status === "متاح" ? "success" : "warning"}>
                    {dress.status}
                  </StatusPill>
                </div>
              </div>

              <div className="card-head">
                <div>
                  <h2 className="dress-name">{dress.name}</h2>
                  <div className="dress-code">
                    {dress.category} - {dress.color}
                  </div>
                </div>
              </div>

              <div className="meta-grid">
                <div className="meta-pill">
                  <span>المقاس</span>
                  <strong>{dress.size}</strong>
                </div>
                <div className="meta-pill">
                  <span>السعر</span>
                  <strong>{formatCurrency(dress.price)}</strong>
                </div>
              </div>

              <p className="helper-text" style={{ margin: "16px 0 0" }}>
                {dress.notes}
              </p>

              <div className="inline-actions" style={{ marginTop: 18 }}>
                <Link href={`/dresses/${dress.id}/edit`} className="pill-button primary">
                  تعديل البيانات
                </Link>
                <Link href="/bookings/new" className="ghost-button">
                  إنشاء حجز
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
