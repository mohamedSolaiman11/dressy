import { redirect } from "next/navigation";
import { SignupForm } from "@/components/signup-form";
import { atelierProfile } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="login-screen">
      <div className="login-wrap">
        <section className="login-brand">
          <div className="brand-mark">ر</div>
          <h1>{atelierProfile.name}</h1>
          <p>
            حساب واحد يقدر يدير أكتر من أتيليه أو فرع.
            <br />
            سجلي مرة واحدة وبعدها أضيفي الفروع اللي تشتغلي عليها.
          </p>
        </section>

        <SignupForm />
      </div>
    </main>
  );
}
