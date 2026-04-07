import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DataSourceBanner } from "@/components/data-source-banner";
import { DressGalleryViewer } from "@/components/dress-gallery-viewer";
import {
  CashIcon,
  CheckCircleIcon,
  DeliveryIcon,
  MessageIcon,
  PhoneIcon,
  ReturnIcon
} from "@/components/icons";
import { getBookingDetailData, formatCurrency } from "@/lib/data";
import { formatFullDateLabel } from "@/lib/mock-data";
import { DetailItem, SectionHeader, StatusPill } from "@/components/ui";

const timeline = ["محجوز", "تم التسليم", "تم الاسترجاع"] as const;

export default async function BookingDetailPage({
  params
}: {
  params: { id: string };
}) {
  const { booking, customer, dress, source } = await getBookingDetailData(params.id);

  if (!booking) {
    notFound();
  }

  const activeStep = timeline.indexOf(booking.status);

  return (
    <AppShell currentPath="/bookings">
      <DataSourceBanner source={source} />
      <section className="detail-card">
        <div className="form-grid">
          <div className="selection-card active">
            <DressGalleryViewer
              tone={dress?.imageTone ?? "rose"}
              code={booking.dressCode}
              imageUrl={dress?.imageUrl}
              gallery={dress?.gallery ?? []}
              alt={`صورة ${booking.dressName}`}
            />
          </div>

          <div className="field-block">
            <div className="section-header">
              <div>
                <h1 className="section-title">{booking.dressName}</h1>
                <p className="section-copy">
                  {customer?.name} - {booking.phone}
                </p>
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
              <DetailItem label="الاستلام" value={formatFullDateLabel(booking.pickupDate)} />
              <DetailItem label="الاسترجاع" value={formatFullDateLabel(booking.returnDate)} />
              <DetailItem label="رقم الفستان" value={booking.dressCode} />
              <DetailItem label="مرحلة الحجز" value={booking.fittingStage} />
            </div>

            <div className="inline-actions" style={{ marginTop: 20 }}>
              <button type="button" className="pill-button primary">
                <DeliveryIcon />
                تأكيد التسليم
              </button>
              <button type="button" className="ghost-button">
                <ReturnIcon />
                تسجيل استرجاع
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeader title="المدفوعات" copy="العربون والباقي وحالة الدفع في نفس المكان." />

        <div className="payment-summary">
          <div className="total-box">
            <span>العربون</span>
            <strong>{formatCurrency(booking.deposit)}</strong>
          </div>
          <div className="total-box">
            <span>المبلغ المتبقي</span>
            <strong>{formatCurrency(booking.total - booking.deposit)}</strong>
          </div>
        </div>

        <div className="notification-banner" style={{ marginTop: 16 }}>
          <div className="soft-icon">
            <CashIcon />
          </div>
          <div>
            <strong>حالة الدفع: {booking.paymentStatus}</strong>
            <span className="helper-text">
              إجمالي الحجز {formatCurrency(booking.total)} والمبلغ المتبقي يتحصل قبل الرد.
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeader title="متابعة الحالة" copy="تسلسل بسيط يوضح الحجز وصل لفين." />

        <div className="panel">
          <div className="timeline">
            {timeline.map((step, index) => (
              <div key={step} className="timeline-step">
                <div className={`timeline-dot ${index <= activeStep ? "active" : ""}`} />
                <div>
                  <strong>{step}</strong>
                  <div className="helper-text" style={{ marginTop: 6 }}>
                    {index === 0 && "تم إنشاء الحجز وتثبيت الفستان على المدة."}
                    {index === 1 && "تم تسليم الفستان أو جاهز للتسليم."}
                    {index === 2 && "تم رجوع الفستان ومراجعة حالته."}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeader title="بيانات العميلة" copy="وسائل التواصل وسجل الملاحظات المهمة." />

        <div className="panel">
          <div className="card-head">
            <div className="brand-lockup">
              <div className="avatar-chip">{customer?.initials ?? "ع"}</div>
              <div>
                <div className="card-title">{customer?.name ?? booking.customerName}</div>
                <div className="card-subtitle">{customer?.area ?? "القاهرة"}</div>
              </div>
            </div>

            <div className="customer-actions">
              <button className="quick-icon" aria-label="رسالة">
                <MessageIcon width="18" height="18" />
              </button>
              <button className="quick-icon" aria-label="اتصال">
                <PhoneIcon width="18" height="18" />
              </button>
            </div>
          </div>

          <div className="detail-list" style={{ marginTop: 16 }}>
            <DetailItem label="رقم الموبايل" value={booking.phone} />
            <DetailItem label="المنطقة" value={customer?.area ?? "غير محددة"} />
            <DetailItem
              label="عدد الحجوزات"
              value={new Intl.NumberFormat("ar-EG").format(customer?.historyCount ?? 1)}
            />
            <DetailItem label="المقاس المفضل" value={customer?.preferredSize ?? "M"} />
          </div>

          <div className="alert-box info" style={{ marginTop: 16 }}>
            {booking.note}
          </div>

          <div className="inline-actions" style={{ marginTop: 18 }}>
            <Link href="/customers" className="pill-button primary">
              فتح العميلات
            </Link>
            <Link href="/bookings/new" className="ghost-button">
              حجز جديد لنفس العميلة
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="notification-banner">
          <div className="soft-icon">
            <CheckCircleIcon />
          </div>
          <div>
            <strong>تنبيه UI</strong>
            <span className="helper-text">
              قبل {formatFullDateLabel(booking.returnDate)} ابعتي تذكير بسيط للعميلة بموعد الرد.
            </span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
