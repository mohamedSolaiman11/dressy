import { AppShell } from "@/components/app-shell";
import { DataSourceBanner } from "@/components/data-source-banner";
import { DressForm } from "@/components/dress-form";
import { getDataSourceStatus } from "@/lib/data";
import { PageHero } from "@/components/ui";

export default async function DressEditorPage() {
  const source = await getDataSourceStatus();

  return (
    <AppShell currentPath="/dresses">
      <DataSourceBanner source={source} />
      <PageHero
        badge="إضافة أو تعديل"
        title="فستان جديد أو تعديل سريع"
        description="الفورم هنا معمول علشان صاحبة الأتيليه تخلص شغلها بسرعة: صورة، مقاس، سعر، وحالة القطعة."
        primaryHref="/dresses"
        primaryLabel="رجوع للفساتين"
        secondaryHref="/bookings/new"
        secondaryLabel="فتح حجز جديد"
      />
      <DressForm mode="create" dataSource={source} />
    </AppShell>
  );
}
