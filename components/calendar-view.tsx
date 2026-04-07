import { formatCurrency, formatDateLabel, type Booking } from "@/lib/mock-data";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon
} from "@/components/icons";
import { StatusPill } from "@/components/ui";

const weekdays = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت"
];

function getCalendarDays(selectedDate: string) {
  const current = new Date(selectedDate);
  const monthIndex = current.getMonth();
  const year = current.getFullYear();
  const firstDay = new Date(year, monthIndex, 1);
  const firstWeekday = firstDay.getDay();
  const gridStart = new Date(year, monthIndex, 1 - firstWeekday);

  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    return date;
  });
}

function isWithinRange(dateValue: string, start: string, end: string) {
  const date = new Date(dateValue).getTime();
  const rangeStart = new Date(start).getTime();
  const rangeEnd = new Date(end).getTime();

  return date >= rangeStart && date <= rangeEnd;
}

export function CalendarView({
  bookings,
  selectedDate
}: {
  bookings: Booking[];
  selectedDate: string;
}) {
  const days = getCalendarDays(selectedDate);
  const selected = new Date(selectedDate);
  const monthLabel = new Intl.DateTimeFormat("ar-EG", {
    month: "long",
    year: "numeric"
  }).format(selected);

  const agenda = bookings.filter(
    (booking) =>
      booking.pickupDate === selectedDate || booking.returnDate === selectedDate
  );

  return (
    <div className="section">
      <div className="calendar-card">
        <div className="calendar-head">
          <div className="segmented">
            <button type="button" className="segmented-button">
              أسبوعي
            </button>
            <button type="button" className="segmented-button active">
              شهري
            </button>
          </div>

          <div className="topbar-side">
            <button className="icon-button" aria-label="الشهر السابق">
              <ChevronRightIcon />
            </button>
            <div>
              <div className="section-title" style={{ fontSize: 30 }}>
                {monthLabel}
              </div>
              <div className="section-copy">عرض بسيط يوضح المشغول والفاضي بسرعة.</div>
            </div>
            <button className="icon-button" aria-label="الشهر التالي">
              <ChevronLeftIcon />
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {weekdays.map((weekday) => (
            <div key={weekday} className="calendar-weekday">
              {weekday}
            </div>
          ))}

          {days.map((date) => {
            const iso = date.toISOString().slice(0, 10);
            const sameMonth =
              date.getMonth() === selected.getMonth() &&
              date.getFullYear() === selected.getFullYear();
            const dayBookings = bookings.filter((booking) =>
              isWithinRange(iso, booking.pickupDate, booking.returnDate)
            );
            const hasBusy = dayBookings.length > 0;
            const hasFitting = dayBookings.some((booking) =>
              booking.fittingStage.includes("قياس")
            );

            return (
              <div
                key={iso}
                className={`calendar-day ${sameMonth ? "" : "outside"} ${
                  iso === selectedDate ? "active" : ""
                }`}
              >
                <div className="day-number">
                  {new Intl.NumberFormat("ar-EG").format(date.getDate())}
                </div>
                <div className="dots">
                  <span className={`dot ${hasBusy ? "busy" : ""}`} />
                  <span className={`dot ${hasFitting ? "fitting" : ""}`} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="legend">
          <span className="legend-item">
            <span className="dot busy" />
            محجوز
          </span>
          <span className="legend-item">
            <span className="dot fitting" />
            معاينة / قياس
          </span>
          <span className="legend-item">
            <span className="dot" />
            متاح
          </span>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">حجوزات يوم {formatDateLabel(selectedDate)}</h2>
            <p className="section-copy">المشاوير المرتبطة بالتاريخ المختار واضحة تحت التقويم.</p>
          </div>
          <StatusPill>{agenda.length} مواعيد</StatusPill>
        </div>

        <div className="booking-list">
          {agenda.map((booking) => (
            <article key={booking.id} className="event-card">
              <div className="avatar-chip">{booking.customerName.slice(0, 1)}</div>
              <div>
                <div className="card-title" style={{ fontSize: 20 }}>
                  {booking.customerName}
                </div>
                <div className="card-subtitle">
                  {booking.dressName} - {booking.fittingStage}
                </div>
                <div className="helper-text" style={{ marginTop: 8 }}>
                  المدفوع {formatCurrency(booking.deposit)} من أصل {formatCurrency(booking.total)}
                </div>
              </div>
              <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
                <div className="time-pill">
                  <ClockIcon width="16" height="16" />
                  {booking.timeLabel}
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
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
