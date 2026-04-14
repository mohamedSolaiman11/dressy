import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DataSourceBanner } from "@/components/data-source-banner";
import {
  BookingIcon,
  CashIcon,
  CheckCircleIcon,
  ClockIcon,
  DeliveryIcon,
  ReturnIcon
} from "@/components/icons";
import { getDashboardData, formatCurrency } from "@/lib/data";
import { MetricCard, PageHero, SectionHeader, StatusPill } from "@/components/ui";

const toneIcons = {
  bookings: <BookingIcon />,
  delivery: <DeliveryIcon />,
  return: <ReturnIcon />,
  cash: <CashIcon />
};

export async function AdminDashboard() {
  const { dashboardStats, notifications, paymentSnapshot, todayTasks, source } =
    await getDashboardData();

  return (
    <AppShell currentPath="/dashboard">
      <DataSourceBanner source={source} />
      <PageHero
        badge="موبايل أول - سريع وواضح"
        title="مرحبًا بيكي في منصة الفساتين"
        description="كل اللي يهمك النهارده قدامك فورًا: حجوزات، تسليمات، استرجاع، وتحويلات بسيطة من غير لف كتير."
        primaryHref="/bookings/new"
        primaryLabel="إضافة حجز جديد"
        secondaryHref="/calendar"
        secondaryLabel="فتح التقويم"
      />

      <section className="section">
        <SectionHeader title="تنبيهات النهارده" copy="تذكير سريع قبل الزحمة." />
        <div className="task-list">
          {notifications.map((notification) => (
            <div key={notification.id} className="notification-banner">
              <div className="soft-icon">
                <CheckCircleIcon />
              </div>
              <div>
                <strong>{notification.title}</strong>
                <span className="helper-text">{notification.copy}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader title="ملخص اليوم" copy="بطاقات كبيرة وسريعة للقراءة على الموبايل." />
        <div className="stats-grid">
          {dashboardStats.map((item) => (
            <MetricCard
              key={item.label}
              icon={toneIcons[item.tone]}
              label={item.label}
              value={
                item.tone === "cash"
                  ? formatCurrency(Number(item.value))
                  : new Intl.NumberFormat("ar-EG").format(Number(item.value))
              }
              hint={item.hint}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader
          title="المهام المهمة"
          copy="التحركات اللي محتاجة عينك النهارده."
          linkHref="/bookings"
          linkLabel="عرض الحجوزات"
        />

        <div className="task-list">
          {todayTasks.map((task) => (
            <article key={task.id} className="event-card">
              <div className="time-pill">
                <ClockIcon width="16" height="16" />
                {task.time}
              </div>
              <div>
                <div className="card-title" style={{ fontSize: 20 }}>
                  {task.title}
                </div>
                <div className="card-subtitle">{task.copy}</div>
              </div>
              <StatusPill tone={task.status === "تحصيل" ? "danger" : "warning"}>
                {task.status}
              </StatusPill>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader title="إحصائيات سريعة" copy="لقطة مالية وتشغيلية واضحة في ثانية." />

        <div className="panel">
          <div className="payment-summary">
            <div className="total-box">
              <span>عدد الحجوزات هذا الشهر</span>
              <strong>
                {new Intl.NumberFormat("ar-EG").format(paymentSnapshot.bookingsCount)}
              </strong>
              <div className="helper-text">{paymentSnapshot.bookingsGrowth} عن الشهر اللي فات</div>
            </div>

            <div className="total-box">
              <span>الإيرادات</span>
              <strong>{formatCurrency(paymentSnapshot.revenue)}</strong>
              <div className="helper-text">مجموع المدفوعات المسجلة لحد دلوقتي</div>
            </div>
          </div>

          <div
            className="notification-banner"
            style={{ marginTop: 16, justifyContent: "space-between" }}
          >
            <div>
              <strong>باقي تحصيلات مفتوحة</strong>
              <span className="helper-text">
                فيه {formatCurrency(paymentSnapshot.unpaidAmount)} لسه محتاجين متابعة.
              </span>
            </div>
            <Link href="/customers" className="ghost-button">
              متابعة العملاء
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
