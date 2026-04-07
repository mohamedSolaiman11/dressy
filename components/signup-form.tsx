"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Field } from "@/components/ui";
import { LockIcon, SparklesIcon, UserIcon } from "@/components/icons";

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        setStatus("error");
        setMessage(error.message || "تعذر إنشاء الحساب.");
        return;
      }

      if (data.session) {
        router.push("/onboarding");
        router.refresh();
        return;
      }

      setStatus("success");
      setMessage("تم إنشاء الحساب. افتحي الإيميل لتأكيده وبعدها سجلي دخول وكملي إنشاء الفرع الأول.");
    } catch {
      setStatus("error");
      setMessage("حصلت مشكلة أثناء إنشاء الحساب.");
    }
  }

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <div className="section-header">
        <div>
          <h2 className="section-title">إنشاء حساب</h2>
          <p className="section-copy">حساب واحد تقدري تديري منه أكتر من أتيليه أو فرع.</p>
        </div>
        <SparklesIcon />
      </div>

      <div className="field-block">
        <Field label="الاسم">
          <div className="search-wrap">
            <UserIcon className="search-icon" />
            <input
              className="search-field"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="اسم صاحبة الأتيليه"
            />
          </div>
        </Field>

        <Field label="الإيميل">
          <div className="search-wrap">
            <UserIcon className="search-icon" />
            <input
              className="search-field"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </div>
        </Field>

        <Field label="كلمة المرور">
          <div className="search-wrap">
            <LockIcon className="search-icon" />
            <input
              className="search-field"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="اكتبي كلمة مرور قوية"
            />
          </div>
        </Field>
      </div>

      {status === "success" ? (
        <div className="alert-box success" style={{ marginTop: 16 }}>
          {message}
        </div>
      ) : null}

      {status === "error" ? (
        <div className="alert-box error" style={{ marginTop: 16 }}>
          {message}
        </div>
      ) : null}

      <div className="inline-actions" style={{ marginTop: 24 }}>
        <button type="submit" className="pill-button primary">
          {status === "loading" ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
        </button>
      </div>

      <div className="login-footer">
        عندك حساب بالفعل؟ <Link href="/login">سجلي دخول</Link>
      </div>
    </form>
  );
}
