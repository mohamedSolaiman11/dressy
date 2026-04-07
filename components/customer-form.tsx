"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer } from "@/lib/mock-data";
import { Field, StatusPill } from "@/components/ui";
import { MessageIcon, PhoneIcon, UserIcon } from "@/components/icons";

type CustomerFormProps = {
  mode: "create" | "edit";
  baseCustomer?: Customer | null;
  dataSource: "supabase" | "mock";
};

const sizeOptions = ["S", "M", "L", "XL"];

export function CustomerForm({
  mode,
  baseCustomer,
  dataSource
}: CustomerFormProps) {
  const router = useRouter();
  const [name, setName] = useState(baseCustomer?.name ?? "");
  const [phone, setPhone] = useState(baseCustomer?.phone ?? "");
  const [area, setArea] = useState(baseCustomer?.area ?? "");
  const [preferredSize, setPreferredSize] = useState(baseCustomer?.preferredSize ?? "M");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) {
      setSaveState("error");
      setMessage("كملي اسم العميلة ورقم الموبايل الأول.");
      return;
    }

    if (dataSource !== "supabase") {
      setSaveState("success");
      setMessage("التجربة دي محتاجة Supabase علشان الحفظ الحقيقي.");
      return;
    }

    setSaveState("saving");
    setMessage("");

    const response = await fetch(
      mode === "create" ? "/api/customers" : `/api/customers/${baseCustomer?.id}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          phone,
          area,
          preferredSize
        })
      }
    );

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setSaveState("error");
      setMessage(payload.message ?? "تعذر حفظ بيانات العميلة.");
      return;
    }

    setSaveState("success");
    setMessage(payload.message ?? "تم حفظ بيانات العميلة.");
    router.push("/customers");
    router.refresh();
  }

  return (
    <div className="section">
      <div className="form-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {mode === "create" ? "إضافة عميلة" : "تعديل بيانات العميلة"}
            </h2>
            <p className="section-copy">
              سجلي العميلة مرة واحدة علشان يبقى الحجز بعد كده أسرع وبأقل كتابة.
            </p>
          </div>
          <StatusPill>{mode === "create" ? "جديدة" : "تعديل"}</StatusPill>
        </div>

        <div className="form-grid">
          <Field label="اسم العميلة">
            <div className="search-wrap">
              <UserIcon className="search-icon" />
              <input
                className="search-field"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setSaveState("idle");
                }}
                placeholder="الاسم بالكامل"
              />
            </div>
          </Field>

          <Field label="رقم الموبايل">
            <div className="search-wrap">
              <PhoneIcon className="search-icon" />
              <input
                className="search-field"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setSaveState("idle");
                }}
                placeholder="01xxxxxxxxx"
              />
            </div>
          </Field>
        </div>

        <div className="form-grid" style={{ marginTop: 16 }}>
          <Field label="المنطقة">
            <div className="search-wrap">
              <MessageIcon className="search-icon" />
              <input
                className="search-field"
                value={area}
                onChange={(event) => {
                  setArea(event.target.value);
                  setSaveState("idle");
                }}
                placeholder="مثال: مدينة نصر"
              />
            </div>
          </Field>

          <Field label="المقاس المفضل">
            <div className="chip-row">
              {sizeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`toggle-chip ${preferredSize === option ? "active" : ""}`}
                  onClick={() => {
                    setPreferredSize(option);
                    setSaveState("idle");
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {baseCustomer ? (
          <div className="detail-list" style={{ marginTop: 20 }}>
            <div className="detail-item">
              <span>عدد الحجوزات</span>
              <strong>{new Intl.NumberFormat("ar-EG").format(baseCustomer.historyCount)}</strong>
            </div>
            <div className="detail-item">
              <span>المتبقي</span>
              <strong>
                {new Intl.NumberFormat("ar-EG", {
                  style: "currency",
                  currency: "EGP",
                  maximumFractionDigits: 0
                }).format(baseCustomer.balanceDue)}
              </strong>
            </div>
          </div>
        ) : null}

        <div className="inline-actions" style={{ marginTop: 24 }}>
          <button type="button" className="pill-button primary" onClick={handleSubmit}>
            {saveState === "saving"
              ? "جاري الحفظ..."
              : mode === "create"
                ? "حفظ العميلة"
                : "تحديث العميلة"}
          </button>
        </div>

        {saveState === "success" ? (
          <div className="alert-box success" style={{ marginTop: 16 }}>
            {message}
          </div>
        ) : null}

        {saveState === "error" ? (
          <div className="alert-box error" style={{ marginTop: 16 }}>
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
