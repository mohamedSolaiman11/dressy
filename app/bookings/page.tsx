import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DataSourceBanner } from "@/components/data-source-banner";
import { getBookingsData, formatCurrency, formatDateLabel } from "@/lib/data";
import { PageHero, SectionHeader, StatusPill } from "@/components/ui";

export default async function BookingsPage() {
  const { bookings, source } = await getBookingsData();

  return (
    <AppShell currentPath="/bookings">
      <DataSourceBanner source={source} />
      <PageHero
        badge="أهم شاشة تشغيل"
        title="الحجوزات"
        description="كل الحجوزات قدامك مع الحالة والدفع ومواعيد التسليم والاسترجاع. من هنا تقدري تدخلي على التفاصيل أو تعملي حجز جديد بسرعة."
        primaryHref="/bookings/new"
        primaryLabel="حجز جديد"
        secondaryHref="/calendar"
        secondaryLabel="عرض التقويم"
      />

      <section className="section">
        <SectionHeader
          title="قائمة الحجوزات"
          copy="عرض واضح مناسب للموبايل وفيه أهم المعلومات مباشرة."
        />

        <div className="booking-list">
          {bookings.map((booking) => (
            <article key={booking.id} className="booking-card">
              <div className="card-head">
                <div className="brand-lockup">
                  <div className="avatar-chip">{booking.customerName.slice(0, 1)}</div>
                  <div>
                    <div className="card-title">{booking.customerName}</div>
                    <div className="card-subtitle">{booking.phone}</div>
                  </div>
                </div>

                <StatusPill
                  tone={
                    booking.status === "تم التسليم"
                      ? "success"
                      : booking.status === "محجوز"
                        ? "warning"
                        : "default"
                  }
                >
                  {booking.status}
                </StatusPill>
              </div>

              <div className="detail-list">
                <div className="detail-item">
                  <span>الفستان</span>
                  <strong>{booking.dressCode}</strong>
                </div>
                <div className="detail-item">
                  <span>الاستلام</span>
                  <strong>{formatDateLabel(booking.pickupDate)}</strong>
                </div>
                <div className="detail-item">
                  <span>الرد</span>
                  <strong>{formatDateLabel(booking.returnDate)}</strong>
                </div>
                <div className="detail-item">
                  <span>المتبقي</span>
                  <strong>{formatCurrency(booking.total - booking.deposit)}</strong>
                </div>
              </div>

              <div className="notification-banner">
                <div>
                  <strong>{booking.dressName}</strong>
                  <span className="helper-text">{booking.note}</span>
                </div>
                <StatusPill tone={booking.paymentStatus === "مدفوع" ? "success" : "danger"}>
                  {booking.paymentStatus}
                </StatusPill>
              </div>

              <div className="inline-actions">
                <Link href={`/bookings/${booking.id}`} className="pill-button primary">
                  تفاصيل الحجز
                </Link>
                <Link href="/bookings/new" className="ghost-button">
                  تكرار سريع
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
