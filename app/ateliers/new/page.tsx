import { AppShell } from "@/components/app-shell";
import { AtelierForm } from "@/components/atelier-form";
import { DataSourceBanner } from "@/components/data-source-banner";
import { getDataSourceStatus } from "@/lib/data";
import { PageHero } from "@/components/ui";

export default async function NewAtelierPage() {
  const source = await getDataSourceStatus();

  return (
    <AppShell currentPath="/dashboard">
      <DataSourceBanner source={source} />
      <PageHero
        badge="أكتر من فرع"
        title="إضافة فرع جديد"
        description="من نفس الحساب تقدري تضيفي فرع جديد وتبدّلي بينهم بسهولة من أعلى التطبيق."
        primaryHref="/dashboard"
        primaryLabel="رجوع للرئيسية"
        secondaryHref="/customers"
        secondaryLabel="فتح العملاء"
      />
      <AtelierForm mode="create" />
    </AppShell>
  );
}
