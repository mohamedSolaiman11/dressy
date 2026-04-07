import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DataSourceBanner } from "@/components/data-source-banner";
import { DressForm } from "@/components/dress-form";
import { getDressByIdData } from "@/lib/data";
import { PageHero } from "@/components/ui";

export default async function EditDressPage({
  params
}: {
  params: { id: string };
}) {
  const { dress, source } = await getDressByIdData(params.id);

  if (!dress) {
    notFound();
  }

  return (
    <AppShell currentPath="/dresses">
      <DataSourceBanner source={source} />
      <PageHero
        badge="تعديل مباشر"
        title="تعديل بيانات الفستان"
        description="عدلي المقاس أو السعر أو الحالة بسرعة، والتغيير ينعكس فورًا على كروت الفساتين والحجوزات."
        primaryHref="/dresses"
        primaryLabel="رجوع للفساتين"
        secondaryHref="/bookings/new"
        secondaryLabel="فتح حجز جديد"
      />
      <DressForm mode="edit" baseDress={dress} dataSource={source} />
    </AppShell>
  );
}
