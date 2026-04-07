import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { atelierProfile } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
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
            سيستم عربي بسيط لصاحبة الأتيليه.
            <br />
            الحجوزات والفساتين والعملاء في مكان واحد ومن غير تعقيد.
          </p>
        </section>

        <LoginForm />
      </div>
    </main>
  );
}
