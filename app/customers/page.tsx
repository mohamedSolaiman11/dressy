import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DataSourceBanner } from "@/components/data-source-banner";
import { MessageIcon, PhoneIcon } from "@/components/icons";
import { getCustomersData, formatCurrency } from "@/lib/data";
import { PageHero, SectionHeader, StatusPill } from "@/components/ui";

export default async function CustomersPage() {
  const { customers, source } = await getCustomersData();

  return (
    <AppShell currentPath="/customers">
      <DataSourceBanner source={source} />
      <PageHero
        badge="عملاءك في مكان واحد"
        title="العملاء"
        description="كل عميلة لها كارت واضح فيه الموبايل، آخر فستان، عدد الحجوزات، والباقي عليها. مناسب جدًا للمتابعة السريعة."
        primaryHref="/customers/new"
        primaryLabel="إضافة عميلة"
        secondaryHref="/bookings"
        secondaryLabel="فتح الحجوزات"
      />

      <section className="section">
        <SectionHeader
          title="قائمة العميلات"
          copy="بيانات بسيطة مع أزرار مباشرة للاتصال أو الرسالة."
        />

        <div className="customer-list">
          {customers.map((customer) => (
            <article key={customer.id} className="customer-card">
              <div className="card-head">
                <div className="brand-lockup">
                  <div className="avatar-chip">{customer.initials}</div>
                  <div>
                    <div className="card-title">{customer.name}</div>
                    <div className="card-subtitle">{customer.phone}</div>
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

              <div className="detail-list">
                <div className="detail-item">
                  <span>آخر فستان</span>
                  <strong>{customer.lastDress}</strong>
                </div>
                <div className="detail-item">
                  <span>عدد الحجوزات</span>
                  <strong>
                    {new Intl.NumberFormat("ar-EG").format(customer.historyCount)}
                  </strong>
                </div>
                <div className="detail-item">
                  <span>المقاس المفضل</span>
                  <strong>{customer.preferredSize}</strong>
                </div>
                <div className="detail-item">
                  <span>المتبقي</span>
                  <strong>{formatCurrency(customer.balanceDue)}</strong>
                </div>
              </div>

              <div className="notification-banner">
                <div>
                  <strong>{customer.area}</strong>
                  <span className="helper-text">سجل العميلة وبيانات الحجز قريبين في نفس الشاشة.</span>
                </div>
                <StatusPill tone={customer.balanceDue > 0 ? "danger" : "success"}>
                  {customer.balanceDue > 0 ? "عليها باقي" : "حساب مقفول"}
                </StatusPill>
              </div>

              <div className="inline-actions">
                <Link href={`/customers/${customer.id}/edit`} className="pill-button primary">
                  تعديل البيانات
                </Link>
                <Link href="/bookings/new" className="ghost-button">
                  حجز جديد
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
