import Link from "next/link";
import { PageHero } from "@/components/ui";

export default function HomePage() {
  return (
    <main className="page-shell public-shell">
      <PageHero
        badge="روابط عامة مستقلة"
        title="كل فرع ليه رابط عرض خاص بيه"
        description="افتحي رابط من نوع /s/public-slug علشان تعرضي كتالوج الفرع للعملاء. ولو إنتِ صاحبة الأتيليه، ادخلي على لوحة الإدارة من هنا."
        primaryHref="/login"
        primaryLabel="دخول الإدارة"
        secondaryHref="/dashboard"
        secondaryLabel="لوحة التحكم"
      />

      <section className="section">
        <div className="panel public-help-panel">
          <div>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              مثال للرابط العام
            </h2>
            <p className="section-copy">
              مثال: <span dir="ltr">/s/rose-nasr-city</span>
            </p>
          </div>
          <Link href="/login" className="pill-button primary">
            إدارة الأتيليه
          </Link>
        </div>
      </section>
    </main>
  );
}
