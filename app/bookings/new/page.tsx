import { AppShell } from "@/components/app-shell";
import { DataSourceBanner } from "@/components/data-source-banner";
import { BookingFormDemo } from "@/components/booking-form-demo";
import { getBookingFormData } from "@/lib/data";
import { PageHero } from "@/components/ui";

export default async function NewBookingPage() {
  const { bookings, customers, dresses, source, today } = await getBookingFormData();

  return (
    <AppShell currentPath="/bookings">
      <DataSourceBanner source={source} />
      <PageHero
        badge="أقل خطوات"
        title="إنشاء حجز بسرعة"
        description="المطلوب هنا إن الحجز يخلص بأقل كتابة: اختيار فستان، تواريخ، وبيانات العميلة مع منع التعارض تلقائيًا."
        primaryHref="/bookings"
        primaryLabel="رجوع للحجوزات"
        secondaryHref="/calendar"
        secondaryLabel="مراجعة التقويم"
      />
      <BookingFormDemo
        bookings={bookings}
        customers={customers}
        dresses={dresses}
        initialDate={today}
        dataSource={source}
      />
    </AppShell>
  );
}
