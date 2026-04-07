import { AppShell } from "@/components/app-shell";
import { DataSourceBanner } from "@/components/data-source-banner";
import { CalendarView } from "@/components/calendar-view";
import { getCalendarData } from "@/lib/data";
import { PageHero } from "@/components/ui";

export default async function CalendarPage() {
  const { bookings, source, today } = await getCalendarData();

  return (
    <AppShell currentPath="/calendar">
      <DataSourceBanner source={source} />
      <PageHero
        badge="مشغول / فاضي بسرعة"
        title="التقويم"
        description="عرض مرئي بسيط يوضح الأيام المشغولة ومواعيد التسليم والاسترجاع من غير ما تضطري تفتحي كل حجز لوحده."
        primaryHref="/bookings/new"
        primaryLabel="إضافة موعد جديد"
        secondaryHref="/bookings"
        secondaryLabel="عرض الحجوزات"
      />
      <CalendarView bookings={bookings} selectedDate={today} />
    </AppShell>
  );
}
