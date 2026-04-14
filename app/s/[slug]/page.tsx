import Link from "next/link";
import { notFound } from "next/navigation";
import { DataSourceBanner } from "@/components/data-source-banner";
import { MessageIcon } from "@/components/icons";
import { PublicCatalog } from "@/components/public-catalog";
import { PublicShell } from "@/components/public-shell";
import { getPublicCatalogDataBySlug } from "@/lib/public-data";
import { PageHero, SectionHeader } from "@/components/ui";

function normalizePhone(phone: string) {
  return phone.startsWith("0") ? `2${phone}` : phone;
}

export default async function StorefrontPage({
  params
}: {
  params: { slug: string };
}) {
  const catalog = await getPublicCatalogDataBySlug(params.slug);

  if (!catalog || !catalog.dresses.length) {
    notFound();
  }

  const { atelierName, atelierPhone, dresses, source, slug } = catalog;

  return (
    <PublicShell atelierName={atelierName} slug={slug}>
      <DataSourceBanner source={source} />
      <PageHero
        badge="فستانك أقرب مما تتخيلي"
        title="اتفرجي على الشغل واختاري الفستان اللي يناسبك"
        description="صور واضحة، سعر ظاهر، وحالة كل فستان قدامك من غير لف. ولو عجبك موديل، احجزيه فورًا في أقل خطوات."
        primaryHref={`/s/${slug}/booking`}
        primaryLabel="احجز الآن"
        secondaryHref={`https://wa.me/${normalizePhone(atelierPhone)}`}
        secondaryLabel="واتساب الأتيليه"
      />

      <section className="section">
        <SectionHeader
          title="الكتالوج"
          copy="اختيار سريع مناسب للموبايل، وكل فستان عليه حالته وسعره."
        />
        <PublicCatalog dresses={dresses} slug={slug} />
      </section>

      <section className="section">
        <div className="panel public-help-panel">
          <div>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              الحجز محتاج أقل كلام
            </h2>
            <p className="section-copy">
              اختاري الفستان، اليوم المناسب، وسيبي اسمك ورقمك. بعد الحجز هيظهر لك زر واتساب جاهز برسالة مكتوبة.
            </p>
          </div>
          <div className="inline-actions">
            <Link href={`/s/${slug}/booking`} className="pill-button primary">
              احجز الآن
            </Link>
            <a
              href={`https://wa.me/${normalizePhone(atelierPhone)}`}
              className="ghost-button"
              target="_blank"
              rel="noreferrer"
            >
              <MessageIcon />
              اسألي على واتساب
            </a>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
