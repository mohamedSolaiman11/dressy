"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleIcon, MessageIcon, PhoneIcon, UserIcon } from "@/components/icons";
import { Field, StatusPill } from "@/components/ui";
import { formatCurrency, formatDateLabel } from "@/lib/mock-data";
import type { PublicCatalogDress } from "@/lib/public-catalog-shared";

export function PublicBookingForm({
  dresses,
  selectedDressId,
  atelierPhone,
  slug
}: {
  dresses: PublicCatalogDress[];
  selectedDressId?: string;
  atelierPhone: string;
  slug: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dressId, setDressId] = useState(selectedDressId ?? dresses[0]?.id ?? "");
  const [bookingDate, setBookingDate] = useState(searchParams.get("date") ?? "");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  const selectedDress = useMemo(
    () => dresses.find((dress) => dress.id === dressId) ?? null,
    [dressId, dresses]
  );

  const isReady =
    Boolean(selectedDress) &&
    Boolean(bookingDate) &&
    customerName.trim().length > 1 &&
    /^01\d{9}$/.test(phone.trim());

  async function handleSubmit() {
    if (!isReady || !selectedDress) {
      return;
    }

    setSaveState("saving");
    setMessage("");

    const response = await fetch("/api/public/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dressId: selectedDress.id,
        bookingDate,
        customerName,
        phone,
        slug
      })
    });

    const payload = (await response.json()) as {
      id?: string;
      message?: string;
      whatsappLink?: string;
    };

    if (!response.ok || !payload.id) {
      setSaveState("error");
      setMessage(payload.message ?? "حصلت مشكلة أثناء الحجز. جربي تاني.");
      return;
    }

    const params = new URLSearchParams({
      success: "1",
      id: payload.id,
      dress: selectedDress.name,
      date: bookingDate,
      name: customerName,
      phone,
      whatsapp: payload.whatsappLink ?? ""
    });

    router.push(`/s/${slug}/booking?${params.toString()}`);
    router.refresh();
  }

  return (
    <div className="form-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">احجزي في 3 خطوات</h2>
          <p className="section-copy">اختاري الفستان، حددي اليوم، وسيبي لنا اسمك ورقمك.</p>
        </div>
        <StatusPill tone="success">سريع وواضح</StatusPill>
      </div>

      <div className="form-grid">
        <Field label="الفستان">
          <select
            className="select-field"
            value={dressId}
            onChange={(event) => setDressId(event.target.value)}
          >
            {dresses.map((dress) => (
              <option key={dress.id} value={dress.id}>
                {dress.name} - {dress.code}
              </option>
            ))}
          </select>
        </Field>

        <Field label="اليوم المطلوب">
          <input
            className="text-field"
            type="date"
            value={bookingDate}
            onChange={(event) => setBookingDate(event.target.value)}
          />
        </Field>
      </div>

      {selectedDress ? (
        <div className="notification-banner public-booking-summary" style={{ marginTop: 16 }}>
          <div>
            <strong>{selectedDress.name}</strong>
            <span className="helper-text">
              السعر {formatCurrency(selectedDress.price)} - الحالة {selectedDress.status}
            </span>
          </div>
          {selectedDress.upcomingBookings.length ? (
            <span className="small-badge">عليه مواعيد قريبة</span>
          ) : null}
        </div>
      ) : null}

      {selectedDress?.upcomingBookings.length ? (
        <div className="upcoming-bookings-list">
          {selectedDress.upcomingBookings.map((booking) => (
            <div key={booking.id} className="mini-booking-chip">
              مشغول من {formatDateLabel(booking.pickupDate)} إلى {formatDateLabel(booking.returnDate)}
            </div>
          ))}
        </div>
      ) : null}

      <div className="section" />

      <div className="form-grid">
        <Field label="اسمك">
          <div className="field-icon-wrap">
            <UserIcon className="field-leading-icon" />
            <input
              className="text-field with-leading-icon"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="اكتبي اسمك"
            />
          </div>
        </Field>

        <Field label="رقم الموبايل">
          <div className="field-icon-wrap">
            <PhoneIcon className="field-leading-icon" />
            <input
              className="text-field with-leading-icon"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="01xxxxxxxxx"
            />
          </div>
        </Field>
      </div>

      <div className="inline-actions" style={{ marginTop: 20 }}>
        <button
          type="button"
          className="pill-button primary"
          disabled={!isReady || saveState === "saving"}
          onClick={handleSubmit}
          style={{
            opacity: !isReady || saveState === "saving" ? 0.65 : 1,
            pointerEvents: !isReady || saveState === "saving" ? "none" : "auto"
          }}
        >
          <CheckCircleIcon />
          {saveState === "saving" ? "جاري تأكيد الحجز..." : "احجز الآن"}
        </button>

        <a
          className="ghost-button"
          href={`https://wa.me/${atelierPhone.startsWith("0") ? `2${atelierPhone}` : atelierPhone}`}
          target="_blank"
          rel="noreferrer"
        >
          <MessageIcon />
          واتساب الأتيليه
        </a>
      </div>

      {saveState === "error" ? (
        <div className="alert-box error" style={{ marginTop: 16 }}>
          {message}
        </div>
      ) : null}
    </div>
  );
}
