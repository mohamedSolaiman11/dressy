import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DataSourceBanner } from "@/components/data-source-banner";
import { CustomerForm } from "@/components/customer-form";
import { getCustomerByIdData } from "@/lib/data";
import { PageHero } from "@/components/ui";

export default async function EditCustomerPage({
  params
}: {
  params: { id: string };
}) {
  const { customer, source } = await getCustomerByIdData(params.id);

  if (!customer) {
    notFound();
  }

  return (
    <AppShell currentPath="/customers">
      <DataSourceBanner source={source} />
      <PageHero
        badge="تعديل مباشر"
        title="تعديل بيانات العميلة"
        description="عدلي بيانات العميلة بسرعة علشان تبقى جاهزة للحجز والمتابعة والتحصيل."
        primaryHref="/customers"
        primaryLabel="رجوع للعملاء"
        secondaryHref="/bookings/new"
        secondaryLabel="فتح حجز جديد"
      />
      <CustomerForm mode="edit" baseCustomer={customer} dataSource={source} />
    </AppShell>
  );
}
