"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, StatusPill } from "@/components/ui";

export function AtelierForm({
  mode
}: {
  mode: "onboarding" | "create";
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [publicSlug, setPublicSlug] = useState("");
  const [claimExistingData, setClaimExistingData] = useState(mode === "onboarding");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!name.trim()) {
      setSaveState("error");
      setMessage("اكتبي اسم الأتيليه أو النشاط الأول.");
      return;
    }

    setSaveState("saving");
    setMessage("");

    const response = await fetch("/api/ateliers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        branchName,
        publicSlug,
        claimExistingData
      })
    });

    const payload = (await response.json()) as { message?: string; storefrontPath?: string };

    if (!response.ok) {
      setSaveState("error");
      setMessage(payload.message ?? "تعذر إنشاء الفرع.");
      return;
    }

    setSaveState("success");
    setMessage(
      payload.storefrontPath
        ? `${payload.message ?? "تم إنشاء الفرع."} الرابط العام: ${payload.storefrontPath}`
        : payload.message ?? "تم إنشاء الفرع."
    );
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="section">
      <div className="form-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {mode === "onboarding" ? "ابدئي بأول أتيليه/فرع" : "إضافة فرع جديد"}
            </h2>
            <p className="section-copy">
              حسابك يقدر يدير أكتر من فرع. اختاري اسم الأتيليه واسم الفرع ولو حابة حددي رابط
              العرض العام.
            </p>
          </div>
          <StatusPill>{mode === "onboarding" ? "بداية" : "فرع جديد"}</StatusPill>
        </div>

        <div className="form-grid">
          <Field label="اسم الأتيليه">
            <input
              className="text-field"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSaveState("idle");
              }}
              placeholder="مثال: منصة الفساتين"
            />
          </Field>

          <Field label="اسم الفرع">
            <input
              className="text-field"
              value={branchName}
              onChange={(event) => {
                setBranchName(event.target.value);
                setSaveState("idle");
              }}
              placeholder="مثال: مدينة نصر"
            />
          </Field>
        </div>

        <Field
          label="الرابط العام"
          help="اختياري. اكتبيه بحروف إنجليزي وأرقام فقط. لو سبتيه فاضي هنعمله تلقائي."
        >
          <div className="slug-field">
            <span className="slug-prefix" dir="ltr">
              /s/
            </span>
            <input
              className="text-field"
              dir="ltr"
              value={publicSlug}
              onChange={(event) => {
                setPublicSlug(event.target.value);
                setSaveState("idle");
              }}
              placeholder="rose-nasr-city"
            />
          </div>
        </Field>

        {mode === "onboarding" ? (
          <label className="selection-card active" style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <input
              type="checkbox"
              checked={claimExistingData}
              onChange={(event) => {
                setClaimExistingData(event.target.checked);
                setSaveState("idle");
              }}
            />
            <div>
              <strong>نقل البيانات القديمة لأول فرع</strong>
              <div className="helper-text">
                فعّليها لو عندك بيانات حالية بدون فروع وعايزة تضميها للفرع الأول.
              </div>
            </div>
          </label>
        ) : null}

        <div className="inline-actions" style={{ marginTop: 24 }}>
          <button type="button" className="pill-button primary" onClick={handleSubmit}>
            {saveState === "saving" ? "جاري الإنشاء..." : "حفظ الفرع"}
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
