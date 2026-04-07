"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Field } from "@/components/ui";
import { LockIcon, SparklesIcon, UserIcon } from "@/components/icons";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setStatus("error");
        setMessage("الإيميل أو كلمة المرور مش صح.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("حصلت مشكلة في تسجيل الدخول. جربي تاني.");
    }
  }

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <div className="section-header">
        <div>
          <h2 className="section-title">تسجيل دخول</h2>
          <p className="section-copy">ادخلي بالإيميل والباسورد علشان تفتحي بيانات الأتيليه.</p>
        </div>
        <SparklesIcon />
      </div>

      <div className="field-block">
        <Field label="الإيميل">
          <div className="search-wrap">
            <UserIcon className="search-icon" />
            <input
              className="search-field"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setStatus("idle");
                setMessage("");
              }}
            />
          </div>
        </Field>

        <Field label="كلمة المرور">
          <div className="search-wrap">
            <LockIcon className="search-icon" />
            <input
              className="search-field"
              type="password"
              autoComplete="current-password"
              placeholder="اكتبي كلمة المرور"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setStatus("idle");
                setMessage("");
              }}
            />
          </div>
        </Field>
      </div>

      {status === "error" ? (
        <div className="alert-box error" style={{ marginTop: 16 }}>
          {message}
        </div>
      ) : null}

      <div className="inline-actions" style={{ marginTop: 24 }}>
        <button type="submit" className="pill-button primary">
          {status === "loading" ? "جاري الدخول..." : "دخول"}
        </button>
      </div>

      <div className="login-footer">
        أول مرة؟ <Link href="/signup">إنشاء حساب جديد</Link>
      </div>
    </form>
  );
}
