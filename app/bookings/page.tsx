import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DataSourceBanner } from "@/components/data-source-banner";
import { getBookingsData, formatCurrency, formatDateLabel } from "@/lib/data";
import { PageHero, SectionHeader, StatusPill } from "@/components/ui";

function getStatusTone(status: string) {
  if (status === "تم التسليم") {
    return "success" as const;
  }

  if (status === "محجوز") {
    return "warning" as const;
  }

  return "default" as const;
}

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

        <div className="status-legend">
          <StatusPill tone="warning">محجوز</StatusPill>
          <StatusPill tone="success">تم التسليم</StatusPill>
          <StatusPill>تم الاسترجاع</StatusPill>
        </div>

        <div className="booking-list">
          {bookings.map((booking) => (
            <article key={booking.id} className="booking-card">
              <div className="card-head">
                <div className="brand-lockup">
                  <div className="avatar-chip">{booking.customerName.slice(0, 1)}</div>
                  <div>
                    <div className="card-title">{booking.customerName}</div>
                    <div className="card-subtitle">{booking.phone}</div>
                    {booking.bookingSource === "website" ? (
                      <div className="helper-text" style={{ marginTop: 8 }}>
                        <span className="source-badge">من الموقع</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <StatusPill tone={getStatusTone(booking.status)}>{booking.status}</StatusPill>
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
