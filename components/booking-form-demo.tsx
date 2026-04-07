"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatCurrency,
  formatDateLabel,
  type Booking,
  type Customer,
  type Dress
} from "@/lib/mock-data";
import { CheckCircleIcon, SearchIcon, SparklesIcon } from "@/components/icons";
import { DressGalleryViewer } from "@/components/dress-gallery-viewer";
import { Field, StatusPill } from "@/components/ui";

function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart <= bEnd && bStart <= aEnd;
}

function addDays(value: string, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function BookingFormDemo({
  bookings,
  customers,
  dresses,
  initialDate,
  dataSource
}: {
  bookings: Booking[];
  customers: Customer[];
  dresses: Dress[];
  initialDate: string;
  dataSource: "supabase" | "mock";
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedDressId, setSelectedDressId] = useState(dresses[0]?.id ?? "");
  const [pickupDate, setPickupDate] = useState(initialDate);
  const [returnDate, setReturnDate] = useState(addDays(initialDate, 3));
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [deposit, setDeposit] = useState("3000");
  const [note, setNote] = useState("يفضل تجهيز الشال والكفر مع الفستان.");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const filteredDresses = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return dresses;
    }

    return dresses.filter((dress) =>
      `${dress.name} ${dress.code} ${dress.color} ${dress.category}`
        .toLowerCase()
        .includes(term)
    );
  }, [search, dresses]);

  const selectedDress = dresses.find((dress) => dress.id === selectedDressId);
  const matchedCustomer = customers.find((customer) => customer.phone === phone);

  useEffect(() => {
    if (matchedCustomer && !customerName) {
      setCustomerName(matchedCustomer.name);
    }
  }, [matchedCustomer, customerName]);

  const conflictingBooking = useMemo(() => {
    if (!selectedDressId || !pickupDate || !returnDate) {
      return undefined;
    }

    return bookings.find(
      (booking) =>
        booking.dressId === selectedDressId &&
        booking.status !== "تم الاسترجاع" &&
        rangesOverlap(pickupDate, returnDate, booking.pickupDate, booking.returnDate)
    );
  }, [bookings, pickupDate, returnDate, selectedDressId]);

  const depositNumber = Number(deposit || 0);
  const remaining = Math.max((selectedDress?.price ?? 0) - depositNumber, 0);
  const readyToSave =
    Boolean(selectedDress) &&
    Boolean(pickupDate) &&
    Boolean(returnDate) &&
    Boolean(customerName.trim()) &&
    Boolean(phone.trim()) &&
    !conflictingBooking;

  function fillCustomer(name: string, mobile: string) {
    setCustomerName(name);
    setPhone(mobile);
    setSaveState("idle");
  }

  async function handleSave() {
    if (!readyToSave) {
      return;
    }

    if (dataSource !== "supabase") {
      setSaveState("success");
      setFeedbackMessage(
        "تم الحفظ بشكل تجريبي. أول ما تضيفي مفاتيح Supabase الحجز هيتسجل في القاعدة."
      );
      return;
    }

    setSaveState("saving");
    setFeedbackMessage("");

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        customerName,
        phone,
        dressId: selectedDressId,
        pickupDate,
        returnDate,
        deposit: Number(deposit || 0),
        note
      })
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setSaveState("error");
      setFeedbackMessage(payload.message ?? "حصل خطأ أثناء حفظ الحجز.");
      return;
    }

    setSaveState("success");
    setFeedbackMessage("تم حفظ الحجز في Supabase بنجاح، وجاري فتح قائمة الحجوزات.");
    router.push("/bookings");
    router.refresh();
  }

  return (
    <div className="section">
      <div className="form-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">إضافة حجز جديد</h2>
            <p className="section-copy">
              أقل خطوات ممكنة: اختاري الفستان، حددي المدة، وبيانات العميلة تتسجل بسرعة.
            </p>
          </div>
          <StatusPill>حجز سريع</StatusPill>
        </div>

        <div className="form-grid">
          <div className="field-block">
            <Field
              label="اختيار الفستان"
              help="ممكن تكتبي اسم الفستان أو الكود لو عندك موديل معين."
            >
              <div className="search-wrap">
                <SearchIcon className="search-icon" />
                <input
                  className="search-field"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setSaveState("idle");
                  }}
                  placeholder="ابحثي باسم الفستان أو الكود"
                />
              </div>
            </Field>

            <div className="dress-grid">
              {filteredDresses.slice(0, 4).map((dress) => (
                <button
                  key={dress.id}
                  type="button"
                  className={`selection-card ${
                    selectedDressId === dress.id ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedDressId(dress.id);
                    setSaveState("idle");
                  }}
                  style={{ border: 0, textAlign: "inherit", cursor: "pointer" }}
                >
                  <DressGalleryViewer
                    tone={dress.imageTone}
                    code={dress.code}
                    compact
                    imageUrl={dress.imageUrl}
                    gallery={dress.gallery}
                    zoomable={false}
                    interactiveThumbs={false}
                    showMeta={false}
                    alt={`صورة ${dress.name}`}
                  />
                  <div className="card-head booking-preview-head" style={{ marginTop: 14 }}>
                    <div>
                      <div className="card-title" style={{ fontSize: 18 }}>
                        {dress.name}
                      </div>
                      <div className="card-subtitle">
                        {dress.size} - {dress.color}
                      </div>
                    </div>
                    <StatusPill tone={dress.status === "متاح" ? "success" : "warning"}>
                      {dress.status}
                    </StatusPill>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="field-block">
            <div className="selection-card active">
              {selectedDress ? (
                <>
                  <DressGalleryViewer
                    tone={selectedDress.imageTone}
                    code={selectedDress.code}
                    imageUrl={selectedDress.imageUrl}
                    gallery={selectedDress.gallery}
                    alt={`صورة ${selectedDress.name}`}
                  />
                  <div className="card-head booking-preview-head" style={{ marginTop: 16 }}>
                    <div>
                      <div className="card-title">{selectedDress.name}</div>
                      <div className="card-subtitle">
                        {selectedDress.category} - {selectedDress.color}
                      </div>
                    </div>
                    <StatusPill tone={selectedDress.status === "متاح" ? "success" : "warning"}>
                      {selectedDress.status}
                    </StatusPill>
                  </div>

                  <div className="detail-list booking-preview-details" style={{ marginTop: 14 }}>
                    <div className="detail-item">
                      <span>السعر</span>
                      <strong>{formatCurrency(selectedDress.price)}</strong>
                    </div>
                    <div className="detail-item">
                      <span>المقاس</span>
                      <strong>{selectedDress.size}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-card">اختاري فستان علشان التفاصيل تظهر هنا.</div>
              )}
            </div>
          </div>
        </div>

        <div className="section" />

        <div className="form-grid">
          <Field label="من (تاريخ الاستلام)">
            <input
              className="text-field"
              type="date"
              value={pickupDate}
              onChange={(event) => {
                setPickupDate(event.target.value);
                setSaveState("idle");
              }}
            />
          </Field>

          <Field label="إلى (تاريخ الرد)">
            <input
              className="text-field"
              type="date"
              value={returnDate}
              min={pickupDate}
              onChange={(event) => {
                setReturnDate(event.target.value);
                setSaveState("idle");
              }}
            />
          </Field>
        </div>

        {conflictingBooking ? (
          <div className="alert-box error" style={{ marginTop: 16 }}>
            الفستان ده عليه حجز بالفعل من {formatDateLabel(conflictingBooking.pickupDate)} لحد{" "}
            {formatDateLabel(conflictingBooking.returnDate)} باسم {conflictingBooking.customerName}.
          </div>
        ) : (
          <div className="alert-box info" style={{ marginTop: 16 }}>
            مفيش تعارض في المدة المختارة، تقدري تكملي الحجز بأمان.
          </div>
        )}

        <div className="section" />

        <div className="section-header">
          <div>
            <h3 className="section-title" style={{ fontSize: 22 }}>
              بيانات العميلة
            </h3>
            <p className="section-copy">اختاري عميلة موجودة أو اكتبي الرقم والاسم.</p>
          </div>
          <StatusPill tone="success">أقل كتابة</StatusPill>
        </div>

        <div className="chip-row" style={{ marginBottom: 16 }}>
          {customers.slice(0, 3).map((customer) => (
            <button
              key={customer.id}
              type="button"
              className="toggle-chip"
              onClick={() => fillCustomer(customer.name, customer.phone)}
            >
              {customer.name}
            </button>
          ))}
        </div>

        <div className="form-grid">
          <Field label="رقم الموبايل">
            <input
              className="text-field"
              type="tel"
              inputMode="tel"
              placeholder="01xxxxxxxxx"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setSaveState("idle");
              }}
            />
          </Field>

          <Field label="اسم العميلة">
            <input
              className="text-field"
              value={customerName}
              onChange={(event) => {
                setCustomerName(event.target.value);
                setSaveState("idle");
              }}
              placeholder="الاسم بالكامل"
            />
          </Field>
        </div>

        {matchedCustomer ? (
          <div className="alert-box success" style={{ marginTop: 16 }}>
            العميلة دي متسجلة قبل كده. آخر فستان كان {matchedCustomer.lastDress}.
          </div>
        ) : null}

        <div className="section" />

        <div className="form-grid">
          <Field label="العربون">
            <input
              className="text-field"
              type="number"
              min="0"
              step="100"
              value={deposit}
              onChange={(event) => {
                setDeposit(event.target.value);
                setSaveState("idle");
              }}
            />
          </Field>

          <Field label="المبلغ المتبقي">
            <div className="text-field" style={{ display: "grid", alignItems: "center" }}>
              {formatCurrency(remaining)}
            </div>
          </Field>
        </div>

        <div className="payment-summary" style={{ marginTop: 16 }}>
          <div className="total-box">
            <span>إجمالي الفستان</span>
            <strong>{selectedDress ? formatCurrency(selectedDress.price) : "--"}</strong>
          </div>
          <div className="total-box">
            <span>المتبقي بعد العربون</span>
            <strong>{formatCurrency(remaining)}</strong>
          </div>
        </div>

        <div className="section" />

        <Field label="ملاحظات سريعة" help="اختياري - أي ملاحظة للتسليم أو القياس أو الدفع.">
          <textarea
            className="textarea-field"
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              setSaveState("idle");
            }}
          />
        </Field>

        <div className="inline-actions" style={{ marginTop: 20 }}>
          <button
            type="button"
            className="pill-button primary"
            onClick={handleSave}
            aria-busy={saveState === "saving"}
            disabled={!readyToSave}
            style={{
              opacity: readyToSave ? 1 : 0.54,
              pointerEvents: readyToSave ? "auto" : "none"
            }}
          >
            <CheckCircleIcon />
            {saveState === "saving" ? "جاري الحفظ..." : "حفظ الحجز"}
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              if (matchedCustomer) {
                setNote(`العميلة قديمة - آخر تعامل: ${matchedCustomer.lastDress}`);
              }
              setSaveState("idle");
            }}
          >
            <SparklesIcon />
            تجهيز تلقائي للملاحظات
          </button>
        </div>

        {saveState === "success" ? (
          <div className="alert-box success" style={{ marginTop: 16 }}>
            {feedbackMessage || (
              <>
                تم حفظ الحجز بنجاح. موعد التسليم {formatDateLabel(pickupDate)} والمبلغ المتبقي{" "}
                {formatCurrency(remaining)}.
              </>
            )}
          </div>
        ) : null}

        {saveState === "error" ? (
          <div className="alert-box error" style={{ marginTop: 16 }}>
            {feedbackMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}
