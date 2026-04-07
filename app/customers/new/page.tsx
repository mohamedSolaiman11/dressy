import { AppShell } from "@/components/app-shell";
import { DataSourceBanner } from "@/components/data-source-banner";
import { CustomerForm } from "@/components/customer-form";
import { getDataSourceStatus } from "@/lib/data";
import { PageHero } from "@/components/ui";

export default async function NewCustomerPage() {
  const source = await getDataSourceStatus();

  return (
    <AppShell currentPath="/customers">
      <DataSourceBanner source={source} />
      <PageHero
        badge="إضافة سريعة"
        title="عميلة جديدة"
        description="سجلي اسم العميلة والموبايل والمنطقة علشان تظهر فورًا في قائمة العملاء وتقدري تعمليلها حجز بسرعة."
        primaryHref="/customers"
        primaryLabel="رجوع للعملاء"
        secondaryHref="/bookings/new"
        secondaryLabel="فتح حجز جديد"
      />
      <CustomerForm mode="create" dataSource={source} />
    </AppShell>
  );
}
